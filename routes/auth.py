from flask import Blueprint, request, jsonify
from models import db, User, Member, Club

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.password == password:
        return jsonify({
            "status": "success",
            "access_token": f"token-{user.id}",
            "user_info": {
                "id": user.id,
                "firstname": user.firstname,
                "lastname": user.lastname,
                "email": user.email
            }
        })
    else:
        return jsonify({"message": "Email ou mot de passe incorrect"}), 401


@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()

    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    password = data.get('password')

    if not all([firstname, lastname, email, password]):
        return jsonify({"message": "Tous les champs sont requis"}), 400

    # Vérifier si l'email existe déjà
    check_user = User.query.filter_by(email=email).first()
    if check_user:
        return jsonify({"message": "Cet email est déjà pris"}), 400

    new_user = User(firstname=firstname, lastname=lastname, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "Compte créé avec succès !",
        "access_token": f"token-{new_user.id}",
        "user_info": {
            "id": new_user.id,
            "firstname": new_user.firstname,
            "lastname": new_user.lastname,
            "email": new_user.email
        }
    }), 201


@auth_bp.route('/api/users', methods=['GET'])
def get_users():
    """Liste tous les éducateurs (potentiellement pour l'admin d'un club)"""
    club_id = request.args.get('club_id', type=int)
    
    if club_id:
        # Filtrer les utilisateurs par club
        members = Member.query.filter_by(club_id=club_id).all()
        user_ids = [m.user_id for m in members]
        users = User.query.filter(User.id.in_(user_ids)).all()
        
        result = []
        for u in users:
            affiliation = next((m for m in members if m.user_id == u.id), None)
            result.append({
                **u.to_dict(),
                'rank': affiliation.rank if affiliation else 'guest',
                'status': affiliation.status if affiliation else 'none'
            })
        return jsonify(result)
        
    # Sans club_id, liste basique
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])
