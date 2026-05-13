import sqlite3

def upgrade_db():
    print("Mise à jour de la base de données...")
    conn = sqlite3.connect('instance/swimhub.db')
    cursor = conn.cursor()
    
    # Créer la table Role si elle n'existe pas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS role (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            club_id INTEGER NOT NULL,
            name VARCHAR(100) NOT NULL,
            permissions TEXT DEFAULT '[]',
            FOREIGN KEY(club_id) REFERENCES club(id)
        )
    ''')
    
    # Vérifier si la colonne role_id existe dans la table member
    cursor.execute("PRAGMA table_info(member)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'role_id' not in columns:
        print("Ajout de la colonne role_id à member...")
        cursor.execute("ALTER TABLE member ADD COLUMN role_id INTEGER REFERENCES role(id)")
    
    conn.commit()
    conn.close()
    print("Terminé !")

if __name__ == '__main__':
    upgrade_db()
