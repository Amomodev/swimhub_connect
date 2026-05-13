import React, { useState } from 'react';
import ValidationPage from '../validation/ValidationPage';
import QualificationsPage from '../qualifications/QualificationsPage';
import ClubRequestsPage from '../clubrequests/ClubRequestsPage';
import EducatorQualificationsPage from '../educator-qualifications/EducatorQualificationsPage';
import RolesPage from '../roles/RolesPage';

function StaffHub() {
    const rank = localStorage.getItem('rank') || 'educ';
    let perms = [];
    try { perms = JSON.parse(localStorage.getItem('permissions') || '[]'); } catch(e) {}
    
    const canManageStaff = rank === 'admin' || perms.includes('manage_staff');
    const canValidate = rank === 'admin' || perms.includes('validate_replacements');
    const canManageRoles = rank === 'admin' || perms.includes('manage_roles');

    // Default tab logic based on permissions
    const defaultTab = canManageStaff ? 'requests' : (canValidate ? 'validation' : (canManageRoles ? 'roles' : 'none'));
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <div className="page-container animate-fade-in" style={{paddingTop: '20px'}}>
            <div style={{display:'flex', gap:'12px', borderBottom:'1px solid var(--color-border)', paddingBottom:'16px', marginBottom:'24px', overflowX:'auto'}}>
                {canManageStaff && (
                    <button 
                        className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Demandes d'Adhésion (Club)
                    </button>
                )}
                {canValidate && (
                    <button 
                        className={`btn ${activeTab === 'validation' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('validation')}
                    >
                        Remplacements
                    </button>
                )}
                {canManageStaff && (
                    <>
                        <button 
                            className={`btn ${activeTab === 'qualifications' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('qualifications')}
                        >
                            Modèles de Diplômes
                        </button>
                        <button 
                            className={`btn ${activeTab === 'edu-qualifications' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('edu-qualifications')}
                        >
                            Équipe & Profils
                        </button>
                    </>
                )}
                {canManageRoles && (
                    <button 
                        className={`btn ${activeTab === 'roles' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('roles')}
                    >
                        Rôles & Accès
                    </button>
                )}
            </div>

            <div className="hub-content">
                {activeTab === 'none' && <p>Vous n'avez aucune permission de gestion des ressources humaines.</p>}
                {activeTab === 'requests' && canManageStaff && <ClubRequestsPage />}
                {activeTab === 'validation' && canValidate && <ValidationPage />}
                {activeTab === 'qualifications' && canManageStaff && <QualificationsPage adminView={true} />}
                {activeTab === 'edu-qualifications' && canManageStaff && <EducatorQualificationsPage />}
                {activeTab === 'roles' && canManageRoles && <RolesPage />}
            </div>
        </div>
    );
}

export default StaffHub;
