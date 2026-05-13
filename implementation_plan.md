# MVP - SwimHub Connect - Plan d'Implémentation

## Contexte

L'application existante dispose d'un backend Flask basique (User, Club, Member + routes login/signup) et d'un frontend React/Vite avec des pages squelettiques (login, signup, home avec placeholders). L'objectif est de construire le MVP complet selon les maquettes fournies.

## Résumé des changements

> [!IMPORTANT]
> Ce plan est **volumineux** — il couvre le backend complet + le frontend complet. Je propose de procéder **phase par phase** avec vérification entre chaque phase.

---

## Phase 1 : Backend — Modèles & API

### 1.1 Nouveaux modèles SQLAlchemy

#### [MODIFY] [app.py](file:///a:/code/swimmingPool_project/swimhubConnectAITest/app.py)

Restructuration en plusieurs fichiers + ajout des modèles suivants :

| Modèle | Description | Champs clés |
|--------|-------------|-------------|
| **Piscine** | Les piscines du club | `id`, `name`, `address`, `club_id` |
| **Groupe** | Groupes de natation | `id`, `name`, `level`, `piscine_id` |
| **Qualification** | Types de diplômes | `id`, `name`, `description` |
| **UserQualification** | Diplômes d'un éducateur | `user_id`, `qualification_id` |
| **GroupeQualification** | Diplômes requis par groupe | `groupe_id`, `qualification_id` |
| **Creneau** | Créneaux horaires | `id`, `day`, `start_time`, `end_time`, `groupe_id`, `educator_id`, `piscine_id` |
| **Absence** | Déclarations d'absences | `id`, `creneau_id`, `educator_id`, `date`, `reason`, `status` |
| **Remplacement** | Candidatures remplacement | `id`, `absence_id`, `volunteer_id`, `status`, `validated_by` |

### 1.2 Organisation du backend en modules

```
app.py                  ← Point d'entrée (nettoyé)
models.py               ← Tous les modèles SQLAlchemy
routes/
  auth.py               ← Login / Signup
  piscines.py           ← CRUD Piscines
  groupes.py            ← CRUD Groupes
  qualifications.py     ← CRUD Qualifications
  creneaux.py           ← CRUD Créneaux
  absences.py           ← Gestion des absences
  remplacements.py      ← Gestion des remplacements
  export.py             ← Export PDF/Excel
```

### 1.3 Routes API

| Méthode | Route | Description | Accès |
|---------|-------|-------------|-------|
| POST | `/api/login` | Connexion | Public |
| POST | `/api/signup` | Inscription | Public |
| GET/POST | `/api/piscines` | Liste / Créer piscine | Admin |
| PUT/DELETE | `/api/piscines/<id>` | Modifier / Supprimer | Admin |
| GET/POST | `/api/groupes` | Liste / Créer groupe | Admin |
| PUT/DELETE | `/api/groupes/<id>` | Modifier / Supprimer | Admin |
| GET/POST | `/api/qualifications` | Liste / Créer qualification | Admin |
| GET/POST | `/api/user-qualifications` | Diplômes d'un éducateur | Admin |
| GET/POST | `/api/creneaux` | Liste / Créer créneau | Admin (créer), Tous (lire) |
| GET | `/api/creneaux/week` | Vue hebdomadaire | Tous |
| POST | `/api/absences` | Déclarer absence | Éducateur |
| GET | `/api/absences` | Liste des absences | Tous |
| POST | `/api/remplacements` | Candidater | Éducateur |
| PUT | `/api/remplacements/<id>/validate` | Valider/Refuser | Admin |
| GET | `/api/remplacements/available` | Créneaux disponibles (filtrés par qualification) | Éducateur |
| GET | `/api/export/hours` | Export heures (PDF/Excel) | Admin |

---

## Phase 2 : Frontend — Redesign Complet du UI

### 2.1 Design System

#### [MODIFY] [style.css](file:///a:/code/swimmingPool_project/swimhubConnectAITest/frontend/src/style.css)

