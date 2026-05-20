import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

/** Página de retorno após checkout Infinite Pay (redirect do cliente). */
export function PagamentoRetorno() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f8fafc' }}>
            <div style={{ maxWidth: '420px', width: '100%', background: '#fff', borderRadius: '20px', padding: '32px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                <CheckCircle size={48} color="#16a34a" style={{ marginBottom: '16px' }} />
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px', color: '#111827' }}>
                    Pagamento em processamento
                </h1>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                    Se o pagamento foi aprovado, o agendamento será concluído automaticamente em instantes.
                </p>
                <Link to="/agendamentos" style={{ display: 'inline-block', padding: '12px 24px', background: '#1a1a2e', color: '#f6b001', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
                    Voltar aos agendamentos
                </Link>
            </div>
        </div>
    );
}
