import React, { useState, useEffect } from 'react';
import '../absences/AbsencesPage.css';

function QualificationsPage({ adminView }) {
    const [qualifications, setQualifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/qualifications`);
            const data = await res.json();
            setQualifications(data);
        } catch (err) {
            setError("Erreur lors du chargement des qualifications.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch('http://localhost:5000/api/qualifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });

            if (res.ok) {
                setSuccess("Qualification ajoutée avec succès au catalogue global !");
                setName('');
                setDescription('');
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
        if (!window.confirm("Supprimer ce diplôme ? Cela affectera tous les groupes et éducateurs liés.")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/qualifications/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            } else {
                setError("Impossible de supprimer la qualification.");
            }
        } catch(err) {
            setError("Erreur serveur.");
        }
    };

    return (
        <div className="card animate-fade-in" style={{padding:'20px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                <div>
                    <h2 style={{margin:0}}>Modèles de Diplômes (Catalogue Global)</h2>
                    <p style={{color:'var(--color-text-secondary)', marginTop:'4px'}}>Gérez la liste de tous les diplômes existants dans l'application.</p>
                </div>
                {!isCreating && adminView && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                        + Nouveau Diplôme
                    </button>
                )}
            </div>

            {error && <div className="alert-error" style={{padding:'10px', background:'#fee2e2', color:'#b91c1c', marginBottom:'16px', borderRadius:'4px'}}>{error}</div>}
            {success && <div className="alert-success" style={{padding:'10px', background:'#dcfce7', color:'#15803d', marginBottom:'16px', borderRadius:'4px'}}>{success}</div>}

            {isCreating && adminView && (
                <div style={{marginBottom:'24px', background:'#f8fafc', padding:'16px', borderRadius:'var(--radius-sm)', border:'1px dashed var(--color-border)'}}>
                    <h3 style={{marginBottom:'16px'}}>Créer un Modèle de Diplôme</h3>
                    <form onSubmit={handleCreate} style={{display:'flex', gap:'16px', alignItems:'flex-end'}}>
                        <div className="form-group" style={{flex:1}}>
                            <label className="form-label">Nom abrégé</label>
                            <input type="text" className="form-input" placeholder="Ex: BNSSA" value={name} onChange={(e)=>setName(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{flex:2}}>
                            <label className="form-label">Description compléte</label>
                            <input type="text" className="form-input" placeholder="Brevet National de Sécurité et Sauvetage Aquatique" value={description} onChange={(e)=>setDescription(e.target.value)} />
                        </div>
                        <div style={{display:'flex', gap:'8px'}}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsCreating(false)}>Annuler</button>
                            <button type="submit" className="btn btn-primary">Enregistrer</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading-spinner"></div>
            ) : qualifications.length === 0 ? (
                <p className="empty-state-text">Le catalogue de qualifications est vide.</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nom Abrégé</th>
                            <th>Description</th>
                            {adminView && <th style={{textAlign:'right'}}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {qualifications.map(q => (
                            <tr key={q.id}>
                                <td><span style={{background:'#e2e8f0', padding:'2px 8px', borderRadius:'12px', fontSize:'0.9rem', fontWeight:'500'}}>{q.name}</span></td>
                                <td>{q.description}</td>
                                {adminView && (
                                    <td style={{textAlign:'right'}}>
                                        <button className="btn btn-sm btn-outline" style={{color:'#dc2626', borderColor:'#fca5a5'}} onClick={() => handleDelete(q.id)}>
                                            Supprimer
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default QualificationsPage;
