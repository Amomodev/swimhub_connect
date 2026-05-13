import pandas as pd
from flask import Blueprint, request, jsonify, send_file
from models import db, Club, Piscine, Groupe, Creneau, User
import os
import io

import_excel_bp = Blueprint('import_excel', __name__)

@import_excel_bp.route('/api/export/template', methods=['GET'])
def get_template():
    """Génère et renvoie le fichier Excel modèle vierge pour l'import"""
    df = pd.DataFrame(columns=['Jour', 'Heure_Debut', 'Heure_Fin', 'Piscine', 'Groupe', 'Educateur_Email'])
    
    # Exemples
    df.loc[0] = ['Lundi', '17:00', '18:30', 'Piscine Municipale', 'Avenirs 1', 'jean@club.fr']
    df.loc[1] = ['Mercredi', '14:00', '15:30', 'Centre Aquatique', 'Loisirs Ados', 'marie@club.fr']
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Planning')
    
    output.seek(0)
    return send_file(
        output,
        download_name='template_horaires.xlsx',
        as_attachment=True,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@import_excel_bp.route('/api/clubs/<int:club_id>/import-schedule', methods=['POST'])
def import_schedule(club_id):
    if 'file' not in request.files:
        return jsonify({"message": "Aucun fichier fourni"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "Aucun fichier sélectionné"}), 400
        
    if not file.filename.endswith(('.xlsx', '.xls')):
        return jsonify({"message": "Le fichier doit être au format Excel (.xlsx ou .xls)"}), 400

    try:
        df = pd.read_excel(file)
        
        required_cols = ['Jour', 'Heure_Debut', 'Heure_Fin', 'Piscine', 'Groupe', 'Educateur_Email']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return jsonify({"message": f"Colonnes manquantes : {', '.join(missing_cols)}"}), 400

        created_count = 0
        errors = []

        for index, row in df.iterrows():
            jour = str(row['Jour']).strip().capitalize()
            start = str(row['Heure_Debut']).strip()
            end = str(row['Heure_Fin']).strip()
            piscine_name = str(row['Piscine']).strip()
            groupe_name = str(row['Groupe']).strip()
            email = str(row['Educateur_Email']).strip().lower()
            
            if not (jour and start and end and piscine_name and groupe_name):
                continue

            # 1. Trouver ou créer la piscine
            piscine = Piscine.query.filter_by(club_id=club_id, name=piscine_name).first()
            if not piscine:
                piscine = Piscine(name=piscine_name, club_id=club_id)
                db.session.add(piscine)
                db.session.commit() # commit needed to get ID
                
            # 2. Trouver ou créer le groupe (lié à la piscine)
            groupe = Groupe.query.filter_by(piscine_id=piscine.id, name=groupe_name).first()
            if not groupe:
                groupe = Groupe(name=groupe_name, piscine_id=piscine.id)
                db.session.add(groupe)
                db.session.commit()
                
            # 3. Trouver l'éducateur
            educator = User.query.filter_by(email=email).first()
            if not educator:
                errors.append(f"Ligne {index+2} : L'email {email} n'existe pas dans le système.")
                continue
                
            # 4. Créer le créneau s'il n'existe pas déjà (pour éviter les doublons)
            existing_creneau = Creneau.query.filter_by(
                day=jour, start_time=start, end_time=end, 
                groupe_id=groupe.id, educator_id=educator.id, piscine_id=piscine.id
            ).first()
            
            if not existing_creneau:
                creneau = Creneau(
                    day=jour, start_time=start, end_time=end,
                    groupe_id=groupe.id, educator_id=educator.id, piscine_id=piscine.id
                )
                db.session.add(creneau)
                created_count += 1
                
        db.session.commit()
        
        return jsonify({
            "message": f"Import terminé. {created_count} créneaux ajoutés.",
            "errors": errors
        }), 200

    except Exception as e:
        return jsonify({"message": f"Erreur lors du traitement du fichier: {str(e)}"}), 500