import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PolicyLevels = {
    'consulta': 1,
    'usuario': 2,
    'profissional': 3,
    'gerente': 4,
    'admin': 5,
    'desenvolvedor': 6
};

export const RoleRoute = ({ children, minPolicy }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Carregando...</div>;
    
    let userMaxPolicy = 0;
    if (user?.roles && user.roles.length > 0) {
        user.roles.forEach(role => {
            const norm = role.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const level = PolicyLevels[norm] || 0;
            if (level > userMaxPolicy) {
                userMaxPolicy = level;
            }
        });
    }

    const reqPolicyLevel = PolicyLevels[minPolicy?.toLowerCase()] || 0;
    
    if (reqPolicyLevel > 0 && userMaxPolicy < reqPolicyLevel) {
        // Redireciona silenciosamente para a Dashboard principal do painel caso falte permissão
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