Nouveau design system avec :
- **Palette** : Fond `#f0f2f5`, cartes blanches, accent bleu `#1a73e8`, texte `#1f2937`
- **Typographie** : Inter (Google Fonts) avec hiérarchie claire
- **Cards** : Bordure subtile, hover elevation, border-radius 12px
- **Animations** : Transitions douces, fade-in au chargement

### 2.2 Page de Login redesignée

#### [MODIFY] [LoginPage.jsx](file:///a:/code/swimmingPool_project/swimhubConnectAITest/frontend/src/pages/loginpage/LoginPage.jsx)
#### [MODIFY] [loginPage.css](file:///a:/code/swimmingPool_project/swimhubConnectAITest/frontend/src/pages/loginpage/loginPage.css)

Selon la maquette `login.png` :
- Centré verticalement/horizontalement
- Card blanche avec ombre douce
- Onglets **Connexion** / **Inscription**
- Labels au-dessus des inputs
- Bouton plein "Se connecter" (dark navy)
- Sous-texte "Accédez à vos plannings et remplacements"
- Stockage du rôle (rank) dans localStorage après login

### 2.3 Dashboard Home — Vue Admin

#### [MODIFY] [Home.jsx](file:///a:/code/swimmingPool_project/swimhubConnectAITest/frontend/src/pages/home/Home.jsx)
#### [MODIFY] [Home.css](file:///a:/code/swimmingPool_project/swimhubConnectAITest/frontend/src/pages/home/Home.css)

Grille de cartes responsive (3 colonnes) selon `Home-Admin.png` :

| Carte | Sous-titre | Description |
|-------|------------|-------------|
| Emploi du temps | Vue hebdomadaire | Visualisez tous les créneaux de la semaine |
| Absences | Gérez vos absences | Déclarez vos absences et consultez les remplacements |
| Remplacements | Postulez aux remplacements | Consultez les absences et postulez pour remplacer |
| Qualifications | Vos diplômes | Liste de vos qualifications et diplômes |
| Piscines | Gérer les piscines | Créez et gérez les piscines du club |
| Groupes | Gérer les groupes | Créez et gérez les groupes de natation |
| Qualifications (admin) | Gérer les diplômes | Créez et gérez les qualifications requises |
| Qualifications éducateurs | Attribuer les diplômes | Gérez les qualifications de chaque éducateur |
| Créneaux horaires | Planifier les sessions | Créez et gérez les créneaux de natation |
| Export | Rapports mensuels | Générez des exports PDF/Excel |
| Validation | Remplacements | Approuvez ou refusez les candidatures |

### 2.4 Dashboard Home — Vue Éducateur

Le même composant `Home.jsx` mais affichant seulement 4 cartes si `rank === 'educ'` :
- Emploi du temps
- Absences
- Remplacements
- Qualifications (mes diplômes)

### 2.5 Navbar redesignée

#### [MODIFY] [UpBar.jsx](file:///a:/code/swimmingPool_project/swimhubConnectAITest/frontend/src/components/Up_bar/UpBar.jsx)
#### [MODIFY] [UpBar.css](file:///a:/code/swimmingPool_project/swimhubConnectAITest/frontend/src/components/Up_bar/UpBar.css)

- Titre "Swim Hub Connect" à gauche en bold
- Sous-titre "Tableau de bord Administrateur/Éducateur"
- Bouton "Déconnexion" stylé à droite (bordure, pas de fill)

---

## Phase 3 : Pages de Fonctionnalités

### 3.1 Nouvelles pages à créer

#### [NEW] `src/pages/schedule/SchedulePage.jsx` — Emploi du temps
- Vue hebdomadaire en grille (lun-dim)
- Filtre par piscine
- Affichage : créneau, groupe, éducateur
- Admin peut ajouter/modifier des créneaux

#### [NEW] `src/pages/absences/AbsencesPage.jsx` — Absences
- Éducateur : formulaire de déclaration (sélection créneau + date + motif)
- Liste des absences déclarées avec statut
- Admin : vue de toutes les absences

