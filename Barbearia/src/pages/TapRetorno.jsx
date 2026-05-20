import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { AgendamentosService } from '../services/Agendamentos/AgendamentosService';

export function TapRetorno() {
    const [params] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Processando pagamento...');

    useEffect(() => {
        const orderId = params.get('order_id') || params.get('orderId') || '';
        const nsu = params.get('nsu') || '';
        const aut = params.get('aut') || '';
        const cardBrand = params.get('card_brand') || params.get('cardBrand') || '';
        const warning = params.get('warning') || '';

        if (!orderId) {
            setStatus('error');
            setMessage('Retorno inválido: pedido não identificado.');
            return;
        }

        AgendamentosService.tapCallback({
            orderId,
            nsu,
            aut,
            cardBrand,
            warning,
        })
            .then(() => {
                setStatus(warning ? 'warning' : 'success');
                setMessage(warning || 'Pagamento registrado e agendamento concluído!');
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.message || 'Não foi possível confirmar o pagamento.');
            });
    }, [params]);

    const icon = status === 'loading' ? <Loader2 size={48} className="spin" />
        : status === 'success' ? <CheckCircle size={48} color="#16a34a" />
        : <XCircle size={48} color={status === 'warning' ? '#f59e0b' : '#ef4444'} />;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f8fafc' }}>
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ maxWidth: '420px', width: '100%', background: '#fff', borderRadius: '20px', padding: '32px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                <div style={{ marginBottom: '16px' }}>{icon}</div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px', color: '#111827' }}>
                    {status === 'loading' ? 'Aguarde' : status === 'success' ? 'Pagamento confirmado' : 'Retorno do pagamento'}
                </h1>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 24px' }}>{message}</p>
                <Link to="/agendamentos" style={{ display: 'inline-block', padding: '12px 24px', background: '#1a1a2e', color: '#f6b001', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
                    Voltar aos agendamentos
                </Link>
            </div>
        </div>
    );
}
