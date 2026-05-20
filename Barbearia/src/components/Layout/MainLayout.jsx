import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AgendamentoAlert } from '../UI/AgendamentoAlert';
import { BillingAlertBanner } from '../UI/BillingAlertBanner';
import { useAssinatura } from '../../contexts/AssinaturaContext';
import { useAuth } from '../../contexts/AuthContext';
import { isPlataformaStaff } from '../../utils/userPolicy';

export function MainLayout() {
    const { user } = useAuth();
    const { bloqueado, isDesenvolvedor } = useAssinatura();
    const staffPlataforma = isPlataformaStaff(user);
    const location = useLocation();
    const naPaginaAssinatura = location.pathname === '/assinatura' || location.pathname.startsWith('/assinatura/');
    const modoBloqueio = bloqueado && !isDesenvolvedor;

    return (
        <div className={`main-layout ${modoBloqueio ? 'main-layout--assinatura-bloqueada' : ''}`}>
            <Sidebar bloqueado={modoBloqueio} />
            <main className="main-content">
                <div className="content-wrapper admin-wrapper">
                    {modoBloqueio && !naPaginaAssinatura && <BillingAlertBanner />}
                    <Outlet />
                </div>
            </main>
            {!modoBloqueio && !staffPlataforma && <AgendamentoAlert />}
        </div>
    );
}
