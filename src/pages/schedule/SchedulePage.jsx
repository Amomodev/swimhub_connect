import React, { useState, useEffect } from 'react';
import '../absences/AbsencesPage.css';

function SchedulePage() {
    const [creneaux, setCreneaux] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const activeClubId = localStorage.getItem('active_club_id');
    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    useEffect(() => {
        if (activeClubId) fetchData();
    }, [activeClubId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Piscines
            const resP = await fetch(`http://localhost:5000/api/piscines?club_id=${activeClubId}`);
            const dataP = await resP.json();

            let allCreneaux = [];
            for (const p of dataP) {
                const resC = await fetch(`http://localhost:5000/api/creneaux?piscine_id=${p.id}`);
                const dataC = await resC.json();
                allCreneaux = [...allCreneaux, ...dataC];
            }
            
            setCreneaux(allCreneaux);
        } catch (err) {
            setError("Erreur de chargement du planning.");
        } finally {
            setLoading(false);
        }
    };

    const getCreneauxForDay = (day) => {
        return creneaux
            .filter(c => c.day === day)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
    };

    return (
        <div className="card animate-fade-in" style={{padding:'20px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                <h2 style={{margin:0}}>Emploi du temps du Club</h2>
                <button className="btn btn-outline" onClick={fetchData}>Rafraîchir</button>
            </div>

            {error && <div className="alert-error" style={{padding:'10px', background:'#fee2e2', color:'#b91c1c', marginBottom:'16px', borderRadius:'4px'}}>{error}</div>}

            {loading ? (
                <div className="loading-spinner"></div>
            ) : creneaux.length === 0 ? (
                <p className="empty-state-text">L'emploi du temps est vide. Les administrateurs peuvent le remplir de l'onglet Créneaux horaires.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    {daysOfWeek.map(day => {
                        const dayCreneaux = getCreneauxForDay(day);
                        if (dayCreneaux.length === 0) return null; // Ne pas afficher les jours vides

                        return (
                            <div key={day} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                                <h3 style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '8px', marginBottom: '16px' }}>{day}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {dayCreneaux.map(c => (
                                        <div key={c.id} style={{ padding: '12px', background: 'var(--color-bg)', borderRadius: '4px', borderLeft: '4px solid var(--color-primary)' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                                {c.start_time} - {c.end_time}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                                                {c.groupe_name}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                                Piscine : {c.piscine_name} <br/>
                                                Éducateur : {c.educator_name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default SchedulePage;
