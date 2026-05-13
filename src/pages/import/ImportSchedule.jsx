import React, { useState } from 'react';

function ImportSchedule() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [importErrors, setImportErrors] = useState([]);

    const activeClubId = localStorage.getItem('active_club_id');

    const handleDownloadTemplate = () => {
        window.open('http://localhost:5000/api/export/template', '_blank');
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Veuillez sélectionner un fichier Excel.");
            return;
        }

        setError(null);
        setSuccess(null);
        setImportErrors([]);
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`http://localhost:5000/api/clubs/${activeClubId}/import-schedule`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message);
                if (data.errors && data.errors.length > 0) {
                    setImportErrors(data.errors);
                }
                setFile(null);
            } else {
                setError(data.message || "Erreur lors de l'importation.");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card animate-fade-in" style={{padding:'20px'}}>
            <h2 style={{marginBottom: '8px'}}>Importation Excel Massif</h2>
            <p style={{color:'var(--color-text-secondary)', marginBottom:'24px'}}>
                Utilisez cette fonctionnalité pour importer rapidement tous les créneaux, groupes et piscines de votre club depuis un fichier Excel.
            </p>

            {error && <div className="alert-error" style={{padding:'10px', background:'#fee2e2', color:'#b91c1c', marginBottom:'16px', borderRadius:'4px'}}>{error}</div>}
            {success && <div className="alert-success" style={{padding:'10px', background:'#dcfce7', color:'#15803d', marginBottom:'16px', borderRadius:'4px'}}>{success}</div>}

            <div style={{display:'flex', gap:'24px', flexWrap:'wrap'}}>
                
                {/* Etape 1: Télécharger */}
                <div style={{flex: 1, minWidth: '300px', padding:'20px', background:'#f8fafc', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)'}}>
                    <h3 style={{marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'}}>
                        <span style={{background:'var(--color-primary)', color:'white', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem'}}>1</span>
                        Télécharger le modèle
                    </h3>
                    <p style={{fontSize:'0.9rem', marginBottom:'16px'}}>
                        Pour que le système comprenne vos données, vous devez utiliser notre format standard avec les colonnes exactes.
                    </p>
                    <button className="btn btn-outline" onClick={handleDownloadTemplate} style={{width:'100%'}}>
                        Télécharger le modèle (.xlsx)
                    </button>
                    <div style={{marginTop:'16px', fontSize:'0.85rem', color:'var(--color-text-secondary)'}}>
                        <strong>Note :</strong> Les piscines et les groupes qui n'existent pas encore dans le système seront automatiquement créés ! L'email de l'éducateur doit correspondre à un compte existant.
                    </div>
                </div>

                {/* Etape 2: Uploader */}
                <div style={{flex: 1, minWidth: '300px', padding:'20px', background:'#f8fafc', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)'}}>
                    <h3 style={{marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'}}>
                        <span style={{background:'var(--color-primary)', color:'white', width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem'}}>2</span>
                        Importer le fichier rempli
                    </h3>
                    <form onSubmit={handleUpload}>
                        <div className="form-group" style={{marginBottom:'16px'}}>
                            <input 
                                type="file" 
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                style={{width:'100%', padding:'10px', background:'white', border:'1px dashed var(--color-border)', borderRadius:'var(--radius-sm)'}}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={!file || loading}
                            style={{width:'100%'}}
                        >
                            {loading ? 'Importation en cours...' : 'Lancer l\'importation'}
                        </button>
                    </form>

                    {importErrors.length > 0 && (
                        <div style={{marginTop:'16px', padding:'12px', background:'#fffbeb', border:'1px solid #fef3c7', borderRadius:'4px', maxHeight:'150px', overflowY:'auto'}}>
                            <h4 style={{color:'#b45309', marginBottom:'8px', fontSize:'0.9rem'}}>Attention (Lignes ignorées)</h4>
                            <ul style={{fontSize:'0.8rem', color:'#92400e', paddingLeft:'16px'}}>
                                {importErrors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ImportSchedule;
