import React, { useState, useEffect } from 'react';
import '../absences/AbsencesPage.css';

// Liste des permissions possibles
const PERMISSIONS_LIST = [
    { id: 'manage_schedule', label: 'Gérer l\'emploi du temps', desc: 'Créer/modifier les créneaux, groupes, et piscines' },
    { id: 'validate_replacements', label: 'Valider les remplacements', desc: 'Accepter ou refuser les candidatures de remplacement' },
    { id: 'manage_staff', label: 'Gérer l\'équipe', desc: 'Accepter les adhésions au club et gérer les diplômes' },
    { id: 'manage_roles', label: 'Gérer les rôles', desc: 'Créer des rôles personnalisés et les assigner' },
];

function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form
    const [name, setName] = useState('');
    const [selectedPerms, setSelectedPerms] = useState([]);
    const [isCreating, setIsCreating] = useState(false);

    const activeClubId = localStorage.getItem('active_club_id');

    useEffect(() => {
        if (activeClubId) fetchData();
    }, [activeClubId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/clubs/${activeClubId}/roles`);
            const data = await res.json();
            setRoles(data);
        } catch (err) {
            setError("Erreur lors du chargement des rôles.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(`http://localhost:5000/api/clubs/${activeClubId}/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, permissions: selectedPerms })
            });

            if (res.ok) {
                setSuccess("Rôle créé avec succès !");
                setName('');
                setSelectedPerms([]);
                setIsCreating(false);
                fetchData();
            } else {
                const data = await res.json();
                setError(data.message || "Erreur lors de la création.");
            }
        } catch (err) {
            setError("Erreur serveur.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce rôle ? Les membres assignés à ce rôle perdront ces permissions spéciales.")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/roles/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            } else {
                setError("Impossible de supprimer le rôle.");
            }
        } catch(err) {
            setError("Erreur serveur.");
        }
    };

    return (
        <div className="card animate-fade-in" style={{padding:'20px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                <div>
                    <h2 style={{margin:0}}>Rôles et Permissions</h2>
                    <p style={{color:'var(--color-text-secondary)', marginTop:'4px'}}>Créez des rôles sur-mesure pour déléguer la gestion de votre club.</p>
                </div>
                {!isCreating && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                        + Nouveau Rôle
                    </button>
                )}
            </div>

            {error && <div className="alert-error" style={{padding:'10px', background:'#fee2e2', color:'#b91c1c', marginBottom:'16px', borderRadius:'4px'}}>{error}</div>}
            {success && <div className="alert-success" style={{padding:'10px', background:'#dcfce7', color:'#15803d', marginBottom:'16px', borderRadius:'4px'}}>{success}</div>}

            {isCreating && (
                <div style={{marginBottom:'24px', background:'#f8fafc', padding:'16px', borderRadius:'var(--radius-sm)', border:'1px dashed var(--color-border)'}}>
                    <h3 style={{marginBottom:'16px'}}>Créer un Rôle</h3>
                    <form onSubmit={handleCreate} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                        <div className="form-group">
                            <label className="form-label">Nom du rôle</label>
                            <input type="text" className="form-input" placeholder="Ex: Coordinateur Bassin, Secrétaire..." value={name} onChange={(e)=>setName(e.target.value)} required />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" style={{marginBottom:'8px'}}>Permissions accordées</label>
                            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'12px'}}>
                                {PERMISSIONS_LIST.map(p => (
                                    <label key={p.id} style={{display:'flex', alignItems:'flex-start', gap:'8px', cursor:'pointer', background:'white', padding:'10px', borderRadius:'6px', border:'1px solid var(--color-border)'}}>
                                        <input 
                                            type="checkbox" 
                                            value={p.id} 
                                            checked={selectedPerms.includes(p.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedPerms(prev => [...prev, p.id]);
                                                else setSelectedPerms(prev => prev.filter(id => id !== p.id));
                                            }}
                                            style={{marginTop:'4px'}}
                                        />
                                        <div>
                                            <div style={{fontWeight:'bold', fontSize:'0.9rem'}}>{p.label}</div>
                                            <div style={{fontSize:'0.8rem', color:'var(--color-text-secondary)'}}>{p.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{display:'flex', gap:'8px', marginTop:'8px'}}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsCreating(false)}>Annuler</button>
                            <button type="submit" className="btn btn-primary">Créer le rôle</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading-spinner"></div>
            ) : roles.length === 0 ? (
                <p className="empty-state-text">Aucun rôle personnalisé. Seuls les administrateurs ont tous les droits.</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nom du rôle</th>
                            <th>Permissions activées</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map(r => (
                            <tr key={r.id}>
                                <td><span style={{background:'#fef3c7', color:'#b45309', padding:'4px 10px', borderRadius:'16px', fontSize:'0.9rem', fontWeight:'bold'}}>{r.name}</span></td>
                                <td>
                                    <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                                        {r.permissions.length === 0 ? <span style={{color:'#94a3b8', fontStyle:'italic'}}>Aucune permission</span> : null}
                                        {r.permissions.map(permId => {
                                            const p = PERMISSIONS_LIST.find(p => p.id === permId);
                                            return <span key={permId} style={{background:'#f1f5f9', padding:'2px 8px', borderRadius:'4px', fontSize:'0.8rem'}}>{p ? p.label : permId}</span>
                                        })}
                                    </div>
                                </td>
                                <td style={{textAlign:'right'}}>
                                    <button className="btn btn-sm btn-outline" style={{color:'#dc2626', borderColor:'#fca5a5'}} onClick={() => handleDelete(r.id)}>
                                        Supprimer
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

export default RolesPage;
