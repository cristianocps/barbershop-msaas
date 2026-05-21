import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PortalClienteService } from '../../services/Acessos/PortalClienteService';

const statusLabel = {
    0: 'Pendente',
    1: 'Confirmado',
    2: 'Concluído',
    3: 'Cancelado',
};

export function ClienteAgendamentos() {
    const [lista, setLista] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await PortalClienteService.listarAgendamentos();
                setLista(res?.data ?? []);
            } catch {
                setLista([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <p>Carregando agendamentos...</p>;

    return (
        <div>
            <h2 style={{ marginBottom: '1rem' }}>Meus agendamentos</h2>
            {lista.length === 0 ? (
                <div style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '2rem',
                    textAlign: 'center',
                    border: '1px solid #e2e8f0',
                }}>
                    <p style={{ color: '#64748b', marginBottom: '1rem' }}>Você ainda não tem agendamentos.</p>
                    <Link to="/agendar" style={{ color: '#d4af37', fontWeight: 700 }}>Agendar em uma barbearia</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {lista.map((a) => (
                        <div
                            key={a.id}
                            style={{
                                background: '#fff',
                                borderRadius: 12,
                                padding: '1rem',
                                border: '1px solid #e2e8f0',
                            }}
                        >
                            <strong>{a.empresaNome}</strong>
                            <p style={{ margin: '0.25rem 0', color: '#475569' }}>{a.descricao}</p>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                                {format(new Date(a.dtAgendamento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                {' · '}
                                {statusLabel[a.status] ?? `Status ${a.status}`}
                            </p>
                            {a.empresaSlug && (
                                <Link to={`/${a.empresaSlug}`} style={{ fontSize: '0.85rem', color: '#d4af37' }}>
                                    Agendar novamente
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
