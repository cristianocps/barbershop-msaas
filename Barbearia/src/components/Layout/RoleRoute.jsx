import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserMaxPolicy, POLICY_LEVELS } from '../../utils/userPolicy';

export const RoleRoute = ({ children, minPolicy }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Carregando...</div>;
    
    const userMaxPolicy = getUserMaxPolicy(user);
    const reqPolicyLevel = POLICY_LEVELS[minPolicy?.toLowerCase()] || 0;
    
    if (reqPolicyLevel > 0 && userMaxPolicy < reqPolicyLevel) {
        // Redireciona silenciosamente para a Dashboard principal do painel caso falte permissão
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
