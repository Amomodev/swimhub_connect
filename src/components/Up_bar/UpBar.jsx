import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UpBar.css';

export function UpBar() {
    const navigate = useNavigate();
    const rank = localStorage.getItem('rank') || 'educ';
    const roleLabel = rank === 'admin' ? 'Administrateur' : 'Éducateur';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('club_access');
        localStorage.removeItem('rank');
        window.location.href = '/login';
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-left" onClick={() => navigate('/')}>
                    <h1 className="navbar-title">Swim Hub Connect</h1>
                    <span className="navbar-role">{roleLabel}</span>
                </div>
                <button className="navbar-logout-btn" onClick={handleLogout}>
                    Déconnexion
                </button>
            </div>
        </nav>
    );
}

export default UpBar;