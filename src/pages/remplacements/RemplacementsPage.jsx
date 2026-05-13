import React, { useState, useEffect } from 'react';
import '../absences/AbsencesPage.css'; // On réutilise les styles pour rester cohérent

function RemplacementsPage() {
    const [availableAbsences, setAvailableAbsences] = useState([]);
    const [myCandidatures, setMyCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const userInfoStr = localStorage.getItem('user_info');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

    useEffect(() => {
        if (userInfo) {
            fetchData();
        }
    }, []); // Empty array to prevent infinite loops

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch absences available for replacement
            const resAvail = await fetch(`http://localhost:5000/api/remplacements/available?user_id=${userInfo.id}`);
            const dataAvail = await resAvail.json();
            setAvailableAbsences(dataAvail);

            // Fetch my past and current candidatures
            const resCandid = await fetch(`http://localhost:5000/api/remplacements?volunteer_id=${userInfo.id}`);
            const dataCandid = await resCandid.json();
            setMyCandidatures(dataCandid);

        } catch (err) {
            setError("Erreur lors du chargement des données.");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (absenceId) => {
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('http://localhost:5000/api/remplacements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    absence_id: absenceId,
                    volunteer_id: userInfo.id
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("Candidature envoyée avec succès !");
                fetchData(); // reload
            } else {
                setError(data.message || "Erreur lors de la candidature.");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: '8px' }}>Remplacements</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>Consultez les créneaux vacants et proposez-vous pour les remplacer.</p>
                </div>
                <button className="btn btn-outline" onClick={fetchData} disabled={loading}>
                    Rafraîchir
                </button>
            </div>

            {error && <div className="alert-error" style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', marginBottom: '16px', borderRadius: '4px' }}>{error}</div>}
            {success && <div className="alert-success" style={{ padding: '10px', background: '#dcfce7', color: '#15803d', marginBottom: '16px', borderRadius: '4px' }}>{success}</div>}

            <div className="absences-grid" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

                {/* Liste des Remplacements Disponibles */}
                <div className="card" style={{ flex: '2', minWidth: '400px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Absences à pourvoir</h3>
                    {loading ? (
                        <div className="loading-spinner"></div>
                    ) : availableAbsences.length === 0 ? (
                        <p className="empty-state-text">Aucun remplacement compatible avec vos qualifications n'est disponible.</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Créneau / Groupe</th>
                                    <th>Éducateur absent</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {availableAbsences.map(a => (
                                    <tr key={a.id}>
                                        <td>{new Date(a.date).toLocaleDateString('fr-FR')}</td>
                                        <td>
                                            {a.creneau?.day} {a.creneau?.start_time} - {a.creneau?.end_time}<br />
                                            <strong style={{ color: 'var(--color-primary)' }}>{a.creneau?.piscine_name}</strong> - <small>{a.creneau?.groupe_name}</small>
                                        </td>
                                        <td>{a.educator_name}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleApply(a.id)}
                                            >
                                                Se porter volontaire
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mes candidatures en cours */}
                <div className="card" style={{ flex: '1', minWidth: '300px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Mes Candidatures</h3>
                    {loading ? (
                        <div className="loading-spinner"></div>
                    ) : myCandidatures.length === 0 ? (
                        <p className="empty-state-text">Vous n'avez soumis aucune candidature.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {myCandidatures.map(c => (
                                <div key={c.id} style={{ padding: '12px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-bg)' }}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <strong>{new Date(c.absence?.date).toLocaleDateString('fr-FR')}</strong><br />
                                        {c.absence?.creneau?.start_time} - {c.absence?.creneau?.end_time}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <small style={{ color: 'var(--color-text-secondary)' }}>Statut:</small>
                                        {c.status === 'pending' && <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: '600' }}>En attente</span>}
                                        {c.status === 'approved' && <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: '600' }}>Approuvée</span>}
                                        {c.status === 'rejected' && <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: '600' }}>Refusée</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default RemplacementsPage;
