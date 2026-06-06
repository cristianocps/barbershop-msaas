import { useState, useEffect, useRef, useCallback } from 'react';
import { AgendamentosService } from '../services/Agendamentos/AgendamentosService';
import { useAuth } from '../contexts/AuthContext';
import { useAssinatura } from '../contexts/AssinaturaContext';

const DISMISSED_KEY = 'dismissed_agendamento_ids';
const SHOWN_KEY = 'shown_agendamento_ids';
const LAST_SOUND_ID_KEY = 'last_notified_agendamento_id';
const ALERT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const AUTO_DISMISS_MS = 10000; // 10 segundos

function getStorageMap(key) {
    try {
        const raw = localStorage.getItem(key);
        const obj = raw ? JSON.parse(raw) : {};
        return typeof obj === 'object' && obj !== null ? obj : {};
    } catch {
        return {};
    }
}

function setStorageMap(key, map) {
    try {
        localStorage.setItem(key, JSON.stringify(map));
    } catch {
        // ignore
    }
}

function cleanOldEntries(map, ttlMs = ALERT_TTL_MS) {
    const now = Date.now();
    const cleaned = {};
    for (const [k, v] of Object.entries(map)) {
        const ts = typeof v === 'number' ? v : v?.timestamp;
        if (ts && (now - ts) < ttlMs) {
            cleaned[k] = v;
        }
    }
    return cleaned;
}

function isIdInMap(map, id) {
    return Object.prototype.hasOwnProperty.call(map, String(id));
}

function addIdToMap(map, id) {
    return { ...map, [String(id)]: Date.now() };
}

function getId(item) {
    return item?.id || item?.Id || item?.ID;
}

function isPastAgendamento(item) {
    const dt = item?.dtAgendamento || item?.DtAgendamento;
    if (!dt) return false;
    const agDate = new Date(dt);
    const now = new Date();
    // Considera passado se a data/hora do agendamento já terminou (com margem de 5 min)
    return agDate.getTime() < (now.getTime() - 5 * 60 * 1000);
}

export function useAgendamentoAlert() {
    const { isAuthenticated } = useAuth();
    const { bloqueado, isDesenvolvedor } = useAssinatura();
    const [pendentes, setPendentes] = useState([]);
    const [proximos, setProximos] = useState([]);
    const autoDismissTimer = useRef(null);
    const lastSoundIdRef = useRef(parseInt(localStorage.getItem(LAST_SOUND_ID_KEY) || '0'));

    const dismissAll = useCallback((ids) => {
        let dismissed = cleanOldEntries(getStorageMap(DISMISSED_KEY));
        ids.forEach(id => {
            dismissed = addIdToMap(dismissed, id);
        });
        setStorageMap(DISMISSED_KEY, dismissed);
    }, []);

    const markAsShown = useCallback((ids) => {
        let shown = cleanOldEntries(getStorageMap(SHOWN_KEY));
        ids.forEach(id => {
            shown = addIdToMap(shown, id);
        });
        setStorageMap(SHOWN_KEY, shown);
    }, []);

    const removeGroup = useCallback((tipo) => {
        const ids = tipo === 'pendente' ? pendentes.map(getId) : proximos.map(getId);
        dismissAll(ids);
        if (tipo === 'pendente') setPendentes([]);
        else setProximos([]);
    }, [pendentes, proximos, dismissAll]);

    const removeAll = useCallback(() => {
        dismissAll([...pendentes.map(getId), ...proximos.map(getId)]);
        setPendentes([]);
        setProximos([]);
    }, [pendentes, proximos, dismissAll]);

    const checkNewAgendamentos = useCallback(async () => {
        if (!isAuthenticated || (bloqueado && !isDesenvolvedor)) return;

        try {
            const [pendentesRes, proximosRes] = await Promise.all([
                AgendamentosService.getPendentesHoje(),
                AgendamentosService.getProximos(),
            ]);

            const pendentesRaw = pendentesRes?.data || pendentesRes?.Data || [];
            const proximosRaw = proximosRes?.data || proximosRes?.Data || [];

            const dismissed = cleanOldEntries(getStorageMap(DISMISSED_KEY));
            const shown = cleanOldEntries(getStorageMap(SHOWN_KEY));

            // Filtra: não dispensados, não mostrados anteriormente, e não são de dias anteriores
            const pendentesFiltered = pendentesRaw.filter(a => {
                const id = getId(a);
                return id && !isIdInMap(dismissed, id) && !isIdInMap(shown, id) && !isPastAgendamento(a);
            }).map(a => ({ ...a, tipoAlerta: 'pendente' }));

            const proximosFiltered = proximosRaw.filter(a => {
                const id = getId(a);
                return id && !isIdInMap(dismissed, id) && !isIdInMap(shown, id) && !isPastAgendamento(a);
            }).map(a => ({ ...a, tipoAlerta: 'proximo' }));

            setPendentes(pendentesFiltered);
            setProximos(proximosFiltered);

            // Marca como shown para não repetir
            if (pendentesFiltered.length > 0) {
                markAsShown(pendentesFiltered.map(getId));
            }
            if (proximosFiltered.length > 0) {
                markAsShown(proximosFiltered.map(getId));
            }

            // Som apenas para novos pendentes
            if (pendentesFiltered.length > 0) {
                const maxId = Math.max(...pendentesFiltered.map(a => getId(a) || 0));
                if (maxId > lastSoundIdRef.current) {
                    playNotificationSound();
                    lastSoundIdRef.current = maxId;
                    localStorage.setItem(LAST_SOUND_ID_KEY, String(maxId));
                }
            }
        } catch (err) {
            console.error('[Poll] Erro ao sincronizar alertas:', err);
        }
    }, [isAuthenticated, bloqueado, isDesenvolvedor, markAsShown]);

    const playNotificationSound = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.warn('Autoplay blocked or audio error:', e));
        } catch (e) {
            console.error('Falha ao tocar som:', e);
        }
    };

    // Polling
    useEffect(() => {
        if (isAuthenticated && !(bloqueado && !isDesenvolvedor)) {
            checkNewAgendamentos();
            const interval = setInterval(checkNewAgendamentos, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, bloqueado, isDesenvolvedor, checkNewAgendamentos]);

    // Auto-dismiss: limpa os alertas após 10s quando há novos dados
    useEffect(() => {
        const total = pendentes.length + proximos.length;
        if (total === 0) return;

        if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
        autoDismissTimer.current = setTimeout(() => {
            removeAll();
        }, AUTO_DISMISS_MS);

        return () => {
            if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
        };
    }, [pendentes, proximos, removeAll]);

    return { pendentes, proximos, removeGroup, removeAll };
}
