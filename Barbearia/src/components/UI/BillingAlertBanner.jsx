import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { useAssinatura } from '../../contexts/AssinaturaContext';

function formatMoney(centavos) {
    const n = (Number(centavos) || 0) / 100;
    return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

export function BillingAlertBanner() {
    const { assinatura, bloqueado, alertaTrial, alertaAtraso, isDesenvolvedor } = useAssinatura();

    if (isDesenvolvedor || !assinatura) return null;
    if (!alertaTrial && !alertaAtraso) return null;

    const isUrgent = bloqueado || alertaAtraso;

    return (
        <div
            className={`billing-alert ${isUrgent ? 'billing-alert--danger' : 'billing-alert--warning'}`}
            role="alert"
        >
            <div className="billing-alert__content">
                {isUrgent ? <AlertTriangle size={18} /> : <CreditCard size={18} />}
                <span>
                    {bloqueado || assinatura.status === 'overdue'
                        ? 'Pagamento da plataforma em atraso. Regularize para continuar usando o sistema.'
                        : `Seu período de teste termina em ${assinatura.diasRestantes} dia(s). Mensalidade: ${formatMoney(assinatura.valorMensalCentavos)}.`}
                </span>
            </div>
            <Link to="/assinatura" className="billing-alert__action">
                {isUrgent ? 'Pagar agora' : 'Ver assinatura'}
            </Link>
        </div>
    );
}
