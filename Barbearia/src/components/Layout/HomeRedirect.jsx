import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isPlataformaStaff, isClienteUser } from '../../utils/userPolicy';
import { Dashboard } from '../../pages/Dashboard';
import { OnboardingService } from '../../services/Configuracoes/OnboardingService';

export function HomeRedirect() {
    const { user, loading } = useAuth();
    const [onboardingPath, setOnboardingPath] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (loading || !user) {
            setChecking(false);
            return;
        }

        if (isClienteUser(user) || isPlataformaStaff(user)) {
            setChecking(false);
            return;
        }

        (async () => {
            try {
                const res = await OnboardingService.obterStatus();
                const status = res?.data ?? res?.Data ?? {};
                if (!status.onboardingCompleto && (status.percentual ?? 0) < 100) {
                    setOnboardingPath('/onboarding');
                }
            } catch {
                /* ignore */
            } finally {
                setChecking(false);
            }
        })();
    }, [user, loading]);

    if (loading || checking) {
        return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Carregando...</div>;
    }

    if (isPlataformaStaff(user)) {
        return <Navigate to="/plataforma/financeiro" replace />;
    }

    if (isClienteUser(user)) {
        return <Navigate to="/cliente/agendamentos" replace />;
    }

    if (onboardingPath) {
        return <Navigate to={onboardingPath} replace />;
    }

    return <Dashboard />;
}
