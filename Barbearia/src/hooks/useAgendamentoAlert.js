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
            
            console.log('[Poll] Verificando pendências:', list.length);
            
            // Sincroniza a lista de cards com o que está no banco agora
            setNewAgendamentos(list);
            
            if (list.length > 0) {
                // Toca o som apenas se aparecer um ID MAIOR do que o que já vimos antes
                const maxIdNoBanco = Math.max(...list.map(a => (a.id || a.Id || a.ID || 0)));
                
                if (maxIdNoBanco > lastNotifiedIdRef.current) {
                    console.log('[Poll] NOVO agendamento real detectado! Tocando som.');
                    playNotificationSound();
                    lastNotifiedIdRef.current = maxIdNoBanco;
                    localStorage.setItem('last_notified_id', String(maxIdNoBanco));
                }
            }
        } catch (err) {
            console.error('[Poll] Erro ao sincronizar alertas:', err);
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
