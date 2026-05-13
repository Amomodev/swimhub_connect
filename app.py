from flask import Flask
from flask_cors import CORS
from models import db

# Import des blueprints
from routes.auth import auth_bp
from routes.clubs import clubs_bp
from routes.piscines import piscines_bp
from routes.groupes import groupes_bp
from routes.qualifications import qualifications_bp
from routes.creneaux import creneaux_bp
from routes.absences import absences_bp
from routes.remplacements import remplacements_bp
from routes.export import export_bp
from routes.roles import roles_bp
from routes.import_excel import import_excel_bp

app = Flask(__name__)
CORS(app)

# Configuration de la base de données
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///swimhub.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialiser la BDD avec l'app
db.init_app(app)

# Enregistrer les blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(clubs_bp)
app.register_blueprint(piscines_bp)
app.register_blueprint(groupes_bp)
app.register_blueprint(qualifications_bp)
app.register_blueprint(creneaux_bp)
app.register_blueprint(absences_bp)
app.register_blueprint(remplacements_bp)
app.register_blueprint(export_bp)
app.register_blueprint(roles_bp)
app.register_blueprint(import_excel_bp)


def seed_demo_data():
    """Crée des données de démonstration si la BDD est vide"""
    from models import User, Club, Member, Piscine, Groupe, Qualification, UserQualification, Creneau

    # On ne crée plus d'éducateurs par défaut pour vous laisser tester
    print("🌱 Graine ignorée : La base de données est prête pour une administration propre.")


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_demo_data()
        print("\n>> SwimHub Connect API démarree sur http://localhost:5000")
    app.run(debug=True, port=5000)