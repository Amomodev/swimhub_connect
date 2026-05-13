import React from "react";


const handleLogout = () => {
    localStorage.removeItem("token"); // On jette le badge
    setIsAuthenticated(false);        // On ferme la barrière
    navigate("/auth");                // On renvoie à l'entrée
};

export default handleLogout