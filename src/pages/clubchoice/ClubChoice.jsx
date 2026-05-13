import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClubChoice.css';

function ClubChoice() {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState([]);
    const [myClubs, setMyClubs] = useState([]);
    const [newClubName, setNewClubName] = useState('');
    const [selectedClubToJoin, setSelectedClubToJoin] = useState('');
    
    // UI state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const userInfoStr = localStorage.getItem('user_info');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch user's affiliations
            const myRes = await fetch(`http://localhost:5000/api/my-clubs?user_id=${userInfo.id}`);
            const myData = await myRes.json();
            setMyClubs(myData);

            // Fetch all clubs
            const allRes = await fetch('http://localhost:5000/api/clubs');
            const allData = await allRes.json();
            
            // Filter out clubs the user is already affiliated with (even pending)
            const myClubIds = myData.map(c => c.club_id);
            setClubs(allData.filter(c => !myClubIds.includes(c.id)));
            
            if (allData.length > 0 && !selectedClubToJoin) {
                setSelectedClubToJoin(allData[0]?.id.toString() || '');
            }
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClub = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
        try {
            const res = await fetch('http://localhost:5000/api/clubs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newClubName, user_id: userInfo.id })
            });
            const data = await res.json();
            
            if (res.ok) {
                setSuccess(`Club "${data.club.name}" créé avec succès !`);
                setNewClubName('');
                setShowCreate(false);
                fetchData();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Erreur serveur.");
        }
    };

    const handleJoinClub = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
        if (!selectedClubToJoin) return;
        
        try {
            const res = await fetch(`http://localhost:5000/api/clubs/${selectedClubToJoin}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userInfo.id })
            });
            const data = await res.json();
            
            if (res.ok) {
                setSuccess("Demande envoyée !");
                fetchData();
            } else {
                setError(data.message || "Erreur lors de la demande.");
            }
        } catch (err) {
            setError("Erreur serveur.");
        }
    };

    const enterClub = (club) => {
        if (club.status === 'pending') {
            setError("Votre accès à ce club n'est pas encore validé par un administrateur.");
            return;
        }
        
        // Save active club in localStorage for subsequent API calls
        localStorage.setItem('active_club_id', club.club_id);
        localStorage.setItem('rank', club.rank);
        localStorage.setItem('permissions', JSON.stringify(club.permissions || []));
        
        navigate('/'); // Redirige vers le Home
    };

    if (loading && myClubs.length === 0) return <div className="loading-spinner" style={{margin:'20px auto'}}></div>;

    return (
        <div className="login-page">
            <div className="login-card animate-fade-in" style={{ maxWidth: '600px' }}>
                <div className="login-header">
                    <h1 className="login-title">Choix du Club</h1>
                    <p className="login-subtitle">Bonjour {userInfo?.firstname}, veuillez choisir votre espace.</p>
                </div>

                {error && <div className="login-error">{error}</div>}
                {success && <div className="login-success" style={{color:'green', background:'#f0fdf4', padding:'10px', borderRadius:'4px', marginBottom:'16px'}}>{success}</div>}

                {/* Mes Clubs Actuels */}
                <h3 style={{marginBottom:'12px', fontSize:'1.1rem'}}>Mes Clubs</h3>
                {myClubs.length === 0 ? (
                    <p style={{color:'var(--color-text-secondary)', marginBottom:'20px'}}>Vous n'êtes inscrit dans aucun club.</p>
                ) : (
                    <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'24px'}}>
                        {myClubs.map(mc => (
                            <div key={mc.club_id} 
                                 style={{
                                    display:'flex', justifyContent:'space-between', alignItems:'center',
                                    padding:'12px 16px', background:'var(--color-bg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)'
                                 }}>
                                <div>
                                    <strong>{mc.club_name}</strong>
                                    <div style={{fontSize:'0.8rem', color: mc.status==='pending' ? '#d97706' : '#059669', marginTop:'4px'}}>
                                        {mc.status === 'pending' ? 'En attente de validation' : 'Accès Validé'} 
                                        &nbsp;({mc.rank === 'admin' ? 'Admin' : 'Éducateur'})
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    disabled={mc.status === 'pending'}
                                    onClick={() => enterClub(mc)}
                                >
                                    Entrer
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                <hr style={{border:'none', borderTop:'1px solid var(--color-border)', margin:'24px 0'}} />

                {/* Rejoindre ou Créer */}
                {!showCreate ? (
                    <div style={{background:'var(--color-bg)', padding:'20px', borderRadius:'var(--radius-sm)'}}>
                        <h3 style={{marginBottom:'12px', fontSize:'1rem'}}>Rejoindre un club existant</h3>
                        <form onSubmit={handleJoinClub} style={{display:'flex', gap:'10px', marginBottom:'16px'}}>
                            <select 
                                className="form-input" 
                                value={selectedClubToJoin} 
                                onChange={(e)=>setSelectedClubToJoin(e.target.value)}
                                style={{flex:1}}
                                disabled={clubs.length === 0}
                            >
                                {clubs.length === 0 && <option>Aucun autre club disponible</option>}
                                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button type="submit" className="btn btn-secondary" disabled={clubs.length === 0}>Demander l'accès</button>
                        </form>
                        
                        <p style={{textAlign:'center', margin:'10px 0'}}>ou</p>
                        
                        <button 
                            type="button" 
                            className="btn btn-outline" 
                            style={{width:'100%'}}
                            onClick={() => setShowCreate(true)}
                        >
                            Créer mon propre club
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleCreateClub} style={{background:'var(--color-bg)', padding:'20px', borderRadius:'var(--radius-sm)'}}>
                        <h3 style={{marginBottom:'12px', fontSize:'1rem'}}>Créer un nouveau club</h3>
                        <div className="form-group">
                            <label className="form-label">Nom du club</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={newClubName} 
                                onChange={(e)=>setNewClubName(e.target.value)} 
                                required
                                placeholder="Club de natation Aqua+"
                            />
                        </div>
                        <div style={{display:'flex', gap:'10px', marginTop:'16px'}}>
                            <button type="button" className="btn btn-outline" style={{flex:1}} onClick={() => setShowCreate(false)}>Annuler</button>
                            <button type="submit" className="btn btn-primary" style={{flex:1}}>Créer le club</button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}

export default ClubChoice;
