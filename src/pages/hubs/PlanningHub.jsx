import React, { useState } from 'react';
import PiscinesPage from '../piscines/PiscinesPage';
import GroupesPage from '../groupes/GroupesPage';
import CreneauxPage from '../creneaux/CreneauxPage';
import SchedulePage from '../schedule/SchedulePage';
import ImportSchedule from '../import/ImportSchedule';

function PlanningHub() {
    const [activeTab, setActiveTab] = useState('schedule');
    const rank = localStorage.getItem('rank') || 'educ';
    let perms = [];
    try { perms = JSON.parse(localStorage.getItem('permissions') || '[]'); } catch(e) {}
    
    const canManageSchedule = rank === 'admin' || perms.includes('manage_schedule');

    return (
        <div className="page-container animate-fade-in" style={{paddingTop: '20px'}}>
            <div style={{display:'flex', gap:'12px', borderBottom:'1px solid var(--color-border)', paddingBottom:'16px', marginBottom:'24px', overflowX:'auto'}}>
                <button 
                    className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    Emploi du temps
                </button>
                {canManageSchedule && (
                    <>
                        <button 
                            className={`btn ${activeTab === 'piscines' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('piscines')}
                        >
                            Gestion Piscines
                        </button>
                        <button 
                            className={`btn ${activeTab === 'groupes' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('groupes')}
                        >
                            Gestion Groupes
                        </button>
                        <button 
                            className={`btn ${activeTab === 'creneaux' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('creneaux')}
                        >
                            Planner Créneaux
                        </button>
                        <button 
                            className={`btn ${activeTab === 'import' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('import')}
                        >
                            Import Excel
                        </button>
                    </>
                )}
            </div>

            <div className="hub-content">
                {activeTab === 'schedule' && <SchedulePage />}
                {activeTab === 'piscines' && canManageSchedule && <PiscinesPage />}
                {activeTab === 'groupes' && canManageSchedule && <GroupesPage />}
                {activeTab === 'creneaux' && canManageSchedule && <CreneauxPage />}
                {activeTab === 'import' && canManageSchedule && <ImportSchedule />}
            </div>
        </div>
    );
}

export default PlanningHub;
