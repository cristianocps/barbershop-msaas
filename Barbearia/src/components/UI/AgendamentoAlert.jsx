import React from 'react';
import { Bell, X, Check, Eye } from 'lucide-react';
import { useAgendamentoAlert } from '../../hooks/useAgendamentoAlert';
import { useNavigate } from 'react-router-dom';

export function AgendamentoAlert() {
    const { newAgendamentos, removeAlert } = useAgendamentoAlert();
    const navigate = useNavigate();

    if (newAgendamentos.length === 0) return null;

function SingleAlert({ ag, removeAlert, navigate }) {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            removeAlert(ag.id || ag.Id || ag.ID);
        }, 10000); // 10 segundos
        return () => clearTimeout(timer);
    }, [ag, removeAlert]);

    const handleAction = () => {
        removeAlert(ag.id || ag.Id || ag.ID);
        navigate('/agendamentos');
    };

    const dataHora = (ag.dtAgendamento || ag.DtAgendamento) 
        ? new Date(ag.dtAgendamento || ag.DtAgendamento).toLocaleString('pt-BR')
        : 'Horário não informado';

    return (
        <div style={{
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            padding: '16px',
            animation: 'slideDown 0.4s ease-out forwards',
            position: 'relative',
            overflow: 'hidden',
            pointerEvents: 'auto'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: '#f6b001'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ padding: '6px', background: 'rgba(246,176,1,0.1)', borderRadius: '8px' }}>
                        <Bell size={16} color="#f6b001" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f6b001', textTransform: 'uppercase' }}>Novo Agendamento!</span>
                </div>
                <button onClick={() => removeAlert(ag.id || ag.Id || ag.ID)} style={{ color: '#9ca3af', cursor: 'pointer', background: 'none', border: 'none' }}>
                    <X size={18} />
                </button>
            </div>

            <div onClick={handleAction} style={{ marginBottom: '12px', cursor: 'pointer' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>{ag.nomeCliente || ag.NomeCliente || ag.descricao || 'Cliente'}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}> Serviço: {ag.servico || ag.Servico || 'Não informado'}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                    📅 {dataHora}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                    onClick={handleAction}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: '#f3f4f6',
                        color: '#1a1a2e',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                >
                    <Eye size={14} /> Ver Painel
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
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '380px',
            width: 'calc(100% - 40px)',
            pointerEvents: 'none'
        }}>
            {newAgendamentos.map((ag) => (
                <SingleAlert 
                    key={ag.id || ag.Id || ag.ID || Math.random()} 
                    ag={ag} 
                    removeAlert={removeAlert} 
                    navigate={navigate} 
                />
            ))}

            <style>{`
                @keyframes slideDown {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100px); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
