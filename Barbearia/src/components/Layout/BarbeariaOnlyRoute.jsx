import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isPlataformaStaff, isClienteUser } from '../../utils/userPolicy';

/**
 * Rotas do painel da barbearia — usuários da plataforma (Desenvolvedor) são redirecionados.
 */
export function BarbeariaOnlyRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Carregando...</div>;
    }

    if (isClienteUser(user)) {
        return <Navigate to="/cliente/agendamentos" replace />;
    }

    if (isPlataformaStaff(user)) {
        return <Navigate to="/plataforma/financeiro" replace />;
    }

    return <Outlet />;
}
