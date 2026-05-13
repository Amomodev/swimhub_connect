from flask import Blueprint, request, jsonify, send_file
from models import db, User, Creneau, Absence, Remplacement, Member
import io
import csv
from datetime import datetime

export_bp = Blueprint('export', __name__)


@export_bp.route('/api/export/hours', methods=['GET'])
def export_hours():
    """Export des heures travaillées par éducateur par mois"""
    month = request.args.get('month', type=int)  # 1-12
    year = request.args.get('year', type=int)
    format_type = request.args.get('format', 'csv')  # 'csv' ou 'json'

    if not month or not year:
        now = datetime.utcnow()
        month = month or now.month
        year = year or now.year

    # Récupérer tous les éducateurs
    users = User.query.all()
    report = []

    for user in users:
        # Compter les créneaux hebdomadaires
        creneaux = Creneau.query.filter_by(educator_id=user.id).all()
        weekly_hours = 0
        for c in creneaux:
            start_parts = c.start_time.split(':')
            end_parts = c.end_time.split(':')
            start_minutes = int(start_parts[0]) * 60 + int(start_parts[1])
            end_minutes = int(end_parts[0]) * 60 + int(end_parts[1])
            weekly_hours += (end_minutes - start_minutes) / 60

        # Approximer les heures mensuelles (4.33 semaines par mois)
        monthly_hours = round(weekly_hours * 4.33, 2)

        # Compter les absences du mois
        date_prefix = f"{year}-{month:02d}"
        absences = Absence.query.filter(
            Absence.educator_id == user.id,
            Absence.date.like(f"{date_prefix}%")
        ).all()
        absence_count = len(absences)

        # Compter les remplacements effectués
        remplacements = Remplacement.query.filter_by(
            volunteer_id=user.id, status='approved'
        ).all()
        # Filtrer par mois
        replacement_count = 0
        for r in remplacements:
            if r.absence and r.absence.date.startswith(date_prefix):
                replacement_count += 1

        # Calculer les heures d'absence
        absence_hours = 0
        for a in absences:
            creneau = a.creneau
            if creneau:
                start_parts = creneau.start_time.split(':')
                end_parts = creneau.end_time.split(':')
                start_minutes = int(start_parts[0]) * 60 + int(start_parts[1])
                end_minutes = int(end_parts[0]) * 60 + int(end_parts[1])
                absence_hours += (end_minutes - start_minutes) / 60

        report.append({
            'educator_id': user.id,
            'educator_name': f"{user.firstname} {user.lastname}",
            'monthly_hours_planned': monthly_hours,
            'absence_count': absence_count,
            'absence_hours': round(absence_hours, 2),
            'replacement_count': replacement_count,
            'effective_hours': round(monthly_hours - absence_hours, 2)
        })

    if format_type == 'csv':
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            'educator_name', 'monthly_hours_planned', 'absence_count',
            'absence_hours', 'replacement_count', 'effective_hours'
        ])
        writer.writeheader()
        for row in report:
            writer.writerow({k: v for k, v in row.items() if k != 'educator_id'})

        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f"heures_{year}-{month:02d}.csv"
        )

    return jsonify({
        'month': month,
        'year': year,
        'report': report
    })