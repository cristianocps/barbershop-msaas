import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/UI/Toast';

import { MainLayout } from './components/Layout/MainLayout';
import { RoleRoute } from './components/Layout/RoleRoute';
import Agendar from './pages/Agendar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Usuarios } from './pages/Usuarios';
import { Configuracoes } from './pages/Configuracoes';
import { Agendamentos } from './pages/Agendamentos';
import { Empresas } from './pages/Empresas';
import { Clientes } from './pages/Clientes';
import { Servicos } from './pages/Servicos';
import { Profissionais } from './pages/Profissionais';
import { Horarios } from './pages/Horarios';

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

            {/* Rotas Privadas - Admin */}
            <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="agendamentos" element={<Agendamentos />} />
                <Route path="clientes" element={<RoleRoute minPolicy="consulta"><Clientes /></RoleRoute>} />
                <Route path="usuarios" element={<RoleRoute minPolicy="admin"><Usuarios /></RoleRoute>} />
                <Route path="profissionais" element={<RoleRoute minPolicy="profissional"><Profissionais /></RoleRoute>} />
                <Route path="horarios" element={<RoleRoute minPolicy="profissional"><Horarios /></RoleRoute>} />
                <Route path="empresas" element={<RoleRoute minPolicy="profissional"><Empresas /></RoleRoute>} />
                <Route path="servicos" element={<RoleRoute minPolicy="profissional"><Servicos /></RoleRoute>} />
                <Route path="configuracoes" element={<RoleRoute minPolicy="admin"><Configuracoes /></RoleRoute>} />
            </Route>

            {/* Rota Pública - Cliente (Vitrine) */}
            <Route path="/:slug" element={<Agendar />} />
            <Route path="/agendar" element={<Agendar />} />

            {/* Redirecionamentos */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <AppRoutes />
                    <ToastContainer />
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    );
}

export default App;
