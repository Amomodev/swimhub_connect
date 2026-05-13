from flask import Blueprint, request, jsonify
from models import db, Absence, Creneau

absences_bp = Blueprint('absences', __name__)


@absences_bp.route('/api/absences', methods=['GET'])
def get_absences():
    educator_id = request.args.get('educator_id', type=int)
    status = request.args.get('status')

    query = Absence.query
    if educator_id:
        query = query.filter_by(educator_id=educator_id)
    if status:
        query = query.filter_by(status=status)

    absences = query.order_by(Absence.created_at.desc()).all()
    return jsonify([a.to_dict() for a in absences])


@absences_bp.route('/api/absences', methods=['POST'])
def create_absence():
    data = request.get_json()
    creneau_id = data.get('creneau_id')
    educator_id = data.get('educator_id')
    date = data.get('date')
    reason = data.get('reason', '')

    if not all([creneau_id, educator_id, date]):
        return jsonify({"message": "creneau_id, educator_id et date requis"}), 400

    # Vérifier que le créneau appartient bien à cet éducateur
    creneau = Creneau.query.get(creneau_id)
    if not creneau:
        return jsonify({"message": "Créneau introuvable"}), 404
    if creneau.educator_id != educator_id:
        return jsonify({"message": "Ce créneau ne vous appartient pas"}), 403

    # Vérifier qu'il n'y a pas déjà une absence pour ce créneau à cette date
    existing = Absence.query.filter_by(
        creneau_id=creneau_id, date=date
    ).first()
    if existing:
        return jsonify({"message": "Absence déjà déclarée pour ce créneau à cette date"}), 400

    absence = Absence(
        creneau_id=creneau_id,
        educator_id=educator_id,
        date=date,
        reason=reason,
        status='pending'
    )
    db.session.add(absence)
    db.session.commit()

    return jsonify(absence.to_dict()), 201


@absences_bp.route('/api/absences/<int:id>', methods=['DELETE'])
def delete_absence(id):
    absence = Absence.query.get_or_404(id)
    db.session.delete(absence)
    db.session.commit()
    return jsonify({"message": "Absence supprimée"}), 200
