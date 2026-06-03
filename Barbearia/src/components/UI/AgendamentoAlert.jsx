import React from 'react';
import { Bell, X, Eye, CalendarDays, User, Clock } from 'lucide-react';
import { useAgendamentoAlert } from '../../hooks/useAgendamentoAlert';
import { useNavigate } from 'react-router-dom';

function SingleAlert({ ag, removeAlert, navigate }) {
    const isProximo = ag.tipoAlerta === 'proximo';

    const handleAction = () => {
        removeAlert(ag.id || ag.Id || ag.ID);
        navigate('/agendamentos');
    };

    const dataHora = (ag?.dtAgendamento || ag?.DtAgendamento) 
        ? new Date(ag?.dtAgendamento || ag?.DtAgendamento).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : 'Horário não informado';

    const borderColor = isProximo ? '#ef4444' : '#f6b001';
    const badgeColor = isProximo ? '#fee2e2' : '#fef3c7';
    const badgeText = isProximo ? '#dc2626' : '#f59e0b';
    const labelText = isProximo ? 'Em breve!' : 'Novo Agendamento!';

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
                onClick={() => removeAlert(ag.id || ag.Id || ag.ID)}
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

            {/* Nome do Cliente */}
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1e293b', marginBottom: '10px' }}>
                {ag?.NomeCliente || ag?.nomeCliente || ag?.Descricao || ag?.descricao || 'Cliente'}
            </div>
            
            {/* Detalhes do Serviço e Profissional */}
            <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '15px', lineHeight: '1.5' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <span style={{ color: isProximo ? '#ef4444' : '#f6b001', fontWeight: 700 }}>Serviço:</span>
                        <span style={{ color: '#1e293b', fontWeight: 600 }}>{ag?.Servico || ag?.servico || 'Não informado'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="#94a3b8" />
                        <span style={{ fontSize: '0.85rem' }}>Profissional: <strong>{ag?.NomeProfissional || ag?.nomeProfissional || 'A definir'}</strong></span>
                    </div>
                </div>

                <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', 
                    marginTop: '10px', fontSize: '0.85rem', color: '#64748b',
                    background: '#f8fafc', padding: '6px 10px', borderRadius: '8px',
                    width: 'fit-content'
                }}>
                    <CalendarDays size={14} /> {dataHora}
                </div>
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
    const { newAgendamentos, removeAlert } = useAgendamentoAlert();
    const navigate = useNavigate();

    if (newAgendamentos.length === 0) return null;

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
            {newAgendamentos.filter(a => a !== null && a !== undefined).map((ag) => (
                <SingleAlert 
                    key={`${ag.tipoAlerta || 'alert'}-${ag.id || ag.Id || ag.ID || Math.random()}`} 
                    ag={ag} 
                    removeAlert={removeAlert} 
                    navigate={navigate} 
                />
            ))}

            <style>{`
                @keyframes slideDown {
                    from { transform: translate(-50%, -50px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                @keyframes slideDown {
                    0% { transform: translateY(-30px) scale(0.9); opacity: 0; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
