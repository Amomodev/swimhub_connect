import React, { useState, useEffect } from 'react';
import '../absences/AbsencesPage.css';

function EducatorQualificationsPage() {
    const [educators, setEducators] = useState([]);
    const [qualifications, setQualifications] = useState([]);
    const [roles, setRoles] = useState([]);
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
            // Fetch educators for this club
            const resE = await fetch(`http://localhost:5000/api/users?club_id=${activeClubId}`);
            let dataE = await resE.json();
            // Garder seulement ceux approuvés ou admins de ce club
            dataE = dataE.filter(e => e.status === 'approved' || e.rank === 'admin');
            
            // Enrich with their specific qualifications (since /users doesn't give it directly here easily without changing models, wait... 
            // In API GET /users we do NOT return qualifications! I need to fetch them from /api/qualifications/user/<id>
            
            for (let e of dataE) {
                const resQ = await fetch(`http://localhost:5000/api/qualifications/user/${e.id}`);
                if (resQ.ok) {
                    const qu = await resQ.json();
                    e.user_qualifications = qu;
                } else {
                    e.user_qualifications = [];
                }
            }

            setEducators(dataE);

            // Fetch standard qualifications list to show in selects
            const resQList = await fetch(`http://localhost:5000/api/qualifications`);
            const dataQList = await resQList.json();
            setQualifications(dataQList);

            // Fetch roles
            const resRoles = await fetch(`http://localhost:5000/api/clubs/${activeClubId}/roles`);
            const dataRoles = await resRoles.json();
            setRoles(dataRoles);
            
        } catch (err) {
            setError("Erreur de chargement.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddQualif = async (userId, qualifId) => {
        if (!qualifId) return;
        setError(null);
        setSuccess(null);
        
        try {
            const res = await fetch(`http://localhost:5000/api/qualifications/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, qualification_id: parseInt(qualifId) })
            });

            if (res.ok) {
                fetchData();
                setSuccess("Diplôme attribué.");
            } else {
                const data = await res.json();
                setError(data.message || "Impossible d'attribuer.");
            }
        } catch(err) {
            setError("Erreur serveur.");
        }
    };

    const handleRemoveQualif = async (userId, qualifId) => {
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(`http://localhost:5000/api/qualifications/user`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, qualification_id: qualifId })
            });

            if (res.ok) {
                fetchData();
            } else {
                setError("Impossible de retirer le diplôme.");
            }
        } catch(err) {
            setError("Erreur serveur.");
        }
    };

    const handleAssignRole = async (memberId, roleId) => {
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch(`http://localhost:5000/api/members/${memberId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role_id: roleId ? parseInt(roleId) : null })
            });

            if (res.ok) {
                fetchData();
                setSuccess("Rôle mis à jour avec succès.");
            } else {
                setError("Impossible de modifier le rôle.");
            }
        } catch(err) {
            setError("Erreur serveur.");
        }
    };

    return (
        <div className="card animate-fade-in" style={{padding:'20px'}}>
            <h2 style={{marginBottom: '8px'}}>Gestion de l'Équipe</h2>
            <p style={{color:'var(--color-text-secondary)', marginBottom:'20px'}}>
                Attribuez les diplômes aux membres pour les remplacements, et donnez-leur des rôles personnalisés.
            </p>

            {error && <div className="alert-error" style={{padding:'10px', background:'#fee2e2', color:'#b91c1c', marginBottom:'16px', borderRadius:'4px'}}>{error}</div>}
            {success && <div className="alert-success" style={{padding:'10px', background:'#dcfce7', color:'#15803d', marginBottom:'16px', borderRadius:'4px'}}>{success}</div>}

            {loading ? (
                <div className="loading-spinner"></div>
            ) : educators.length === 0 ? (
                <p className="empty-state-text">Aucun membre approuvé dans le club.</p>
            ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                    {educators.map(educ => (
                        <div key={educ.id} style={{border:'1px solid var(--color-border)', padding:'16px', borderRadius:'var(--radius-sm)', background:'var(--color-bg)'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <h3 style={{margin:0}}>{educ.firstname} {educ.lastname}</h3>
                                        {educ.rank === 'admin' && <span style={{background:'#fef08a', color:'#854d0e', padding:'2px 6px', borderRadius:'4px', fontSize:'0.7rem', fontWeight:'bold'}}>ADMIN</span>}
                                    </div>
                                    <div style={{fontSize:'0.8rem', color:'var(--color-text-secondary)', marginBottom:'10px'}}>{educ.email}</div>
                                    
                                    <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'4px'}}>
                                        <span style={{fontSize:'0.85rem'}}>Rôle :</span>
                                        <select 
                                            className="form-input" 
                                            style={{padding:'4px', fontSize:'0.85rem', width:'auto'}} 
                                            value={educ.role_id || ""}
                                            onChange={(e) => handleAssignRole(educ.id, e.target.value)}
                                            disabled={educ.rank === 'admin'}
                                        >
                                            <option value="">(Aucun rôle spécial)</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                                    <select id={`select-q-${educ.id}`} className="form-input" style={{width:'auto'}} defaultValue="">
                                        <option value="" disabled>+ Ajouter un diplôme</option>
                                        {qualifications.map(q => (
                                            <option key={q.id} value={q.id}>{q.name}</option>
                                        ))}
                                    </select>
                                    <button 
                                        className="btn btn-sm btn-primary"
                                        onClick={() => {
                                            const sel = document.getElementById(`select-q-${educ.id}`);
                                            handleAddQualif(educ.id, sel.value);
                                            sel.value = "";
                                        }}
                                    >
                                        Ajouter
                                    </button>
                                </div>
                            </div>
                            
                            <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginTop:'10px'}}>
                                {educ.user_qualifications?.length === 0 && <span style={{fontSize:'0.9rem', color:'#94a3b8', fontStyle:'italic'}}>Aucun diplôme renseigné.</span>}
                                {educ.user_qualifications?.map(uq => (
                                    <span key={uq.id} style={{
                                        display:'inline-flex', alignItems:'center', gap:'6px', 
                                        background:'#dbeafe', color:'#1e3a8a', padding:'4px 10px', borderRadius:'16px', fontSize:'0.85rem', fontWeight:'500'
                                    }}>
                                        {uq.name}
                                        <button 
                                            style={{background:'none', border:'none', color:'#1e3a8a', cursor:'pointer', padding:'0', fontSize:'0.9rem'}}
                                            onClick={() => handleRemoveQualif(educ.id, uq.id)}
                                            title="Retirer"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EducatorQualificationsPage;
