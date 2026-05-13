from flask import Blueprint, request, jsonify
from models import db, Club, Member, User

clubs_bp = Blueprint('clubs', __name__)

@clubs_bp.route('/api/clubs', methods=['GET'])
def get_clubs():
    """Liste tous les clubs"""
    clubs = Club.query.all()
    return jsonify([c.to_dict() for c in clubs])

@clubs_bp.route('/api/clubs', methods=['POST'])
def create_club():
    """Créer un nouveau club et rendre le créateur 'admin' approuvé"""
    data = request.get_json()
    name = data.get('name')
    user_id = data.get('user_id')

    if not name or not user_id:
        return jsonify({"message": "Nom du club et user_id requis"}), 400

    existing_club = Club.query.filter_by(name=name).first()
    if existing_club:
        return jsonify({"message": "Ce nom de club est déjà pris"}), 400

    # 1. Créer le club
    new_club = Club(name=name)
    db.session.add(new_club)
    db.session.commit()

    # 2. Associer l'utilisateur comme admin avec statut 'approved'
    member = Member(user_id=user_id, club_id=new_club.id, rank='admin', status='approved')
    db.session.add(member)
    db.session.commit()

    return jsonify({
        "message": "Club créé avec succès",
        "club": new_club.to_dict(),
        "member_info": member.to_dict()
    }), 201

@clubs_bp.route('/api/my-clubs', methods=['GET'])
def my_clubs():
    """Récupérer la liste des clubs (et leur statut) pour un utilisateur"""
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({"message": "user_id requis"}), 400

    memberships = Member.query.filter_by(user_id=user_id).all()
    
    result = []
    for m in memberships:
        club = Club.query.get(m.club_id)
        if club:
            perms = []
            if m.role:
                import json
                try:
                    perms = json.loads(m.role.permissions)
                except:
                    pass
            result.append({
                "club_id": club.id,
                "club_name": club.name,
                "rank": m.rank,
                "role_id": m.role_id,
                "permissions": perms,
                "status": m.status
            })
    
    return jsonify(result)

@clubs_bp.route('/api/clubs/<int:club_id>/join', methods=['POST'])
def join_club(club_id):
    """Demander à rejoindre un club (statut 'pending')"""
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"message": "user_id requis"}), 400

    # Vérifier l'existence
    club = Club.query.get(club_id)
    if not club:
        return jsonify({"message": "Club introuvable"}), 404

    existing = Member.query.filter_by(user_id=user_id, club_id=club_id).first()
    if existing:
        return jsonify({"message": "Vous êtes déjà affilié ou avez une demande en cours."}), 400

    member = Member(user_id=user_id, club_id=club_id, rank='educ', status='pending')
    db.session.add(member)
    db.session.commit()

    return jsonify({"message": "Demande envoyée", "status": "pending"}), 201

@clubs_bp.route('/api/clubs/<int:club_id>/requests', methods=['GET'])
def get_club_requests(club_id):
    """Obtenir les demandes d'accès en attente ('pending') ou approuvées"""
    status_filter = request.args.get('status')
    
    query = Member.query.filter_by(club_id=club_id)
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    requests = query.all()
    
    result = []
    for r in requests:
        user = User.query.get(r.user_id)
        if user:
            result.append({
                "member_id": r.id,
                "user_id": user.id,
                "firstname": user.firstname,
                "lastname": user.lastname,
                "email": user.email,
                "rank": r.rank,
                "status": r.status
            })
            
    return jsonify(result)

@clubs_bp.route('/api/clubs/<int:club_id>/members/<int:user_id>/status', methods=['PUT'])
def update_member_status(club_id, user_id):
    """Approuver, refuser ou changer le rôle d'un membre"""
    data = request.get_json()
    new_status = data.get('status') # 'approved' or 'rejected'
    new_rank = data.get('rank')     # optional

    member = Member.query.filter_by(club_id=club_id, user_id=user_id).first()
    if not member:
        return jsonify({"message": "Membre introuvable"}), 404

    if new_status:
        member.status = new_status
    if new_rank:
        member.rank = new_rank

    db.session.commit()

    return jsonify(member.to_dict()), 200
