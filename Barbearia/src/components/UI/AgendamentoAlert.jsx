import React from 'react';
import { Bell, X, Eye, CalendarDays, Clock } from 'lucide-react';
import { useAgendamentoAlert } from '../../hooks/useAgendamentoAlert';
import { useNavigate } from 'react-router-dom';

function GroupAlert({ tipo, count, removeGroup, navigate }) {
    const isProximo = tipo === 'proximo';

    const handleAction = () => {
        removeGroup(tipo);
        navigate('/agendamentos');
    };

    const borderColor = isProximo ? '#ef4444' : '#f6b001';
    const badgeColor = isProximo ? '#fee2e2' : '#fef3c7';
    const badgeText = isProximo ? '#dc2626' : '#f59e0b';
    const labelText = isProximo
        ? `Agendamento${count > 1 ? 's' : ''} em breve!`
        : `Novo${count > 1 ? 's' : ''} Agendamento${count > 1 ? 's' : ''}!`;

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
            borderLeft: `5px solid ${borderColor}`,
            padding: '20px',
            marginBottom: '15px',
            width: '380px',
            maxWidth: '100%',
            pointerEvents: 'auto',
            animation: 'slideDown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            position: 'relative'
        }}>
            {/* Botão Fechar */}
            <button
                onClick={() => removeGroup(tipo)}
                style={{
                    position: 'absolute', top: '15px', right: '15px',
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: '#94a3b8', padding: '5px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                <X size={18} />
            </button>

            {/* Cabeçalho do Alerta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: badgeText, marginBottom: '12px' }}>
                <Bell size={18} fill={badgeColor} />
                <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900 }}>
                    {labelText}
                </strong>
                {isProximo && (
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#dc2626',
                        background: '#fee2e2',
                        padding: '2px 8px',
                        borderRadius: '6px',
                    }}>
                        <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                        Próximo
                    </span>
                )}
            </div>

            {/* Conteúdo Agrupado */}
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1e293b', marginBottom: '10px' }}>
                {isProximo
                    ? `${count} agendamento${count > 1 ? 's' : ''} nas próximas 2h`
                    : `${count} agendamento${count > 1 ? 's pendentes' : ' pendente'}`
                }
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>
                <CalendarDays size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                {isProximo
                    ? 'Verifique os horários que estão próximos.'
                    : 'Aguardando confirmação no painel.'}
            </div>

            {/* Ação */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleAction}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: '#1a1a2e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(26,26,46,0.2)'
                    }}
                >
                    <Eye size={16} /> Ver no Painel
                </button>
            </div>
        </div>
    );
}

export function AgendamentoAlert() {
    const { pendentes, proximos, removeGroup } = useAgendamentoAlert();
    const navigate = useNavigate();

    const hasPendentes = pendentes.length > 0;
    const hasProximos = proximos.length > 0;

    if (!hasPendentes && !hasProximos) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '400px',
            width: 'calc(100% - 40px)',
            pointerEvents: 'none'
        }}>
            {hasPendentes && (
                <GroupAlert
                    key="grupo-pendentes"
                    tipo="pendente"
                    count={pendentes.length}
                    removeGroup={removeGroup}
                    navigate={navigate}
                />
            )}
            {hasProximos && (
                <GroupAlert
                    key="grupo-proximos"
                    tipo="proximo"
                    count={proximos.length}
                    removeGroup={removeGroup}
                    navigate={navigate}
                />
            )}

            <style>{`
                @keyframes slideDown {
                    0% { transform: translateY(-30px) scale(0.9); opacity: 0; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
