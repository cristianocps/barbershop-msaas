import { useState, useEffect, useRef, useCallback } from 'react';
import { AgendamentosService } from '../services/Agendamentos/AgendamentosService';
import { useAuth } from '../contexts/AuthContext';
import { useAssinatura } from '../contexts/AssinaturaContext';

const DISMISSED_KEY = 'dismissed_agendamentos';

function getDismissedIds() {
    try {
        const raw = sessionStorage.getItem(DISMISSED_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function addDismissedId(id) {
    try {
        const set = getDismissedIds();
        set.add(String(id));
        sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
    } catch {
        // ignore
    }
}

function filterDismissed(list) {
    const dismissed = getDismissedIds();
    return list.filter(a => !dismissed.has(String(a.id || a.Id || a.ID)));
}

export function useAgendamentoAlert() {
    const { isAuthenticated } = useAuth();
    const { bloqueado, isDesenvolvedor } = useAssinatura();
    const [newAgendamentos, setNewAgendamentos] = useState([]);
    const lastNotifiedIdRef = useRef(parseInt(localStorage.getItem('last_notified_id') || '0'));
    const pollInterval = useRef(null);

    const checkNewAgendamentos = useCallback(async () => {
        if (!isAuthenticated || (bloqueado && !isDesenvolvedor)) return;

        try {
            const [pendentesRes, proximosRes] = await Promise.all([
                AgendamentosService.getPendentesHoje(),
                AgendamentosService.getProximos(),
            ]);

            const pendentesRaw = pendentesRes?.data || pendentesRes?.Data || [];
            const proximosRaw = proximosRes?.data || proximosRes?.Data || [];

            const pendentes = filterDismissed(pendentesRaw).map(a => ({
                ...a,
                tipoAlerta: 'pendente',
            }));
            const proximos = filterDismissed(proximosRaw).map(a => ({
                ...a,
                tipoAlerta: 'proximo',
            }));

            const combined = [...pendentes, ...proximos];

            setNewAgendamentos(combined);

            if (pendentes.length > 0) {
                const maxIdNoBanco = Math.max(...pendentes.map(a => (a.id || a.Id || a.ID || 0)));
                if (maxIdNoBanco > lastNotifiedIdRef.current) {
                    playNotificationSound();
                    lastNotifiedIdRef.current = maxIdNoBanco;
                    localStorage.setItem('last_notified_id', String(maxIdNoBanco));
                }
            }
        } catch (err) {
            console.error('[Poll] Erro ao sincronizar alertas:', err);
        }
    }, [isAuthenticated, bloqueado, isDesenvolvedor]);

    const playNotificationSound = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.warn('Autoplay blocked or audio error:', e));
        } catch (e) {
            console.error('Falha ao tocar som:', e);
        }
    };

    useEffect(() => {
        if (isAuthenticated && !(bloqueado && !isDesenvolvedor)) {
            checkNewAgendamentos();
            pollInterval.current = setInterval(checkNewAgendamentos, 30000);
        }

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [isAuthenticated, bloqueado, isDesenvolvedor, checkNewAgendamentos]);

    const removeAlert = (id) => {
        const key = id;
        addDismissedId(key);
        setNewAgendamentos(prev => prev.filter(a => (a.id || a.Id || a.ID) !== key));
    };

    return { newAgendamentos, removeAlert };
}
