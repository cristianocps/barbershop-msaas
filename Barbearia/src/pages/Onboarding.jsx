import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Scissors, Users, CreditCard, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { OnboardingService } from '../services/Configuracoes/OnboardingService';
import { useToast } from '../contexts/ToastContext';

const ICONS = {
    empresa: Building2,
    servicos: Scissors,
    profissionais: Users,
    pagamentos: CreditCard,
};

export function Onboarding() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const load = async () => {
        try {
            const res = await OnboardingService.obterStatus();
            const s = res?.data ?? res?.Data ?? {};
            setStatus(s);
            if (s.onboardingCompleto || (s.percentual ?? 0) >= 100) {
                navigate('/', { replace: true });
            }
        } catch (err) {
            toast.error(err.message || 'Erro ao carregar onboarding.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleConcluir = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            await OnboardingService.concluir();
            toast.success('Configuração inicial concluída!');
            navigate('/', { replace: true });
        } catch (err) {
            toast.error(err.message || 'Erro ao concluir.');
            setActionLoading(false);
        }
    };

    const handlePular = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            await OnboardingService.concluir();
            navigate('/', { replace: true });
        } catch (err) {
            toast.error(err.message || 'Erro ao pular onboarding.');
            setActionLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Carregando setup...</div>;

    const etapas = status?.etapas ?? [];

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem' }}>
            <h1 style={{ marginBottom: '0.5rem' }}>Configure sua barbearia</h1>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                Complete as etapas abaixo para começar a receber agendamentos. Progresso: {status?.percentual ?? 0}%
            </p>

            <div style={{
                height: 8,
                background: '#e2e8f0',
                borderRadius: 4,
                marginBottom: '2rem',
                overflow: 'hidden',
            }}>
                <div style={{
                    width: `${status?.percentual ?? 0}%`,
                    height: '100%',
                    background: '#d4af37',
                    transition: 'width 0.3s',
                }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {etapas.map((etapa) => {
                    const Icon = ICONS[etapa.key] ?? Circle;
                    return (
                        <div
                            key={etapa.key}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: '#fff',
                                borderRadius: 12,
                                border: `1px solid ${etapa.concluida ? '#86efac' : '#e2e8f0'}`,
                                flexWrap: 'wrap',
                                minWidth: 0,
                            }}
                        >
                            {etapa.concluida
                                ? <CheckCircle2 color="#22c55e" size={28} />
                                : <Icon color="#d4af37" size={28} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{etapa.titulo}</strong>
                                {etapa.concluida && <span style={{ marginLeft: 8, color: '#22c55e', fontSize: '0.85rem' }}>Concluída</span>}
                            </div>
                            {etapa.rota && (
                                <Link
                                    to={etapa.rota}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        color: '#1a1a2e',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        background: '#f6b001',
                                        padding: '8px 14px',
                                        borderRadius: 8,
                                        flexShrink: 0,
                                    }}
                                >
                                    Configurar <ArrowRight size={14} />
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            {(status?.percentual ?? 0) >= 100 && (
                <button
                    type="button"
                    onClick={handleConcluir}
                    disabled={actionLoading}
                    style={{
                        marginTop: '2rem',
                        width: '100%',
                        padding: '12px',
                        background: '#0d1526',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        fontWeight: 700,
                        cursor: actionLoading ? 'wait' : 'pointer',
                        opacity: actionLoading ? 0.6 : 1,
                    }}
                >
                    {actionLoading ? 'Aguarde...' : 'Ir para o painel'}
                </button>
            )}

            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                    type="button"
                    onClick={handlePular}
                    disabled={actionLoading}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.9rem',
                        cursor: actionLoading ? 'wait' : 'pointer',
                        textDecoration: 'underline',
                        opacity: actionLoading ? 0.6 : 1,
                    }}
                >
                    {actionLoading ? 'Pulando...' : 'Pular por agora'}
                </button>
            </p>
        </div>
    );
}
