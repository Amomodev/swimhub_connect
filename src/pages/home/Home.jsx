import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const BaseCards = [
    {
        id: 'planning-hub',
        title: 'Espace Planning',
        subtitle: 'Emploi du temps & Config',
        description: 'Consultez le planning hebdomadaire. Géréz les piscines, groupes et créneaux (Admin).',
        path: '/planning'
    },
    {
        id: 'absences',
        title: 'Absences',
        subtitle: 'Signalez une indisponibilité',
        description: 'Déclarez vos absences pour qu\'un membre de l\'équipe puisse vous remplacer.',
        path: '/absences'
    },
    {
        id: 'remplacements',
        title: 'Remplacements',
        subtitle: 'Solidaire !',
        description: 'Consultez les absences en cours et postulez pour remplacer vos collègues.',
        path: '/remplacements'
    }
];

const AdminCards = [
    {
        id: 'staff-hub',
        title: 'Ressources Humaines',
        subtitle: 'Validation & Adhésions',
        description: 'Gérez le club : Acceptez les demandes d\'adhésion, validez les remplacements et assignez les diplômes.',
        path: '/staff',
        adminOnly: true
    },
    {
        id: 'export',
        title: 'Export & Rapports',
        subtitle: 'Bilan mensuel',
        description: 'Générez des exports Excel des heures travaillées (Bientôt disponible).',
        path: '/export',
        adminOnly: true
    }
];

export function Home() {
    const navigate = useNavigate();
    const [rank, setRank] = useState('educ');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const storedRank = localStorage.getItem('rank') || 'educ';
        setRank(storedRank);

        try {
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            setUserName(userInfo.firstname || '');
        } catch (e) {
            // ignore
        }
    }, []);

    const isAdmin = rank === 'admin';
    const visibleCards = isAdmin 
        ? [...BaseCards, ...AdminCards] 
        : BaseCards;

    const roleLabel = isAdmin ? 'Administrateur' : 'Éducateur';

    return (
        <div className="home-page">
            <div className="page-container">
                <div className="home-header animate-fade-in">
                    <div>
                        <h1 className="home-title">Swim Hub Connect</h1>
                        <p className="home-role">Tableau de bord {roleLabel}</p>
                    </div>
                </div>

                <div className="home-grid">
                    {visibleCards.map((card, index) => (
                        <div
                            key={card.id}
                            className={`home-card animate-fade-in-up stagger-${index + 1}`}
                            onClick={() => navigate(card.path)}
                            id={`card-${card.id}`}
                        >
                            <div className="home-card-header">
                                <h2 className="home-card-title">{card.title}</h2>
                            </div>
                            <p className="home-card-subtitle">{card.subtitle}</p>
                            <p className="home-card-description">{card.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;