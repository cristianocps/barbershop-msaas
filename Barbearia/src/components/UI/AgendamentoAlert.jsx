import React from 'react';
import { Bell, X, Check, Eye } from 'lucide-react';
import { useAgendamentoAlert } from '../../hooks/useAgendamentoAlert';
import { useNavigate } from 'react-router-dom';

export function AgendamentoAlert() {
    const { newAgendamentos, removeAlert } = useAgendamentoAlert();
    const navigate = useNavigate();

    if (newAgendamentos.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '320px',
            width: '100%'
        }}>
            {newAgendamentos.map((ag) => (
                <div key={ag.id || ag.Id || ag.ID} style={{
                    background: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    border: '1px solid #e5e7eb',
                    padding: '16px',
                    animation: 'slideUp 0.4s ease-out forwards',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '4px',
                        height: '100%',
                        background: '#3b82f6'
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ padding: '6px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px' }}>
                                <Bell size={16} className="text-blue-600" />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>Novo Agendamento!</span>
                        </div>
                        <button onClick={() => removeAlert(ag.id || ag.Id || ag.ID)} style={{ color: '#9ca3af', cursor: 'pointer', background: 'none', border: 'none' }}>
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>{ag.nomeCliente || ag.NomeCliente || 'Cliente'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}> Serviço: {ag.descricao || ag.Descricao}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                            📅 {new Date(ag.dtAgendamento || ag.DtAgendamento).toLocaleString('pt-BR')}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => {
                                removeAlert(ag.id || ag.Id || ag.ID);
                                navigate('/agendamentos');
                            }}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                            }}
                        >
                            <Eye size={14} /> Ver Painel
                        </button>
                    </div>
                </div>
            ))}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
