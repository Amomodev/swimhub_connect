import React, { useState, useEffect } from 'react';
import '../absences/AbsencesPage.css'; // Pour réutiliser le style alertes/table

function PiscinesPage() {
    const [piscines, setPiscines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const activeClubId = localStorage.getItem('active_club_id');

    useEffect(() => {
        if (activeClubId) {
            fetchData();
        }
    }, [activeClubId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/piscines?club_id=${activeClubId}`);
            const data = await res.json();
            setPiscines(data);
        } catch (err) {
            setError("Erreur lors du chargement des piscines.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch('http://localhost:5000/api/piscines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, address, club_id: activeClubId })
            });

            if (res.ok) {
                setSuccess("Piscine ajoutée avec succès !");
                setName('');
                setAddress('');
                setIsCreating(false);
                fetchData();
            } else {
                const data = await res.json();
                setError(data.message || "Erreur lors de l'ajout.");
            }
        } catch (err) {
            setError("Erreur serveur.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette piscine ? Cela supprimera aussi ses groupes !")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/piscines/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            } else {
                setError("Impossible de supprimer la piscine.");
            }
        } catch(err) {
            setError("Erreur serveur.");
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                <div>
                    <h1 className="page-title" style={{marginBottom:0}}>Piscines</h1>
                    <p className="page-subtitle">Gérez les piscines de votre club.</p>
                </div>
                {!isCreating && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                        + Ajouter une piscine
                    </button>
                )}
            </div>

            {error && <div className="alert-error" style={{padding:'10px', background:'#fee2e2', color:'#b91c1c', marginBottom:'16px', borderRadius:'4px'}}>{error}</div>}
            {success && <div className="alert-success" style={{padding:'10px', background:'#dcfce7', color:'#15803d', marginBottom:'16px', borderRadius:'4px'}}>{success}</div>}

            {isCreating && (
                <div className="card" style={{marginBottom:'24px', background:'#f8fafc', border:'1px dashed var(--color-border)'}}>
                    <h3 style={{marginBottom:'16px'}}>Nouvelle piscine</h3>
                    <form onSubmit={handleCreate} style={{display:'flex', gap:'16px', alignItems:'flex-end'}}>
                        <div className="form-group" style={{flex:1}}>
                            <label className="form-label">Nom</label>
                            <input type="text" className="form-input" value={name} onChange={(e)=>setName(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{flex:2}}>
                            <label className="form-label">Adresse</label>
                            <input type="text" className="form-input" value={address} onChange={(e)=>setAddress(e.target.value)} required />
                        </div>
                        <div style={{display:'flex', gap:'8px'}}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsCreating(false)}>Annuler</button>
                            <button type="submit" className="btn btn-primary">Enregistrer</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : piscines.length === 0 ? (
                    <p className="empty-state-text">Votre club n'a aucune piscine. Ajoutez-en une pour commencer !</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nom de la piscine</th>
                                <th>Adresse</th>
                                <th style={{textAlign:'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {piscines.map(p => (
                                <tr key={p.id}>
                                    <td><strong>{p.name}</strong></td>
                                    <td>{p.address}</td>
                                    <td style={{textAlign:'right'}}>
                                        <button className="btn btn-sm btn-outline" style={{color:'#dc2626', borderColor:'#fca5a5'}} onClick={() => handleDelete(p.id)}>
                                            Supprimer
                                        </button>
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

export default PiscinesPage;
