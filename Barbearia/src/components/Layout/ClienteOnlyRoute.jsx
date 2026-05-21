import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isClienteUser } from '../../utils/userPolicy';

export function ClienteOnlyRoute() {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Carregando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isClienteUser(user)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
