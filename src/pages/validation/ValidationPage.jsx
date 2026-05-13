import React, { useState, useEffect } from 'react';
import '../absences/AbsencesPage.css'; // On réutilise le style commun des tables et alertes

function ValidationPage() {
    const [remplacements, setRemplacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const userInfoStr = localStorage.getItem('user_info');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Note: In a fully isolated setup, we should filter by club_id.
            // But this relies on pending status for now.
            const res = await fetch(`http://localhost:5000/api/remplacements?status=pending`);
            const data = await res.json();
            setRemplacements(data);
        } catch (err) {
            setError("Erreur lors du chargement des candidatures.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(`http://localhost:5000/api/remplacements/${id}/validate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: action, admin_id: userInfo.id })
            });

            if (res.ok) {
                setSuccess(`La candidature a été ${action === 'approve' ? 'approuvée' : 'refusée'} !`);
                fetchData();
            } else {
                const data = await res.json();
                setError(data.message || "Impossible de valider la candidature.");
            }
        } catch (err) {
            setError("Erreur serveur.");
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title">Validation des remplacements</h1>
            <p className="page-subtitle">Gérez les candidatures d'éducateurs pour les absences déclarées.</p>

            {error && <div className="alert-error" style={{padding:'10px', background:'#fee2e2', color:'#b91c1c', marginBottom:'16px', borderRadius:'4px'}}>{error}</div>}
            {success && <div className="alert-success" style={{padding:'10px', background:'#dcfce7', color:'#15803d', marginBottom:'16px', borderRadius:'4px'}}>{success}</div>}

            <div className="card">
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : remplacements.length === 0 ? (
                    <p className="empty-state-text">Aucun remplacement en attente de validation.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date d'Absence</th>
                                <th>Créneau / Groupe</th>
                                <th>Éducateur Absent</th>
                                <th>Candidat (Remplaçant)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {remplacements.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        <strong>{new Date(r.absence?.date).toLocaleDateString('fr-FR')}</strong>
                                    </td>
                                    <td>
                                        {r.absence?.creneau?.start_time} - {r.absence?.creneau?.end_time}<br/>
                                        <small style={{color:'var(--color-primary)'}}>{r.absence?.creneau?.groupe_name}</small>
                                    </td>
                                    <td>{r.absence?.educator_name}</td>
                                    <td>
                                        <span style={{fontWeight:'600', color:'var(--color-text)'}}>{r.volunteer_name}</span>
                                    </td>
                                    <td>
                                        <div style={{display:'flex', gap:'8px'}}>
                                            <button 
                                                className="btn btn-sm btn-primary"
                                                style={{background:'#15803d', borderColor:'#15803d'}}
                                                onClick={() => handleAction(r.id, 'approve')}
                                            >
                                                Approuver
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline"
                                                style={{color:'#dc2626', borderColor:'#fca5a5'}}
                                                onClick={() => handleAction(r.id, 'reject')}
                                            >
                                                Refuser
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default ValidationPage;
