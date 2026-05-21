import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/UI/Toast';

import { MainLayout } from './components/Layout/MainLayout';
import { RoleRoute } from './components/Layout/RoleRoute';
import Agendar from './pages/Agendar';
import { Login } from './pages/Login';
import { Usuarios } from './pages/Usuarios';
import { DadosBancarios } from './pages/DadosBancarios';
import { Agendamentos } from './pages/Agendamentos';
import { Empresas } from './pages/Empresas';
import { MinhaBarbearia } from './pages/MinhaBarbearia';
import { Clientes } from './pages/Clientes';
import { Servicos } from './pages/Servicos';
import { Profissionais } from './pages/Profissionais';
import { Horarios } from './pages/Horarios';
import { Financeiro } from './pages/Financeiro';
import { TapRetorno } from './pages/TapRetorno';
import { PagamentoRetorno } from './pages/PagamentoRetorno';
import { InfinitePayConfig } from './pages/InfinitePayConfig';
import { Assinatura } from './pages/Assinatura';
import { AssinaturaRetorno } from './pages/AssinaturaRetorno';
import { PlataformaFinanceiro } from './pages/PlataformaFinanceiro';
import { AssinaturaProvider } from './contexts/AssinaturaContext';
import { AssinaturaRoute } from './components/Layout/AssinaturaRoute';
import { BarbeariaOnlyRoute } from './components/Layout/BarbeariaOnlyRoute';
import { HomeRedirect } from './components/Layout/HomeRedirect';
import { ClienteOnlyRoute } from './components/Layout/ClienteOnlyRoute';
import { ClienteLayout } from './components/Layout/ClienteLayout';
import { ClienteAgendamentos } from './pages/cliente/ClienteAgendamentos';
import { ClientePerfil } from './pages/cliente/ClientePerfil';
import { Onboarding } from './pages/Onboarding';

import './index.css';
import './styles/layout.css';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <div>Carregando...</div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/cliente" element={<ClienteOnlyRoute />}>
                <Route element={<ClienteLayout />}>
                    <Route index element={<Navigate to="/cliente/agendamentos" replace />} />
                    <Route path="agendamentos" element={<ClienteAgendamentos />} />
                    <Route path="perfil" element={<ClientePerfil />} />
                </Route>
            </Route>

            {/* Rotas Privadas - Admin */}
            <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                <Route path="plataforma/financeiro" element={<RoleRoute minPolicy="desenvolvedor"><PlataformaFinanceiro /></RoleRoute>} />
                <Route element={<BarbeariaOnlyRoute />}>
                <Route path="assinatura" element={<Assinatura />} />
                <Route path="assinatura/retorno" element={<AssinaturaRetorno />} />
                <Route element={<AssinaturaRoute />}>
                <Route index element={<HomeRedirect />} />
                <Route path="onboarding" element={<RoleRoute minPolicy="profissional"><Onboarding /></RoleRoute>} />
                <Route path="agendamentos" element={<Agendamentos />} />
                <Route path="financeiro" element={<RoleRoute minPolicy="gerente"><Financeiro /></RoleRoute>} />
                <Route path="clientes" element={<RoleRoute minPolicy="consulta"><Clientes /></RoleRoute>} />
                <Route path="usuarios" element={<RoleRoute minPolicy="admin"><Usuarios /></RoleRoute>} />
                <Route path="profissionais" element={<RoleRoute minPolicy="profissional"><Profissionais /></RoleRoute>} />
                <Route path="horarios" element={<RoleRoute minPolicy="profissional"><Horarios /></RoleRoute>} />
                <Route path="minha-barbearia" element={<RoleRoute minPolicy="profissional"><MinhaBarbearia /></RoleRoute>} />
                <Route path="empresas" element={<RoleRoute minPolicy="admin"><Empresas /></RoleRoute>} />
                <Route path="servicos" element={<RoleRoute minPolicy="profissional"><Servicos /></RoleRoute>} />
                <Route path="configuracoes/dados-bancarios" element={<RoleRoute minPolicy="profissional"><DadosBancarios /></RoleRoute>} />
                <Route path="configuracoes/infinite-pay" element={<RoleRoute minPolicy="gerente"><InfinitePayConfig /></RoleRoute>} />
                </Route>
                </Route>
            </Route>

            {/* Retorno Infinite Pay (público, sem login) */}
            <Route path="/agendamentos/tap-retorno" element={<TapRetorno />} />
            <Route path="/agendamentos/pagamento-retorno" element={<PagamentoRetorno />} />

            {/* Rota Pública - Cliente (Vitrine) */}
            <Route path="/:slug" element={<Agendar />} />
            <Route path="/agendar" element={<Agendar />} />

            {/* Redirecionamentos */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
    const inner = (
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <AssinaturaProvider>
                        <AppRoutes />
                    </AssinaturaProvider>
                    <ToastContainer />
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    );

    if (!googleClientId) return inner;

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            {inner}
        </GoogleOAuthProvider>
    );
}

export default App;
