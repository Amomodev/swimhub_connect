import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/loginpage/LoginPage';
import ClubChoice from './pages/clubchoice/ClubChoice';
import Home from './pages/home/Home';
import ConditionalUpBar from './ConditionalUpBar';

// Import placeholders for feature pages
import AbsencesPage from './pages/absences/AbsencesPage';
import RemplacementsPage from './pages/remplacements/RemplacementsPage';
import ExportPage from './pages/export/ExportPage'; // Bientôt dispo

// Nouvelles structures par Hub
import PlanningHub from './pages/hubs/PlanningHub';
import StaffHub from './pages/hubs/StaffHub';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem("token") != null
    );
    const [rank, setRank] = useState(localStorage.getItem('rank') || 'educ');

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
            setRank(localStorage.getItem('rank') || 'educ');
        } else {
            setIsAuthenticated(false);
            setRank('educ');
        }
    }, [isAuthenticated]);

    // Protected Route wrapper for fully authenticated & club selected routes
    const ProtectedRoute = ({ children, requiredPermission }) => {
        if (!isAuthenticated) return <Navigate to="/login" replace />;
        const activeClubId = localStorage.getItem('active_club_id');
        if (!activeClubId) return <Navigate to="/club-choice" replace />;
        
        const currentRank = localStorage.getItem('rank') || 'educ';
        let perms = [];
        try { perms = JSON.parse(localStorage.getItem('permissions') || '[]'); } catch(e) {}
        
        if (requiredPermission && currentRank !== 'admin' && !perms.includes(requiredPermission)) {
            return <Navigate to="/" replace />;
        }
        
        return <>{children}</>;
    };

    // Route only requires auth, not a selected club
    const AuthOnlyRoute = ({ children }) => {
        if (!isAuthenticated) return <Navigate to="/login" replace />;
        return <>{children}</>;
    };

    return (
        <BrowserRouter>
            <ConditionalUpBar />
            <main>
                <Routes>
                    {/* Public route */}
                    <Route 
                        path="/login" 
                        element={!isAuthenticated ? <LoginPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/club-choice" replace />} 
                    />
                    {/* Retro-compatibilité avec les anciennes routes du frontend */}
                    <Route 
                        path="/signup" 
                        element={<Navigate to="/login" replace />} 
                    />

                    {/* Club Choice */}
                    <Route 
                        path="/club-choice" 
                        element={<AuthOnlyRoute><ClubChoice /></AuthOnlyRoute>} 
                    />

                    {/* Protected routes - All Roles */}
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/planning" element={<ProtectedRoute><PlanningHub /></ProtectedRoute>} />
                    <Route path="/absences" element={<ProtectedRoute><AbsencesPage /></ProtectedRoute>} />
                    <Route path="/remplacements" element={<ProtectedRoute><RemplacementsPage /></ProtectedRoute>} />

                    {/* Protected routes - Admin Only */}
                    <Route path="/staff" element={<ProtectedRoute><StaffHub /></ProtectedRoute>} />
                    <Route path="/export" element={<ProtectedRoute><ExportPage /></ProtectedRoute>} />
                    
                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;