#### [NEW] `src/pages/remplacements/RemplacementsPage.jsx` — Remplacements
- Liste des créneaux disponibles (filtrés par qualifications)
- Bouton "Postuler" sur chaque créneau
- Historique de ses candidatures

#### [NEW] `src/pages/qualifications/QualificationsPage.jsx` — Qualifications
- Vue éducateur : liste de ses propres diplômes
- Vue admin : gestion CRUD des types de qualifications

#### [NEW] `src/pages/piscines/PiscinesPage.jsx` — Piscines (Admin)
- Liste des piscines avec adresse
- Formulaire d'ajout/modification
- Suppression avec confirmation

#### [NEW] `src/pages/groupes/GroupesPage.jsx` — Groupes (Admin)
- Liste des groupes liés à une piscine
- Niveau du groupe, qualifications requises

#### [NEW] `src/pages/educator-qualifications/EducatorQualificationsPage.jsx` — Attribution diplômes (Admin)
- Sélection éducateur → affectation des qualifications

#### [NEW] `src/pages/creneaux/CreneauxPage.jsx` — Créneaux horaires (Admin)
- CRUD des créneaux (jour, heure début/fin, groupe, éducateur, piscine)

#### [NEW] `src/pages/export/ExportPage.jsx` — Export (Admin)
- Sélection mois/éducateur
- Boutons "Télécharger PDF" / "Télécharger Excel"
- Aperçu du tableau d'heures

#### [NEW] `src/pages/validation/ValidationPage.jsx` — Validation (Admin)
- Liste des candidatures de remplacement en attente
- Boutons Approuver / Refuser
- Détail du créneau, de l'absent, et du volontaire

### 3.2 Routing mis à jour

#### [MODIFY] [App.jsx](file:///a:/code/swimmingPool_project/swimhubConnectAITest/frontend/src/App.jsx)

Ajout de toutes les nouvelles routes + protection par rôle (admin/educ).

---

## Phase 4 : Finitions

- Toast notifications (connexion réussie, etc.) au lieu d'`alert()`
- Responsive design (mobile-first)
- Suppression du code commenté/mort dans app.py
- Gestion d'erreurs côté frontend (try/catch, loading states)
- Favicon et titre de page corrects

---

## Architecture finale

```
swimhubConnectAITest/
├── app.py                    # Flask entrypoint
├── models.py                 # SQLAlchemy models
├── routes/
│   ├── __init__.py
│   ├── auth.py
│   ├── piscines.py
│   ├── groupes.py
│   ├── qualifications.py
│   ├── creneaux.py
│   ├── absences.py
│   ├── remplacements.py
│   └── export.py
├── instance/
│   └── swimhub.db
└── frontend/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── style.css
        ├── components/
        │   ├── Up_bar/
        │   ├── Toast/
        │   └── ProtectedRoute/
        └── pages/
            ├── loginpage/
            ├── home/
            ├── schedule/
            ├── absences/
            ├── remplacements/
            ├── qualifications/
            ├── piscines/
            ├── groupes/
            ├── educator-qualifications/
            ├── creneaux/
            ├── export/
            └── validation/
```

---

## Ordre d'exécution proposé

1. **Phase 1** — Backend complet (modèles + toutes les routes API)
2. **Phase 2** — Redesign UI (Login + Dashboard + Navbar) 
3. **Phase 3** — Pages de fonctionnalités (une par une)
4. **Phase 4** — Finitions et tests

> [!TIP]
> Chaque phase sera vérifiée avant de passer à la suivante. On pourra tester le backend avec des requêtes et le frontend visuellement dans le navigateur.

## Verification Plan

### Automated Tests
- Lancer `python app.py` et tester chaque route avec des requêtes HTTP
- Lancer `npm run dev` et vérifier visuellement les pages dans le navigateur
- Tester le flow complet : inscription → connexion → dashboard → navigation

### Manual Verification
- Comparer visuellement les pages avec les maquettes fournies
- Tester les deux rôles (admin et éducateur)
- Vérifier le responsive design
