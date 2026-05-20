import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AssinaturaService } from '../services/Plataforma/AssinaturaService';
import { isAssinaturaBloqueioError } from '../utils/assinaturaBloqueio';

const AssinaturaContext = createContext(null);

function normalizeStatus(raw) {
    if (!raw) return null;
    return {
        status: raw.status ?? raw.Status ?? '',
        bloqueado: raw.bloqueado ?? raw.Bloqueado ?? false,
        diasRestantes: raw.diasRestantes ?? raw.DiasRestantes ?? 0,
        trialEndsAt: raw.trialEndsAt ?? raw.TrialEndsAt,
        periodoFim: raw.periodoFim ?? raw.PeriodoFim,
        valorMensalCentavos: raw.valorMensalCentavos ?? raw.ValorMensalCentavos ?? 0,
        dtUltimoPagamento: raw.dtUltimoPagamento ?? raw.DtUltimoPagamento,
        mensagem: raw.mensagem ?? raw.Mensagem,
    };
}

export const AssinaturaProvider = ({ children }) => {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [assinatura, setAssinatura] = useState(null);
    const [loading, setLoading] = useState(true);
    const redirectedRef = useRef(false);

    const isDesenvolvedor = (user?.userMaxPolicy ?? 0) >= 6;

    const goAssinaturaSeBloqueado = useCallback((bloqueado) => {
        if (!bloqueado || isDesenvolvedor) return;
        if (location.pathname === '/assinatura' || location.pathname === '/assinatura/retorno') return;
        if (redirectedRef.current) return;
        redirectedRef.current = true;
        navigate('/assinatura', { replace: true });
    }, [isDesenvolvedor, location.pathname, navigate]);

    const refreshAssinatura = useCallback(async () => {
        if (!isAuthenticated || isDesenvolvedor) {
            setAssinatura(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await AssinaturaService.obterStatus();
            const normalized = normalizeStatus(data);
            setAssinatura(normalized);
            if (normalized?.bloqueado) {
                goAssinaturaSeBloqueado(true);
            } else {
                redirectedRef.current = false;
            }
        } catch (err) {
            if (isAssinaturaBloqueioError(err)) {
                const normalized = normalizeStatus({
                    bloqueado: true,
                    status: err.data?.status ?? 'overdue',
                    mensagem: err.message,
                    ...err.data,
                });
                setAssinatura(normalized);
                goAssinaturaSeBloqueado(true);
            } else {
                setAssinatura(null);
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isDesenvolvedor, goAssinaturaSeBloqueado]);

    useEffect(() => {
        if (!authLoading && isAuthenticated && !isDesenvolvedor) {
            refreshAssinatura();
        } else if (!isAuthenticated) {
            setAssinatura(null);
            setLoading(false);
            redirectedRef.current = false;
        } else if (isDesenvolvedor) {
            setLoading(false);
        }
    }, [authLoading, isAuthenticated, isDesenvolvedor, refreshAssinatura]);

    useEffect(() => {
        const handler = (e) => {
            const detail = e.detail || {};
            setAssinatura((prev) => ({
                ...(prev || {}),
                bloqueado: true,
                status: detail.status ?? prev?.status ?? 'overdue',
                mensagem: detail.message ?? detail.mensagem ?? prev?.mensagem,
            }));
            goAssinaturaSeBloqueado(true);
        };
        window.addEventListener('assinatura-bloqueada', handler);
        return () => window.removeEventListener('assinatura-bloqueada', handler);
    }, [goAssinaturaSeBloqueado]);

    const gerarLink = async () => {
        const data = await AssinaturaService.gerarLink();
        return data?.url ?? data?.Url ?? '';
    };

    const bloqueado = !isDesenvolvedor && assinatura?.bloqueado === true;
    const alertaTrial = assinatura?.status === 'trial' && (assinatura?.diasRestantes ?? 0) <= 7 && !bloqueado;
    const alertaAtraso = bloqueado || assinatura?.status === 'overdue';

    return (
        <AssinaturaContext.Provider value={{
            assinatura,
            loading,
            bloqueado,
            alertaTrial,
            alertaAtraso,
            refreshAssinatura,
            gerarLink,
            isDesenvolvedor,
        }}>
            {children}
        </AssinaturaContext.Provider>
    );
};

export const useAssinatura = () => {
    const ctx = useContext(AssinaturaContext);
    if (!ctx) throw new Error('useAssinatura must be used within AssinaturaProvider');
    return ctx;
};
