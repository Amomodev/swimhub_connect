from flask import Blueprint, request, jsonify
from models import db, Piscine

piscines_bp = Blueprint('piscines', __name__)


@piscines_bp.route('/api/piscines', methods=['GET'])
def get_piscines():
    club_id = request.args.get('club_id', type=int)
    if club_id:
        piscines = Piscine.query.filter_by(club_id=club_id).all()
    else:
        piscines = Piscine.query.all()
    return jsonify([p.to_dict() for p in piscines])


@piscines_bp.route('/api/piscines', methods=['POST'])
def create_piscine():
    data = request.get_json()
    name = data.get('name')
    address = data.get('address', '')
    club_id = data.get('club_id')

    if not name or not club_id:
        return jsonify({"message": "Nom et club_id requis"}), 400

    piscine = Piscine(name=name, address=address, club_id=club_id)
    db.session.add(piscine)
    db.session.commit()

    return jsonify(piscine.to_dict()), 201


@piscines_bp.route('/api/piscines/<int:id>', methods=['PUT'])
def update_piscine(id):
    piscine = Piscine.query.get_or_404(id)
    data = request.get_json()

    piscine.name = data.get('name', piscine.name)
    piscine.address = data.get('address', piscine.address)
    db.session.commit()

    return jsonify(piscine.to_dict())


@piscines_bp.route('/api/piscines/<int:id>', methods=['DELETE'])
def delete_piscine(id):
    piscine = Piscine.query.get_or_404(id)
    db.session.delete(piscine)
    db.session.commit()
    return jsonify({"message": "Piscine supprimée"}), 200
