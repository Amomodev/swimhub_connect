from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# ============================================================
# MODELE UTILISATEUR
# ============================================================
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(50), nullable=False)
    lastname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

    # Relations
    affiliations = db.relationship('Member', backref='user', lazy=True)
    qualifications = db.relationship('UserQualification', backref='user', lazy=True)
    creneaux = db.relationship('Creneau', backref='educator', lazy=True)
    absences = db.relationship('Absence', backref='educator', lazy=True)
    remplacements = db.relationship('Remplacement', foreign_keys='Remplacement.volunteer_id', backref='volunteer', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'firstname': self.firstname,
            'lastname': self.lastname,
            'email': self.email
        }


# ============================================================
# MODELE CLUB
# ============================================================
class Club(db.Model):
    __tablename__ = 'club'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

    # Relations
    members = db.relationship('Member', backref='club', lazy=True)
    piscines = db.relationship('Piscine', backref='club', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


# ============================================================
# MODELE ROLE (Custom Roles for RBAC)
# ============================================================
class Role(db.Model):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True)
    club_id = db.Column(db.Integer, db.ForeignKey('club.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    permissions = db.Column(db.Text, default='[]')  # JSON string of permissions

    members = db.relationship('Member', backref='role', lazy=True)

    def to_dict(self):
        import json
        try:
            perms = json.loads(self.permissions)
        except:
            perms = []
        return {
            'id': self.id,
            'club_id': self.club_id,
            'name': self.name,
            'permissions': perms
        }

# ============================================================
# MODELE MEMBER (liaison User <-> Club avec rôle)
# ============================================================
class Member(db.Model):
    __tablename__ = 'member'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('club.id'), nullable=False)
    rank = db.Column(db.String(50), default='educ')  # keep for legacy fallback 'admin' ou 'educ'
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=True) # Custom role
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'club_id': self.club_id,
            'rank': self.rank,
            'role_id': self.role_id,
            'role_name': self.role.name if self.role else None,
            'status': self.status
        }


# ============================================================
# MODELE PISCINE
# ============================================================
class Piscine(db.Model):
    __tablename__ = 'piscine'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200))
    club_id = db.Column(db.Integer, db.ForeignKey('club.id'), nullable=False)

    # Relations
    groupes = db.relationship('Groupe', backref='piscine', lazy=True)
    creneaux = db.relationship('Creneau', backref='piscine', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'club_id': self.club_id
        }


# ============================================================
# MODELE GROUPE (groupe de natation)
# ============================================================
class Groupe(db.Model):
    __tablename__ = 'groupe'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    level = db.Column(db.String(50))  # ex: 'débutant', 'intermédiaire', 'avancé'
    piscine_id = db.Column(db.Integer, db.ForeignKey('piscine.id'), nullable=False)

    # Relations
    creneaux = db.relationship('Creneau', backref='groupe', lazy=True)
    required_qualifications = db.relationship('GroupeQualification', backref='groupe', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'piscine_id': self.piscine_id,
            'piscine_name': self.piscine.name if self.piscine else None
        }


# ============================================================
# MODELE QUALIFICATION (type de diplôme)
# ============================================================
class Qualification(db.Model):
    __tablename__ = 'qualification'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }


# ============================================================
# MODELE USER_QUALIFICATION (diplômes d'un éducateur)
# ============================================================
class UserQualification(db.Model):
    __tablename__ = 'user_qualification'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    qualification_id = db.Column(db.Integer, db.ForeignKey('qualification.id'), nullable=False)

    qualification = db.relationship('Qualification', backref='user_qualifications')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'qualification_id': self.qualification_id,
            'qualification_name': self.qualification.name if self.qualification else None
        }


# ============================================================
# MODELE GROUPE_QUALIFICATION (diplômes requis par groupe)
# ============================================================
class GroupeQualification(db.Model):
    __tablename__ = 'groupe_qualification'
    id = db.Column(db.Integer, primary_key=True)
    groupe_id = db.Column(db.Integer, db.ForeignKey('groupe.id'), nullable=False)
    qualification_id = db.Column(db.Integer, db.ForeignKey('qualification.id'), nullable=False)

    qualification = db.relationship('Qualification', backref='groupe_qualifications')

    def to_dict(self):
        return {
            'id': self.id,
            'groupe_id': self.groupe_id,
            'qualification_id': self.qualification_id,
            'qualification_name': self.qualification.name if self.qualification else None
        }


# ============================================================
# MODELE CRENEAU (créneau horaire)
# ============================================================
class Creneau(db.Model):
    __tablename__ = 'creneau'
    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.String(20), nullable=False)  # 'lundi', 'mardi', etc.
    start_time = db.Column(db.String(5), nullable=False)  # 'HH:MM'
    end_time = db.Column(db.String(5), nullable=False)  # 'HH:MM'
    groupe_id = db.Column(db.Integer, db.ForeignKey('groupe.id'), nullable=False)
    educator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    piscine_id = db.Column(db.Integer, db.ForeignKey('piscine.id'), nullable=False)

    # Relations
    absences = db.relationship('Absence', backref='creneau', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'day': self.day,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'groupe_id': self.groupe_id,
            'groupe_name': self.groupe.name if self.groupe else None,
            'educator_id': self.educator_id,
            'educator_name': f"{self.educator.firstname} {self.educator.lastname}" if self.educator else None,
            'piscine_id': self.piscine_id,
            'piscine_name': self.piscine.name if self.piscine else None
        }


# ============================================================
# MODELE ABSENCE
# ============================================================
class Absence(db.Model):
    __tablename__ = 'absence'
    id = db.Column(db.Integer, primary_key=True)
    creneau_id = db.Column(db.Integer, db.ForeignKey('creneau.id'), nullable=False)
    educator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.String(10), nullable=False)  # 'YYYY-MM-DD'
    reason = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'replaced', 'unresolved'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relations
    remplacements = db.relationship('Remplacement', backref='absence', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'creneau_id': self.creneau_id,
            'educator_id': self.educator_id,
            'educator_name': f"{self.educator.firstname} {self.educator.lastname}" if self.educator else None,
            'date': self.date,
            'reason': self.reason,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'creneau': self.creneau.to_dict() if self.creneau else None
        }


# ============================================================
# MODELE REMPLACEMENT
# ============================================================
class Remplacement(db.Model):
    __tablename__ = 'remplacement'
    id = db.Column(db.Integer, primary_key=True)
    absence_id = db.Column(db.Integer, db.ForeignKey('absence.id'), nullable=False)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected'
    validated_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    validator = db.relationship('User', foreign_keys=[validated_by])

    def to_dict(self):
        return {
            'id': self.id,
            'absence_id': self.absence_id,
            'volunteer_id': self.volunteer_id,
            'volunteer_name': f"{self.volunteer.firstname} {self.volunteer.lastname}" if self.volunteer else None,
            'status': self.status,
            'validated_by': self.validated_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'absence': self.absence.to_dict() if self.absence else None
        }
