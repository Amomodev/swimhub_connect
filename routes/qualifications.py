from flask import Blueprint, request, jsonify
from models import db, Qualification, UserQualification, GroupeQualification

qualifications_bp = Blueprint('qualifications', __name__)


# ============================================================
# CRUD Qualifications (types de diplômes)
# ============================================================
@qualifications_bp.route('/api/qualifications', methods=['GET'])
def get_qualifications():
    qualifs = Qualification.query.all()
    return jsonify([q.to_dict() for q in qualifs])


@qualifications_bp.route('/api/qualifications', methods=['POST'])
def create_qualification():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')

    if not name:
        return jsonify({"message": "Nom requis"}), 400

    existing = Qualification.query.filter_by(name=name).first()
    if existing:
        return jsonify({"message": "Cette qualification existe déjà"}), 400

    qualif = Qualification(name=name, description=description)
    db.session.add(qualif)
    db.session.commit()

    return jsonify(qualif.to_dict()), 201


@qualifications_bp.route('/api/qualifications/<int:id>', methods=['PUT'])
def update_qualification(id):
    qualif = Qualification.query.get_or_404(id)
    data = request.get_json()

    qualif.name = data.get('name', qualif.name)
    qualif.description = data.get('description', qualif.description)
    db.session.commit()

    return jsonify(qualif.to_dict())


@qualifications_bp.route('/api/qualifications/<int:id>', methods=['DELETE'])
def delete_qualification(id):
    qualif = Qualification.query.get_or_404(id)
    UserQualification.query.filter_by(qualification_id=id).delete()
    GroupeQualification.query.filter_by(qualification_id=id).delete()
    db.session.delete(qualif)
    db.session.commit()
    return jsonify({"message": "Qualification supprimée"}), 200


# ============================================================
# Qualifications d'un éducateur
# ============================================================
@qualifications_bp.route('/api/user-qualifications', methods=['GET'])
def get_user_qualifications():
    user_id = request.args.get('user_id', type=int)
    if user_id:
        uqs = UserQualification.query.filter_by(user_id=user_id).all()
    else:
        uqs = UserQualification.query.all()
    return jsonify([uq.to_dict() for uq in uqs])


@qualifications_bp.route('/api/user-qualifications', methods=['POST'])
def add_user_qualification():
    data = request.get_json()
    user_id = data.get('user_id')
    qualification_id = data.get('qualification_id')

    if not user_id or not qualification_id:
        return jsonify({"message": "user_id et qualification_id requis"}), 400

    # Vérifier le doublon
    existing = UserQualification.query.filter_by(
        user_id=user_id, qualification_id=qualification_id
    ).first()
    if existing:
        return jsonify({"message": "Qualification déjà attribuée"}), 400

    uq = UserQualification(user_id=user_id, qualification_id=qualification_id)
    db.session.add(uq)
    db.session.commit()

    return jsonify(uq.to_dict()), 201


@qualifications_bp.route('/api/user-qualifications/<int:id>', methods=['DELETE'])
def remove_user_qualification(id):
    uq = UserQualification.query.get_or_404(id)
    db.session.delete(uq)
    db.session.commit()
    return jsonify({"message": "Qualification retirée"}), 200


# ============================================================
# Qualifications requises par groupe
# ============================================================
@qualifications_bp.route('/api/groupe-qualifications', methods=['GET'])
def get_groupe_qualifications():
    groupe_id = request.args.get('groupe_id', type=int)
    if groupe_id:
        gqs = GroupeQualification.query.filter_by(groupe_id=groupe_id).all()
    else:
        gqs = GroupeQualification.query.all()
    return jsonify([gq.to_dict() for gq in gqs])


@qualifications_bp.route('/api/groupe-qualifications', methods=['POST'])
def add_groupe_qualification():
    data = request.get_json()
    groupe_id = data.get('groupe_id')
    qualification_id = data.get('qualification_id')

    if not groupe_id or not qualification_id:
        return jsonify({"message": "groupe_id et qualification_id requis"}), 400

    gq = GroupeQualification(groupe_id=groupe_id, qualification_id=qualification_id)
    db.session.add(gq)
    db.session.commit()

    return jsonify(gq.to_dict()), 201
