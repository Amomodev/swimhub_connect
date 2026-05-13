import React, { useState, useEffect } from 'react';
import './AbsencesPage.css';

function AbsencesPage() {
    const [creneaux, setCreneaux] = useState([]);
    const [absences, setAbsences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form state
    const [selectedCreneau, setSelectedCreneau] = useState('');
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');

    const userInfoStr = localStorage.getItem('user_info');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

    useEffect(() => {
        if (userInfo) {
            fetchData();
        }
    }, []); // Empty array to prevent infinite reloads

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch my creneaux
            const resC = await fetch(`http://localhost:5000/api/creneaux?educator_id=${userInfo.id}`);
            const dataC = await resC.json();
            setCreneaux(dataC);

            // Fetch my absences
            const resA = await fetch(`http://localhost:5000/api/absences?educator_id=${userInfo.id}`);
            const dataA = await resA.json();
            setAbsences(dataA);

        } catch (err) {
            setError("Erreur lors du chargement des données.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        console.log("🚀 BOUTON CLIQUÉ ! Démarrage de la soumission...", { selectedCreneau, date, reason });
        setError(null);
        setSuccess(null);

        if (!selectedCreneau || !date) {
            setError("Veuillez sélectionner un créneau et une date.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/absences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creneau_id: selectedCreneau,
                    educator_id: userInfo.id,
                    date: date,
                    reason: reason
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("Absence déclarée avec succès !");
                setSelectedCreneau('');
                setDate('');
                setReason('');
                fetchData(); // reload
            } else {
                setError(data.message || "Erreur lors de la déclaration.");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        }
    };

    const handleDelete = async (absenceId) => {
        if (!window.confirm("Voulez-vous vraiment annuler cette déclaration d'absence ?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/absences/${absenceId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchData();
            } else {
                setError("Impossible de supprimer l'absence.");
            }
        } catch(err) {
            setError("Erreur lors de la suppression.");
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '24px'}}>
                <div>
                    <h1 className="page-title" style={{marginBottom:'8px'}}>Mes Absences</h1>
                    <p className="page-subtitle" style={{marginBottom:0}}>Déclarez une absence pour qu'un remplaçant puisse se positionner.</p>
                </div>
                <button className="btn btn-outline" onClick={fetchData} disabled={loading}>
                    Rafraîchir
                </button>
            </div>

            {error && <div className="alert-error" style={{padding:'10px', background:'#fee2e2', color:'#b91c1c', marginBottom:'16px', borderRadius:'4px'}}>{error}</div>}
            {success && <div className="alert-success" style={{padding:'10px', background:'#dcfce7', color:'#15803d', marginBottom:'16px', borderRadius:'4px'}}>{success}</div>}

            <div className="absences-grid" style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
                {/* Formulaire de déclaration */}
                <div className="card" style={{flex: '1', minWidth: '300px'}}>
                    <h3 style={{marginBottom: '16px'}}>Déclarer une absence</h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                        <div className="form-group">
                            <label className="form-label">Sélectionnez le créneau</label>
                            <select 
                                className="form-input" 
                                value={selectedCreneau} 
                                onChange={(e)=>setSelectedCreneau(e.target.value)}
                            >
                                <option value="">Choisir un créneau...</option>
                                {creneaux.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.day} - {c.start_time} à {c.end_time} ({c.groupe_name} @ {c.piscine_name})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date précise</label>
                            <input 
                                type="date" 
                                className="form-input" 
                                value={date} 
                                onChange={(e)=>setDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Motif (optionnel)</label>
                            <textarea 
                                className="form-input" 
                                rows="3" 
                                value={reason} 
                                onChange={(e)=>setReason(e.target.value)}
                                placeholder="Maladie, empêchement..."
                            ></textarea>
                        </div>
                        {creneaux.length === 0 && (
                            <div style={{padding:'10px', background:'#fffbeb', color:'#b45309', borderRadius:'4px', fontSize:'0.9rem', border:'1px solid #fef3c7'}}>
                                Attention : Vous n'avez aucun créneau assigné à votre nom. Demandez à l'administrateur de vous planifier un créneau dans "Planner Créneaux" avant de pouvoir déclarer une absence.
                            </div>
                        )}
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            disabled={loading || creneaux.length === 0}
                            onClick={handleSubmit}
                        >
                            Envoyer la déclaration
                        </button>
                    </form>
                </div>

                {/* Historique des absences */}
                <div className="card" style={{flex: '2', minWidth: '400px'}}>
                    <h3 style={{marginBottom: '16px'}}>Historique des déclarations</h3>
                    {loading ? (
                        <div className="loading-spinner"></div>
                    ) : absences.length === 0 ? (
                        <p className="empty-state-text">Vous n'avez déclaré aucune absence.</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Créneau</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {absences.map(a => (
                                    <tr key={a.id}>
                                        <td>{new Date(a.date).toLocaleDateString('fr-FR')}</td>
                                        <td>
                                            {a.creneau?.day} {a.creneau?.start_time} - {a.creneau?.end_time}<br/>
                                            <small style={{color:'var(--color-text-secondary)'}}>{a.creneau?.groupe_name}</small>
                                        </td>
                                        <td>
                                            {a.status === 'pending' && <span style={{color: '#d97706'}}>En attente</span>}
                                            {a.status === 'replaced' && <span style={{color: '#15803d'}}>Remplacé</span>}
                                            {a.status === 'unresolved' && <span style={{color: '#b91c1c'}}>Non remplacé</span>}
                                        </td>
                                        <td>
                                            {a.status === 'pending' && (
                                                <button 
                                                    className="btn btn-sm btn-outline" 
                                                    style={{color: '#dc2626', borderColor: '#fca5a5'}}
                                                    onClick={() => handleDelete(a.id)}
                                                >
                                                    Annuler
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AbsencesPage;
