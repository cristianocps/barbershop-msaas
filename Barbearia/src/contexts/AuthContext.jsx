import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { AuthService } from '../services/Acessos/AuthService';
import { EmpresasService } from '../services/Configuracoes/EmpresasService';
import { PortalClienteService } from '../services/Acessos/PortalClienteService';
import { isClienteUser } from '../utils/userPolicy';
import {
    buildUserFromAuth,
    decodeToken,
    extractRolesFromApi,
    extractAccountTypeFromApi,
    extractToken,
    AUTH_ACCOUNT_TYPE_KEY,
    AUTH_ROLES_KEY,
} from '../utils/authToken';

const AuthContext = createContext(null);

async function syncSessionFromServer(token, apiRoles, accountType) {
    try {
        const me = await AuthService.me();
        const roles = me?.roles ?? me?.Roles ?? apiRoles;
        const acc = me?.accountType ?? me?.AccountType ?? accountType;
        return buildUserFromAuth(decodeToken(token), roles, acc);
    } catch {
        return buildUserFromAuth(decodeToken(token), apiRoles, accountType);
    }
}

function persistSessionMeta(apiRoles, accountType) {
    if (apiRoles?.length) {
        localStorage.setItem(AUTH_ROLES_KEY, JSON.stringify(apiRoles));
    }
    if (accountType) {
        localStorage.setItem(AUTH_ACCOUNT_TYPE_KEY, accountType);
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [empresa, setEmpresa] = useState(null);
    const [contaCliente, setContaCliente] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const _fetchEmpresaAtual = async (preferId = null) => {
        try {
            let idEmpresa = preferId;
            // Se não tem ID preferido, tenta obter do perfil do usuário
            if (!idEmpresa) {
                try {
                    const meRes = await AuthService.me();
                    const meData = meRes?.data ?? meRes;
                    if (meData?.idEmpresa && meData.idEmpresa > 0) {
                        idEmpresa = meData.idEmpresa;
                    }
                } catch { /* ignore */ }
            }
            // Fallback: primeira empresa do combo
            if (!idEmpresa) {
                const res = await EmpresasService.carregarCombo('', 1);
                const lista = res?.Data ?? res?.data ?? [];
                const primeira = Array.isArray(lista) ? lista[0] : null;
                idEmpresa = primeira?.id ?? primeira?.ID ?? primeira?.Id;
            }
            if (idEmpresa) {
                const detRes = await EmpresasService.editar(idEmpresa);
                const dados = detRes?.Data ?? detRes?.data ?? detRes;
                if (dados) {
                    setEmpresa({
                        id: dados.id ?? dados.ID ?? idEmpresa,
                        descricao: dados.descricao ?? dados.Descricao ?? 'Barbearia',
                        logoData: dados.logoData ?? dados.LogoData ?? '',
                    });
                    localStorage.setItem('empresa_logo', dados.logoData ?? dados.LogoData ?? '');
                    localStorage.setItem('empresa_nome', dados.descricao ?? dados.Descricao ?? '');
                }
            }
        } catch {
            const cachedLogo = localStorage.getItem('empresa_logo') || '';
            const cachedNome = localStorage.getItem('empresa_nome') || 'Barbearia MVP';
            if (cachedLogo || cachedNome) {
                setEmpresa({ descricao: cachedNome, logoData: cachedLogo });
            }
        }
    };

    const applyToken = useCallback(async (newToken, apiRoles, accountType) => {
        localStorage.setItem('token', newToken);
        const acc =
            accountType
            || extractAccountTypeFromApi({ accountType })
            || localStorage.getItem(AUTH_ACCOUNT_TYPE_KEY)
            || (apiRoles?.some((r) => String(r).toLowerCase() === 'cliente') ? 'cliente' : 'barbearia');

        persistSessionMeta(apiRoles, acc);

        const u = await syncSessionFromServer(newToken, apiRoles, acc);
        setToken(newToken);
        setUser(u);
        persistSessionMeta(u.roles, u.accountType);

        if (isClienteUser(u)) {
            setEmpresa(null);
            try {
                const res = await PortalClienteService.obterPerfil();
                const p = res?.data ?? {};
                setContaCliente({
                    id: p.id ?? p.ID,
                    nome: p.nome ?? p.Nome,
                    telefone: p.telefone ?? p.Telefone,
                    email: p.email ?? p.Email,
                });
            } catch {
                setContaCliente(null);
            }
        } else {
            setContaCliente(null);
            await _fetchEmpresaAtual();
        }
    }, []);

    useEffect(() => {
        if (!token) {
            setUser(null);
            setEmpresa(null);
            setContaCliente(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const storedRoles = localStorage.getItem(AUTH_ROLES_KEY);
                const apiRoles = storedRoles ? JSON.parse(storedRoles) : undefined;
                const accountType = localStorage.getItem(AUTH_ACCOUNT_TYPE_KEY) || undefined;
                const u = await syncSessionFromServer(token, apiRoles, accountType);
                if (cancelled) return;
                setUser(u);
                persistSessionMeta(u.roles, u.accountType);

                if (isClienteUser(u)) {
                    setEmpresa(null);
                    try {
                        const res = await PortalClienteService.obterPerfil();
                        const p = res?.data ?? {};
                        if (!cancelled) {
                            setContaCliente({
                                id: p.id ?? p.ID,
                                nome: p.nome ?? p.Nome,
                                telefone: p.telefone ?? p.Telefone,
                                email: p.email ?? p.Email,
                            });
                        }
                    } catch {
                        if (!cancelled) setContaCliente(null);
                    }
                } else {
                    setContaCliente(null);
                    await _fetchEmpresaAtual();
                }
            } catch (e) {
                console.error('Erro ao decodificar token', e);
                localStorage.removeItem('token');
                localStorage.removeItem(AUTH_ROLES_KEY);
                localStorage.removeItem(AUTH_ACCOUNT_TYPE_KEY);
                setToken(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [token]);

    const refreshEmpresa = (preferId) => _fetchEmpresaAtual(preferId);

    const refreshContaCliente = async () => {
        if (!user || !isClienteUser(user)) return;
        try {
            const res = await PortalClienteService.obterPerfil();
            const p = res?.data ?? {};
            setContaCliente({
                id: p.id ?? p.ID,
                nome: p.nome ?? p.Nome,
                telefone: p.telefone ?? p.Telefone,
                email: p.email ?? p.Email,
            });
        } catch { /* ignore */ }
    };

    const handleAuthResponse = async (data, fallbackAccountType) => {
        const t = extractToken(data);
        if (!t) throw new Error('Token não recebido.');
        const apiRoles = extractRolesFromApi(data);
        const accountType = extractAccountTypeFromApi(data) || fallbackAccountType;
        await applyToken(t, apiRoles, accountType);
        return buildUserFromAuth(decodeToken(t), apiRoles, accountType);
    };

    const login = async (email, password) => {
        try {
            const data = await AuthService.login(email, password);
            const u = await handleAuthResponse(data);
            toast.success('Login concluído com sucesso!');
            return { success: true, user: u };
        } catch (error) {
            toast.error(error.message || 'Erro de conexão com o servidor.');
            return { success: false };
        }
    };

    const loginGoogle = async (payload) => {
        try {
            const data = await AuthService.loginGoogle(payload);
            if (data?.requiresTipoCadastro) {
                return { success: false, requiresTipoCadastro: true };
            }
            const acc = payload.tipoCadastro === 'Cliente' ? 'cliente' : payload.tipoCadastro === 'Barbearia' ? 'barbearia' : undefined;
            const u = await handleAuthResponse(data, acc);
            toast.success('Login com Google concluído!');
            return { success: true, user: u };
        } catch (error) {
            toast.error(error.message || 'Erro no login com Google.');
            return { success: false };
        }
    };

    const logout = async () => {
        try {
            if (token) await AuthService.logout();
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem(AUTH_ROLES_KEY);
            localStorage.removeItem(AUTH_ACCOUNT_TYPE_KEY);
            localStorage.removeItem('empresa_logo');
            localStorage.removeItem('empresa_nome');
            setToken(null);
            setUser(null);
            setEmpresa(null);
            setContaCliente(null);
            toast.info('Você saiu.');
        }
    };

    const registrar = async (payload) => {
        try {
            const data = await AuthService.registrar(payload);
            const acc = payload.tipoCadastro === 'Cliente' ? 'cliente' : 'barbearia';
            const u = await handleAuthResponse(data, acc);
            toast.success('Cadastro realizado e login concluído!');
            return { success: true, user: u };
        } catch (error) {
            toast.error(error.message || 'Erro ao realizar cadastro.');
            return { success: false };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            empresa,
            contaCliente,
            token,
            loading,
            login,
            loginGoogle,
            logout,
            registrar,
            refreshEmpresa,
            refreshContaCliente,
            isAuthenticated: !!token,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
