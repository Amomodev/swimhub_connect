import React, { useState, useEffect } from 'react';
import '../absences/AbsencesPage.css';

function GroupesPage() {
    const [piscines, setPiscines] = useState([]);
    const [groupes, setGroupes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form
    const [name, setName] = useState('');
    const [level, setLevel] = useState('Débutant');
    const [piscineId, setPiscineId] = useState('');
    const [selectedQualifs, setSelectedQualifs] = useState([]);
    const [allQualifs, setAllQualifs] = useState([]);
    const [isCreating, setIsCreating] = useState(false);

    const activeClubId = localStorage.getItem('active_club_id');

    useEffect(() => {
        if (activeClubId) fetchData();
    }, [activeClubId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // First fetch piscines
            const resP = await fetch(`http://localhost:5000/api/piscines?club_id=${activeClubId}`);
            const dataP = await resP.json();
            setPiscines(dataP);

            if (dataP.length > 0) {
                // Fetch groups for ALL piscines of that club
                let allGroupes = [];
                for (const p of dataP) {
                    const resG = await fetch(`http://localhost:5000/api/groupes?piscine_id=${p.id}`);
                    const dataG = await resG.json();
                    allGroupes = [...allGroupes, ...dataG];
                }
                setGroupes(allGroupes);
                setPiscineId(dataP[0].id.toString()); // default select
            }

            // Fetch qualifications
            const resQ = await fetch(`http://localhost:5000/api/qualifications`);
            const dataQ = await resQ.json();
            setAllQualifs(dataQ);
        } catch (err) {
            setError("Erreur lors du chargement des groupes.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch('http://localhost:5000/api/groupes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, 
                    level, 
                    piscine_id: piscineId,
                    qualification_ids: selectedQualifs
                })
            });

            if (res.ok) {
                setSuccess("Groupe ajouté avec succès !");
                setName('');
                setSelectedQualifs([]);
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
        if (!window.confirm("Supprimer ce groupe ?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/groupes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            } else {
                setError("Impossible de supprimer le groupe.");
            }
        } catch(err) {
            setError("Erreur serveur.");
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                <div>
                    <h1 className="page-title" style={{marginBottom:0}}>Groupes</h1>
                    <p className="page-subtitle">Créez les groupes de natation par piscine.</p>
                </div>
                {!isCreating && piscines.length > 0 && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                        + Créer un groupe
                    </button>
                )}
            </div>

            {error && <div className="alert-error" style={{padding:'10px', background:'#fee2e2', color:'#b91c1c', marginBottom:'16px', borderRadius:'4px'}}>{error}</div>}
            {success && <div className="alert-success" style={{padding:'10px', background:'#dcfce7', color:'#15803d', marginBottom:'16px', borderRadius:'4px'}}>{success}</div>}

            {isCreating && (
                <div className="card" style={{marginBottom:'24px', background:'#f8fafc', border:'1px dashed var(--color-border)'}}>
                    <h3 style={{marginBottom:'16px'}}>Nouveau Groupe</h3>
                    <form onSubmit={handleCreate} style={{display:'flex', gap:'16px', alignItems:'flex-end'}}>
                        <div className="form-group" style={{flex:1}}>
                            <label className="form-label">Bassin (Piscine)</label>
                            <select className="form-input" value={piscineId} onChange={(e)=>setPiscineId(e.target.value)} required>
                                {piscines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{flex:1}}>
                            <label className="form-label">Nom du groupe</label>
                            <input type="text" className="form-input" placeholder="Ex: Bébés Nageurs" value={name} onChange={(e)=>setName(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{flex:1}}>
                            <label className="form-label">Niveau</label>
                            <select className="form-input" value={level} onChange={(e)=>setLevel(e.target.value)}>
                                <option value="Débutant">Débutant</option>
                                <option value="Intermédiaire">Intermédiaire</option>
                                <option value="Avancé">Avancé</option>
                                <option value="Tous niveaux">Tous niveaux</option>
                            </select>
                        </div>
                        <div className="form-group" style={{width:'100%', marginTop:'10px'}}>
                            <label className="form-label" style={{marginBottom:'8px'}}>Diplômes requis pour ce groupe (Optionnel)</label>
                            <div style={{
                                display:'flex', flexDirection:'column', gap:'8px', 
                                maxHeight:'150px', overflowY:'auto', 
                                border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', padding:'10px', background:'white'
                            }}>
                                {allQualifs.map(q => (
                                    <label key={q.id} style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem', cursor:'pointer', padding:'4px', borderRadius:'4px', transition:'background 0.2s'}}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <input 
                                            type="checkbox" 
                                            value={q.id} 
                                            checked={selectedQualifs.includes(q.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedQualifs(prev => [...prev, q.id]);
                                                else setSelectedQualifs(prev => prev.filter(id => id !== q.id));
                                            }}
                                            style={{cursor:'pointer', width:'16px', height:'16px'}}
                                        />
                                        <span style={{fontWeight:'500'}}>{q.name}</span>
                                        <span style={{fontSize:'0.8rem', color:'var(--color-text-secondary)', marginLeft:'auto'}}>{q.description}</span>
                                    </label>
                                ))}
                                {allQualifs.length === 0 && <span style={{fontSize:'0.8rem', color:'#64748b'}}>Aucun diplôme dans le catalogue de l'équipe (RH).</span>}
                            </div>
                        </div>
                        <div style={{display:'flex', gap:'8px', marginTop:'16px'}}>
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
                    <p className="empty-state-text">Veuillez d'abord créer une piscine dans l'onglet Piscines.</p>
                ) : groupes.length === 0 ? (
                    <p className="empty-state-text">Aucun groupe créé. Cliquez sur ajouter pour commencer.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nom du Groupe</th>
                                <th>Niveau</th>
                                <th>Piscine Rattachée</th>
                                <th style={{textAlign:'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupes.map(g => (
                                <tr key={g.id}>
                                    <td><strong>{g.name}</strong></td>
                                    <td><span style={{background:'#e2e8f0', padding:'2px 8px', borderRadius:'12px', fontSize:'0.8rem'}}>{g.level}</span></td>
                                    <td>{g.piscine_name}</td>
                                    <td style={{textAlign:'right'}}>
                                        <button className="btn btn-sm btn-outline" style={{color:'#dc2626', borderColor:'#fca5a5'}} onClick={() => handleDelete(g.id)}>
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

export default GroupesPage;
