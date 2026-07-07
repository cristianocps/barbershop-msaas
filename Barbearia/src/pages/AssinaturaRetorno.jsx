import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { trackPixel } from '../utils/metaPixel';

export function AssinaturaRetorno() {
    const [params] = useSearchParams();
    const orderNsu = params.get('order_nsu');

    useEffect(() => {
        document.title = 'Pagamento — BarberShop';
        trackPixel('Subscribe', { currency: 'BRL' });
    }, []);

    return (
        <div className="page-assinatura-retorno">
            <div className="page-assinatura-retorno__card">
                <CheckCircle size={48} color="#16a34a" style={{ marginBottom: '1rem' }} />
                <h1>Pagamento recebido</h1>
                <p>
                    Se o pagamento foi confirmado pela Infinite Pay, sua assinatura será liberada em instantes.
                    {orderNsu && (
                        <>
                            <br />
                            <small style={{ color: '#64748b' }}>Referência: {orderNsu}</small>
                        </>
                    )}
                </p>
                <div className="page-assinatura-retorno__actions">
                    <Link to="/assinatura" className="assinatura-btn assinatura-btn--primary">
                        Ver status da assinatura
                    </Link>
                </div>
            </div>
        </div>
    );
}
