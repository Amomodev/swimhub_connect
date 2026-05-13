import React, { useState, useEffect } from 'react';
import '../absences/AbsencesPage.css';

function CreneauxPage() {
    const [piscines, setPiscines] = useState([]);
    const [groupes, setGroupes] = useState([]);
    const [educateurs, setEducateurs] = useState([]);
    const [creneaux, setCreneaux] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form
    const [isCreating, setIsCreating] = useState(false);
    const [day, setDay] = useState('Lundi');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [groupeId, setGroupeId] = useState('');
    const [educatorId, setEducatorId] = useState('');

    const activeClubId = localStorage.getItem('active_club_id');

    useEffect(() => {
        if (activeClubId) fetchData();
    }, [activeClubId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Piscines
            const resP = await fetch(`http://localhost:5000/api/piscines?club_id=${activeClubId}`);
            const dataP = await resP.json();
            setPiscines(dataP);

            if (dataP.length > 0) {
                // 2. Fetch Groupes for these piscines
                let allGroupes = [];
                for (const p of dataP) {
                    const resG = await fetch(`http://localhost:5000/api/groupes?piscine_id=${p.id}`);
                    const dataG = await resG.json();
                    allGroupes = [...allGroupes, ...dataG];
                }
                setGroupes(allGroupes);
                if (allGroupes.length > 0) setGroupeId(allGroupes[0].id.toString());
                
                // 3. Fetch all creneaux for these piscines to display the list
                let allCreneaux = [];
                for (const p of dataP) {
                    const resC = await fetch(`http://localhost:5000/api/creneaux?piscine_id=${p.id}`);
                    const dataC = await resC.json();
                    allCreneaux = [...allCreneaux, ...dataC];
                }
                setCreneaux(allCreneaux.sort((a,b) => a.start_time.localeCompare(b.start_time)));
            }

            // 4. Fetch Educateurs of the club
            const resE = await fetch(`http://localhost:5000/api/users?club_id=${activeClubId}`);
            const dataE = await resE.json();
            // Garder seulement ceux dont la candidature est approuvée (ou les admins, tant qu'ils sont dans le club)
            const validEducators = dataE.filter(e => e.status === 'approved');
            setEducateurs(validEducators);
            if (validEducators.length > 0) setEducatorId(validEducators[0].id.toString());

        } catch (err) {
            setError("Erreur lors du chargement des données de l'emploi du temps.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Find which piscine this group belongs to
        const selectedGroup = groupes.find(g => g.id.toString() === groupeId);
        if (!selectedGroup) return setError("Groupe invalide.");

        try {
            const res = await fetch('http://localhost:5000/api/creneaux', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    day,
                    start_time: startTime,
                    end_time: endTime,
                    groupe_id: groupeId,
                    educator_id: educatorId,
                    piscine_id: selectedGroup.piscine_id
                })
            });

            if (res.ok) {
                setSuccess("Créneau ajouté avec succès à l'emploi du temps !");
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
        if (!window.confirm("Supprimer ce créneau ?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/creneaux/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            } else {
                setError("Impossible de supprimer le créneau.");
            }
        } catch(err) {
            setError("Erreur serveur.");
        }
    };

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    return (
        <div className="page-container animate-fade-in">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                <div>
                    <h1 className="page-title" style={{marginBottom:0}}>Emploi du temps Administratif</h1>
                    <p className="page-subtitle">Créez les créneaux pour lier Groupes, Éducateurs et Piscines.</p>
                </div>
                {!isCreating && groupes.length > 0 && educateurs.length > 0 && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                        + Planifier un créneau
                    </button>
                )}
            </div>

            {error && <div className="alert-error" style={{padding:'10px', background:'#fee2e2', color:'#b91c1c', marginBottom:'16px', borderRadius:'4px'}}>{error}</div>}
            {success && <div className="alert-success" style={{padding:'10px', background:'#dcfce7', color:'#15803d', marginBottom:'16px', borderRadius:'4px'}}>{success}</div>}

            {isCreating && (
                <div className="card" style={{marginBottom:'24px', background:'#f8fafc', border:'1px dashed var(--color-border)'}}>
                    <h3 style={{marginBottom:'16px'}}>Planifier un nouveau créneau</h3>
                    <form onSubmit={handleCreate} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                        <div style={{display:'flex', gap:'16px'}}>
                            <div className="form-group" style={{flex:1}}>
                                <label className="form-label">Jour</label>
                                <select className="form-input" value={day} onChange={(e)=>setDay(e.target.value)}>
                                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{flex:1}}>
                                <label className="form-label">Heure de début</label>
                                <input type="time" className="form-input" value={startTime} onChange={(e)=>setStartTime(e.target.value)} required />
                            </div>
                            <div className="form-group" style={{flex:1}}>
                                <label className="form-label">Heure de fin</label>
                                <input type="time" className="form-input" value={endTime} onChange={(e)=>setEndTime(e.target.value)} required />
                            </div>
                        </div>

                        <div style={{display:'flex', gap:'16px'}}>
                            <div className="form-group" style={{flex:1}}>
                                <label className="form-label">Groupe concerné</label>
                                <select className="form-input" value={groupeId} onChange={(e)=>setGroupeId(e.target.value)} required>
                                    {groupes.map(g => <option key={g.id} value={g.id}>{g.name} ({g.piscine_name})</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{flex:1}}>
                                <label className="form-label">Éducateur affecté</label>
                                <select className="form-input" value={educatorId} onChange={(e)=>setEducatorId(e.target.value)} required>
                                    {educateurs.map(e => <option key={e.id} value={e.id}>{e.firstname} {e.lastname}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsCreating(false)}>Annuler</button>
                            <button type="submit" className="btn btn-primary">Enregistrer le créneau</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : (groupes.length === 0 || educateurs.length === 0) ? (
                    <div className="empty-state-text" style={{textAlign:'left'}}>
                        <strong>Attention :</strong> Pour créer un créneau il vous faut :
                        <ul style={{marginTop:'10px', marginLeft:'20px'}}>
                            <li>Au moins une piscine (gérée via Gestion Piscines)</li>
                            <li>Au moins un groupe (géré via Gestion Groupes)</li>
                            <li>Des éducateurs approuvés dans le club.</li>
                        </ul>
                    </div>
                ) : creneaux.length === 0 ? (
                    <p className="empty-state-text">L'emploi du temps est vide.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Horaires</th>
                                <th>Groupe & Bassin</th>
                                <th>Éducateur Titulaire</th>
                                <th style={{textAlign:'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {creneaux.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <strong>{c.day}</strong><br/>
                                        <small>{c.start_time} - {c.end_time}</small>
                                    </td>
                                    <td>
                                        {c.groupe_name}<br/>
                                        <small style={{color:'var(--color-primary)'}}>{c.piscine_name}</small>
                                    </td>
                                    <td>{c.educator_name}</td>
                                    <td style={{textAlign:'right'}}>
                                        <button className="btn btn-sm btn-outline" style={{color:'#dc2626', borderColor:'#fca5a5'}} onClick={() => handleDelete(c.id)}>
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

export default CreneauxPage;
