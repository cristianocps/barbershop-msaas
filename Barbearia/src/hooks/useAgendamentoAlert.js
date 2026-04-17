import { useState, useEffect, useRef, useCallback } from 'react';
import { AgendamentosService } from '../services/Agendamentos/AgendamentosService';
import { useAuth } from '../contexts/AuthContext';

export function useAgendamentoAlert() {
    const { isAuthenticated } = useAuth();
    const [newAgendamentos, setNewAgendamentos] = useState([]);
    const lastNotifiedIdRef = useRef(parseInt(localStorage.getItem('last_notified_id') || '0'));
    const pollInterval = useRef(null);

    const checkNewAgendamentos = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const res = await AgendamentosService.getPendentesHoje();
            const list = res?.data || res?.Data || [];
            
            if (list.length > 0) {
                // Filtra apenas os que são MAIORES que o último ID notificado
                const fresh = list.filter(a => (a.id || a.Id || a.ID) > lastNotifiedIdRef.current);
                
                if (fresh.length > 0) {
                    setNewAgendamentos(prev => [...prev, ...fresh]);
                    
                    // Atualiza o último ID para o maior da lista atual
                    const maxId = Math.max(...list.map(a => (a.id || a.Id || a.ID)));
                    lastNotifiedIdRef.current = maxId;
                    localStorage.setItem('last_notified_id', String(maxId));
                    playNotificationSound();
                }
            }
        } catch (err) {
            console.error('Erro no polling de agendamentos:', err);
        }
    }, [isAuthenticated]);

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
        if (isAuthenticated) {
            // Executa imediatamente ao carregar
            checkNewAgendamentos();
            
            // Inicia o intervalo (30 segundos)
            pollInterval.current = setInterval(checkNewAgendamentos, 30000);
        }

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [isAuthenticated, checkNewAgendamentos]);

    const removeAlert = (id) => {
        setNewAgendamentos(prev => prev.filter(a => (a.id || a.Id || a.ID) !== id));
    };

    return { newAgendamentos, removeAlert };
}
