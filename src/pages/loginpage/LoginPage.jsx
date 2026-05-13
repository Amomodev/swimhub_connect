import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginPage.css';

function LoginPage({ setIsAuthenticated }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('login');

    // Login form
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup form
    const [signupFirstname, setSignupFirstname] = useState('');
    const [signupLastname, setSignupLastname] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user_info', JSON.stringify(data.user_info));
                // Redirection vers le sas de sélection de club
                setIsAuthenticated(true);
                navigate('/club-choice');
            } else {
                setError(data.message || 'Email ou mot de passe incorrect');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstname: signupFirstname,
                    lastname: signupLastname,
                    email: signupEmail,
                    password: signupPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user_info', JSON.stringify(data.user_info));
                setIsAuthenticated(true);
                navigate('/club-choice');
            } else {
                setError(data.message || 'Erreur lors de l\'inscription');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card animate-fade-in">
                <div className="login-header">
                    <h1 className="login-title">Swim Hub Connect</h1>
                    <p className="login-subtitle">Gestion de club de natation</p>
                </div>

                <div className="login-tabs">
                    <button
                        className={`login-tab ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('login'); setError(''); }}
                    >
                        Connexion
                    </button>
                    <button
                        className={`login-tab ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('signup'); setError(''); }}
                    >
                        Inscription
                    </button>
                </div>

                {error && (
                    <div className="login-error animate-fade-in">
                        {error}
                    </div>
                )}

                {activeTab === 'login' ? (
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                className="form-input"
                                placeholder="votre@email.com"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-password">Mot de passe</label>
                            <input
                                id="login-password"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            {loading ? <span className="loading-spinner"></span> : 'Se connecter'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup} className="login-form">
                        <div className="login-form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="signup-firstname">Prénom</label>
                                <input
                                    id="signup-firstname"
                                    type="text"
                                    className="form-input"
                                    placeholder="Jean"
                                    value={signupFirstname}
                                    onChange={(e) => setSignupFirstname(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="signup-lastname">Nom</label>
                                <input
                                    id="signup-lastname"
                                    type="text"
                                    className="form-input"
                                    placeholder="Dupont"
                                    value={signupLastname}
                                    onChange={(e) => setSignupLastname(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="signup-email">Email</label>
                            <input
                                id="signup-email"
                                type="email"
                                className="form-input"
                                placeholder="votre@email.com"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="signup-password">Mot de passe</label>
                            <input
                                id="signup-password"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            {loading ? <span className="loading-spinner"></span> : "S'inscrire"}
                        </button>
                    </form>
                )}

                <p className="login-footer-text">
                    Accédez à vos plannings et remplacements
                </p>
            </div>
        </div>
    );
}

export default LoginPage;