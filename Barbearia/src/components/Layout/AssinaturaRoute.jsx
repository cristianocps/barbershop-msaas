import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAssinatura } from '../../contexts/AssinaturaContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Bloqueia rotas internas quando a assinatura está vencida.
 * Apenas /assinatura e /assinatura/retorno permanecem acessíveis (fora deste wrapper).
 */
export function AssinaturaRoute() {
    const { bloqueado, loading, isDesenvolvedor } = useAssinatura();
    const { loading: authLoading } = useAuth();
    const location = useLocation();

    if (authLoading || loading) {
        return (
            <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                Carregando...
            </div>
        );
    }

    if (!isDesenvolvedor && bloqueado) {
        return <Navigate to="/assinatura" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
