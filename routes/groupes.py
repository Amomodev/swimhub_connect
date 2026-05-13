from flask import Blueprint, request, jsonify
from models import db, Groupe, GroupeQualification

groupes_bp = Blueprint('groupes', __name__)


@groupes_bp.route('/api/groupes', methods=['GET'])
def get_groupes():
    piscine_id = request.args.get('piscine_id', type=int)
    if piscine_id:
        groupes = Groupe.query.filter_by(piscine_id=piscine_id).all()
    else:
        groupes = Groupe.query.all()
    return jsonify([g.to_dict() for g in groupes])


@groupes_bp.route('/api/groupes', methods=['POST'])
def create_groupe():
    data = request.get_json()
    name = data.get('name')
    level = data.get('level', '')
    piscine_id = data.get('piscine_id')

    if not name or not piscine_id:
        return jsonify({"message": "Nom et piscine_id requis"}), 400

    groupe = Groupe(name=name, level=level, piscine_id=piscine_id)
    db.session.add(groupe)
    db.session.commit()

    # Ajouter les qualifications requises si fournies
    qualif_ids = data.get('qualification_ids', [])
    for qid in qualif_ids:
        gq = GroupeQualification(groupe_id=groupe.id, qualification_id=qid)
        db.session.add(gq)
    db.session.commit()

    return jsonify(groupe.to_dict()), 201


@groupes_bp.route('/api/groupes/<int:id>', methods=['PUT'])
def update_groupe(id):
    groupe = Groupe.query.get_or_404(id)
    data = request.get_json()

    groupe.name = data.get('name', groupe.name)
    groupe.level = data.get('level', groupe.level)
    groupe.piscine_id = data.get('piscine_id', groupe.piscine_id)
    db.session.commit()

    return jsonify(groupe.to_dict())


@groupes_bp.route('/api/groupes/<int:id>', methods=['DELETE'])
def delete_groupe(id):
    groupe = Groupe.query.get_or_404(id)
    # Supprimer les qualifications liées
    GroupeQualification.query.filter_by(groupe_id=id).delete()
    db.session.delete(groupe)
    db.session.commit()
    return jsonify({"message": "Groupe supprimé"}), 200