import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import { AuthService } from '../services/Acessos/AuthService';
import { EmpresasService } from '../services/Configuracoes/EmpresasService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [empresa, setEmpresa] = useState(null); // { descricao, logoData }
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        if (token) {
            try {
                // Decode da payload do JWT
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const decoded = JSON.parse(jsonPayload);
                const userName = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.unique_name || 'Usuário';
                const userEmail = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email || '';
                
                const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
                const rawRoles = decoded[roleKey] || decoded.role || [];
                const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
                
                let userMaxPolicy = 0;
                const policyMap = { 'consulta': 1, 'usuario': 2, 'profissional': 3, 'gerente': 4, 'admin': 5, 'desenvolvedor': 6 };
                roles.forEach(role => {
                    const norm = (role || "").toString().normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    if (policyMap[norm] > userMaxPolicy) userMaxPolicy = policyMap[norm];
                });
                
                setUser({ name: userName, email: userEmail, roles, userMaxPolicy });

                // Busca a empresa do usuário para exibir logo e nome na sidebar
                _fetchEmpresaAtual();

            } catch (e) {
                console.error("Erro ao decodificar token", e);
                logout();
            }
        } else {
            setUser(null);
            setEmpresa(null);
        }
        setLoading(false);
    }, [token]);

    // Busca o combo de empresas do usuário e pega a primeira (a empresa do contexto logado)
    const _fetchEmpresaAtual = async () => {
        try {
            const res = await EmpresasService.carregarCombo('', 1);
            const lista = res?.Data ?? res?.data ?? [];
            const primeira = Array.isArray(lista) ? lista[0] : null;
            if (primeira?.id) {
                // Busca os detalhes completos (com logoData)
                const detRes = await EmpresasService.editar(primeira.id);
                const dados = detRes?.Data ?? detRes?.data ?? detRes;
                if (dados) {
                    setEmpresa({
                        id:        dados.id        ?? dados.ID        ?? primeira.id,
                        descricao: dados.descricao ?? dados.Descricao ?? primeira.text ?? 'Barbearia',
                        logoData:  dados.logoData  ?? dados.LogoData  ?? '',
                    });
                    // Persiste no localStorage para acesso rápido entre refreshes
                    localStorage.setItem('empresa_logo', dados.logoData ?? dados.LogoData ?? '');
                    localStorage.setItem('empresa_nome', dados.descricao ?? dados.Descricao ?? '');
                }
            }
        } catch (e) {
            // Falha silenciosa — sidebar usa fallback ✂
            const cachedLogo = localStorage.getItem('empresa_logo') || '';
            const cachedNome = localStorage.getItem('empresa_nome') || 'Barbearia MVP';
            if (cachedLogo || cachedNome) {
                setEmpresa({ descricao: cachedNome, logoData: cachedLogo });
            }
        }
    };

    // Expõe função para atualizar a logo sem relogar (chamada após salvar empresa)
    const refreshEmpresa = () => _fetchEmpresaAtual();

    const login = async (email, password) => {
        try {
            const data = await AuthService.login(email, password);
            localStorage.setItem('token', data.token);
            setToken(data.token);
            toast.success('Login concluído com sucesso!');
            return true;
        } catch (error) {
            toast.error(error.message || 'Erro de conexão com o servidor.');
            return false;
        }
    };

    const logout = async () => {
        try {
            if (token) await AuthService.logout();
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('empresa_logo');
            localStorage.removeItem('empresa_nome');
            setToken(null);
            setUser(null);
            setEmpresa(null);
            toast.info('Você saiu.');
        }
    };

    return (
        <AuthContext.Provider value={{ user, empresa, token, loading, login, logout, refreshEmpresa, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
