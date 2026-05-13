import React from 'react';
import { useLocation } from 'react-router-dom';
import UpBar from './components/Up_bar/UpBar'

function ConditionalUpBar() {
    const location = useLocation();

    // url interdite
    const hideOnPaths = ['/login', '/signup', '/auth'];

    // si url interdite, on renvoi rien
    if (hideOnPaths.includes(location.pathname)) {
        return null;
    }

    return <UpBar />;
}

export default ConditionalUpBar