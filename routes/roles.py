from flask import Blueprint, request, jsonify
from models import db, Role, Member
import json

roles_bp = Blueprint('roles', __name__)

@roles_bp.route('/api/clubs/<int:club_id>/roles', methods=['GET'])
def get_roles(club_id):
    roles = Role.query.filter_by(club_id=club_id).all()
    return jsonify([r.to_dict() for r in roles])

@roles_bp.route('/api/clubs/<int:club_id>/roles', methods=['POST'])
def create_role(club_id):
    data = request.get_json()
    name = data.get('name')
    permissions = data.get('permissions', [])
    
    if not name:
        return jsonify({"message": "Le nom du rôle est requis"}), 400
        
    role = Role(club_id=club_id, name=name, permissions=json.dumps(permissions))
    db.session.add(role)
    db.session.commit()
    return jsonify(role.to_dict()), 201

@roles_bp.route('/api/roles/<int:role_id>', methods=['DELETE'])
def delete_role(role_id):
    role = Role.query.get_or_404(role_id)
    # Remove role from members before deleting
    members = Member.query.filter_by(role_id=role_id).all()
    for m in members:
        m.role_id = None
    db.session.delete(role)
    db.session.commit()
    return jsonify({"message": "Rôle supprimé"})

@roles_bp.route('/api/members/<int:member_id>/role', methods=['PUT'])
def assign_role(member_id):
    data = request.get_json()
    role_id = data.get('role_id')  # can be None
    
    member = Member.query.get_or_404(member_id)
    if role_id:
        role = Role.query.get(role_id)
        if not role or role.club_id != member.club_id:
            return jsonify({"message": "Rôle invalide pour ce club"}), 400
    
    member.role_id = role_id
    db.session.commit()
    return jsonify(member.to_dict())
