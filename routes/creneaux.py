from flask import Blueprint, request, jsonify
from models import db, Creneau

creneaux_bp = Blueprint('creneaux', __name__)


@creneaux_bp.route('/api/creneaux', methods=['GET'])
def get_creneaux():
    piscine_id = request.args.get('piscine_id', type=int)
    educator_id = request.args.get('educator_id', type=int)
    day = request.args.get('day')

    query = Creneau.query
    if piscine_id:
        query = query.filter_by(piscine_id=piscine_id)
    if educator_id:
        query = query.filter_by(educator_id=educator_id)
    if day:
        query = query.filter_by(day=day)

    creneaux = query.all()
    return jsonify([c.to_dict() for c in creneaux])


@creneaux_bp.route('/api/creneaux/week', methods=['GET'])
def get_week_creneaux():
    """Vue hebdomadaire groupée par jour"""
    piscine_id = request.args.get('piscine_id', type=int)
    educator_id = request.args.get('educator_id', type=int)

    query = Creneau.query
    if piscine_id:
        query = query.filter_by(piscine_id=piscine_id)
    if educator_id:
        query = query.filter_by(educator_id=educator_id)

    creneaux = query.order_by(Creneau.start_time).all()

    days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    week = {}
    for day in days:
        week[day] = [c.to_dict() for c in creneaux if c.day == day]

    return jsonify(week)


@creneaux_bp.route('/api/creneaux', methods=['POST'])
def create_creneau():
    data = request.get_json()

    required = ['day', 'start_time', 'end_time', 'groupe_id', 'educator_id', 'piscine_id']
    for field in required:
        if not data.get(field):
            return jsonify({"message": f"{field} requis"}), 400

    creneau = Creneau(
        day=data['day'],
        start_time=data['start_time'],
        end_time=data['end_time'],
        groupe_id=data['groupe_id'],
        educator_id=data['educator_id'],
        piscine_id=data['piscine_id']
    )
    db.session.add(creneau)
    db.session.commit()

    return jsonify(creneau.to_dict()), 201


@creneaux_bp.route('/api/creneaux/<int:id>', methods=['PUT'])
def update_creneau(id):
    creneau = Creneau.query.get_or_404(id)
    data = request.get_json()

    creneau.day = data.get('day', creneau.day)
    creneau.start_time = data.get('start_time', creneau.start_time)
    creneau.end_time = data.get('end_time', creneau.end_time)
    creneau.groupe_id = data.get('groupe_id', creneau.groupe_id)
    creneau.educator_id = data.get('educator_id', creneau.educator_id)
    creneau.piscine_id = data.get('piscine_id', creneau.piscine_id)
    db.session.commit()

    return jsonify(creneau.to_dict())


@creneaux_bp.route('/api/creneaux/<int:id>', methods=['DELETE'])
def delete_creneau(id):
    creneau = Creneau.query.get_or_404(id)
    db.session.delete(creneau)
    db.session.commit()
    return jsonify({"message": "Créneau supprimé"}), 200