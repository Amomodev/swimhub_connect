import React, { useState, useEffect } from 'react';
import '../absences/AbsencesPage.css'; // Pour les alertes et tables

function ClubRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const activeClubId = localStorage.getItem('active_club_id');

    useEffect(() => {
        if (activeClubId) fetchData();
    }, [activeClubId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch pending requests for this club
            const res = await fetch(`http://localhost:5000/api/clubs/${activeClubId}/requests?status=pending`);
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            setError("Erreur lors du chargement des demandes d'adhésion.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, action) => {
        if (!window.confirm(`Voulez-vous ${action === 'approved' ? 'accepter' : 'refuser'} cet accès ?`)) return;

        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(`http://localhost:5000/api/clubs/${activeClubId}/members/${userId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });

            if (res.ok) {
                setSuccess(`Le statut du membre a été mis à jour.`);
                fetchData();
            } else {
                const data = await res.json();
                setError(data.message || "Impossible de traiter la demande.");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        }
    };

    return (
        <div className="card animate-fade-in">
            <h2 style={{marginBottom: '8px'}}>Adhésions au Club</h2>
            <p style={{color:'var(--color-text-secondary)', marginBottom:'20px'}}>
                Acceptez ou refusez les éducateurs qui ont demandé à rejoindre votre club.
            </p>

            {error && <div className="alert-error" style={{padding:'10px', background:'#fee2e2', color:'#b91c1c', marginBottom:'16px', borderRadius:'4px'}}>{error}</div>}
            {success && <div className="alert-success" style={{padding:'10px', background:'#dcfce7', color:'#15803d', marginBottom:'16px', borderRadius:'4px'}}>{success}</div>}

            {loading ? (
                <div className="loading-spinner"></div>
            ) : requests.length === 0 ? (
                <p className="empty-state-text">Vous n'avez aucune demande d'adhésion en attente.</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Prénom</th>
                            <th>Nom</th>
                            <th>Email de contact</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(r => (
                            <tr key={r.member_id}>
                                <td><strong>{r.firstname}</strong></td>
                                <td>{r.lastname}</td>
                                <td>{r.email}</td>
                                <td style={{textAlign:'right'}}>
                                    <button 
                                        className="btn btn-sm btn-primary" 
                                        style={{marginRight:'8px', background:'#15803d', borderColor:'#15803d'}}
                                        onClick={() => handleAction(r.user_id, 'approved')}
                                    >
                                        Accepter
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-outline" 
                                        style={{color:'#dc2626', borderColor:'#fca5a5'}}
                                        onClick={() => handleAction(r.user_id, 'rejected')}
                                    >
                                        Refuser
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ClubRequestsPage;
