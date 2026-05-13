from flask import Blueprint, request, jsonify
from models import db, Remplacement, Absence, UserQualification, GroupeQualification, Creneau

remplacements_bp = Blueprint('remplacements', __name__)


@remplacements_bp.route('/api/remplacements', methods=['GET'])
def get_remplacements():
    volunteer_id = request.args.get('volunteer_id', type=int)
    status = request.args.get('status')

    query = Remplacement.query
    if volunteer_id:
        query = query.filter_by(volunteer_id=volunteer_id)
    if status:
        query = query.filter_by(status=status)

    remplacements = query.order_by(Remplacement.created_at.desc()).all()
    return jsonify([r.to_dict() for r in remplacements])


@remplacements_bp.route('/api/remplacements/available', methods=['GET'])
def get_available_replacements():
    """Retourne les absences disponibles pour lesquelles l'éducateur est qualifié"""
    user_id = request.args.get('user_id', type=int)

    if not user_id:
        return jsonify({"message": "user_id requis"}), 400

    # Récupérer les qualifications de l'éducateur
    user_qualifs = UserQualification.query.filter_by(user_id=user_id).all()
    user_qualif_ids = set(uq.qualification_id for uq in user_qualifs)

    # Récupérer les absences en attente
    pending_absences = Absence.query.filter_by(status='pending').all()

    available = []
    for absence in pending_absences:
        # Ne pas proposer ses propres absences
        if absence.educator_id == user_id:
            continue

        # Vérifier si l'utilisateur a déjà candidaté
        existing = Remplacement.query.filter_by(
            absence_id=absence.id, volunteer_id=user_id
        ).first()
        if existing:
            continue

        # Vérifier les qualifications requises
        creneau = absence.creneau
        if creneau and creneau.groupe:
            required_qualifs = GroupeQualification.query.filter_by(
                groupe_id=creneau.groupe_id
            ).all()
            required_ids = set(gq.qualification_id for gq in required_qualifs)

            # L'éducateur doit avoir toutes les qualifications requises
            if required_ids and not required_ids.issubset(user_qualif_ids):
                continue

        available.append(absence.to_dict())

    return jsonify(available)


@remplacements_bp.route('/api/remplacements', methods=['POST'])
def create_remplacement():
    data = request.get_json()
    absence_id = data.get('absence_id')
    volunteer_id = data.get('volunteer_id')

    if not all([absence_id, volunteer_id]):
        return jsonify({"message": "absence_id et volunteer_id requis"}), 400

    # Vérifier que l'absence existe et est en attente
    absence = Absence.query.get(absence_id)
    if not absence:
        return jsonify({"message": "Absence introuvable"}), 404
    if absence.status == 'replaced':
        return jsonify({"message": "Cette absence a déjà été remplacée"}), 400

    # Vérifier le doublon
    existing = Remplacement.query.filter_by(
        absence_id=absence_id, volunteer_id=volunteer_id
    ).first()
    if existing:
        return jsonify({"message": "Vous avez déjà candidaté pour ce remplacement"}), 400

    remplacement = Remplacement(
        absence_id=absence_id,
        volunteer_id=volunteer_id,
        status='pending'
    )
    db.session.add(remplacement)
    db.session.commit()

    return jsonify(remplacement.to_dict()), 201


@remplacements_bp.route('/api/remplacements/<int:id>/validate', methods=['PUT'])
def validate_remplacement(id):
    """Admin approuve ou refuse un remplacement"""
    data = request.get_json()
    action = data.get('action')  # 'approve' ou 'reject'
    admin_id = data.get('admin_id')

    if action not in ['approve', 'reject']:
        return jsonify({"message": "Action doit être 'approve' ou 'reject'"}), 400

    remplacement = Remplacement.query.get_or_404(id)

    if action == 'approve':
        remplacement.status = 'approved'
        remplacement.validated_by = admin_id

        # Marquer l'absence comme remplacée
        absence = Absence.query.get(remplacement.absence_id)
        if absence:
            absence.status = 'replaced'

        # Rejeter les autres candidatures pour cette absence
        other_candidates = Remplacement.query.filter(
            Remplacement.absence_id == remplacement.absence_id,
            Remplacement.id != id,
            Remplacement.status == 'pending'
        ).all()
        for other in other_candidates:
            other.status = 'rejected'

    elif action == 'reject':
        remplacement.status = 'rejected'
        remplacement.validated_by = admin_id

    db.session.commit()
    return jsonify(remplacement.to_dict())
