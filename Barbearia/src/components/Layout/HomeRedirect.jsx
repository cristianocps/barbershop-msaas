import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isPlataformaStaff } from '../../utils/userPolicy';
import { Dashboard } from '../../pages/Dashboard';

export function HomeRedirect() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Carregando...</div>;
    }

    if (isPlataformaStaff(user)) {
        return <Navigate to="/plataforma/financeiro" replace />;
    }

    return <Dashboard />;
}
