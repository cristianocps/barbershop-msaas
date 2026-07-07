import React, { useState } from 'react';
import { CreditCard, Copy, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/UI/PageHeader';
import { useAssinatura } from '../contexts/AssinaturaContext';
import { useToast } from '../contexts/ToastContext';
import { isAssinaturaBloqueioError } from '../utils/assinaturaBloqueio';
import { trackPixel } from '../utils/metaPixel';

function formatMoney(centavos) {
    const n = (Number(centavos) || 0) / 100;
    return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

function statusLabel(status) {
    const map = {
        trial: 'Período de teste',
        active: 'Ativa',
        overdue: 'Em atraso',
        blocked: 'Bloqueada',
    };
    return map[status] || status;
}

export function Assinatura() {
    const { assinatura, bloqueado, gerarLink, refreshAssinatura, loading } = useAssinatura();
    const toast = useToast();
    const [gerando, setGerando] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const handleGerarLink = async () => {
        setGerando(true);
        try {
            const url = await gerarLink();
            if (!url) throw new Error('Link não retornado.');
            setLinkUrl(url);
            window.open(url, '_blank', 'noopener,noreferrer');
            trackPixel('InitiateCheckout', {
                value: (Number(assinatura?.valorMensalCentavos) || 0) / 100,
                currency: 'BRL',
            });
            toast.success('Link de pagamento gerado. Conclua o pagamento na Infinite Pay.');
        } catch (err) {
            if (!err?.suppressToast && !isAssinaturaBloqueioError(err)) {
                toast.error(err.message || 'Erro ao gerar link de pagamento.');
            }
        } finally {
            setGerando(false);
        }
    };

    const handleCopiar = () => {
        if (!linkUrl) return;
        navigator.clipboard.writeText(linkUrl);
        toast.success('Link copiado.');
    };

    const abrirLink = () => {
        if (linkUrl) window.open(linkUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="page-assinatura">
            <PageHeader
                icon={<CreditCard />}
                title="Assinatura da plataforma"
                subtitle={bloqueado
                    ? 'Seu acesso está suspenso até a confirmação do pagamento.'
                    : 'Gerencie a mensalidade do BarberShop para sua barbearia.'}
            />

            {loading && !assinatura ? (
                <p style={{ color: 'var(--text-muted)' }}>Carregando status...</p>
            ) : (
                <div className="assinatura-card">
                    <div className="assinatura-status-row">
                        <span className="assinatura-label">Status</span>
                        <strong className={`assinatura-badge assinatura-badge--${assinatura?.status || 'trial'}`}>
                            {statusLabel(assinatura?.status)}
                        </strong>
                    </div>

                    {assinatura?.status === 'trial' && (
                        <p className="assinatura-info">
                            Teste gratuito: {assinatura.diasRestantes} dia(s) restante(s).
                        </p>
                    )}

                    {assinatura?.periodoFim && assinatura.status === 'active' && (
                        <p className="assinatura-info">
                            Válido até: {new Date(assinatura.periodoFim).toLocaleDateString('pt-BR')}.
                        </p>
                    )}

                    <p className="assinatura-valor">
                        Mensalidade: <strong>{formatMoney(assinatura?.valorMensalCentavos)}</strong>
                    </p>

                    {bloqueado && assinatura?.mensagem && (
                        <p className="assinatura-alerta">{assinatura.mensagem}</p>
                    )}

                    <div className="assinatura-actions">
                        <button
                            type="button"
                            className="assinatura-btn assinatura-btn--primary"
                            onClick={handleGerarLink}
                            disabled={gerando}
                        >
                            {gerando ? <Loader2 size={18} className="cal-spin" /> : <CreditCard size={18} />}
                            {bloqueado ? 'Pagar e liberar acesso' : 'Gerar link de pagamento'}
                        </button>
                        <button
                            type="button"
                            className="assinatura-btn assinatura-btn--secondary"
                            onClick={refreshAssinatura}
                        >
                            <RefreshCw size={16} /> Atualizar status
                        </button>
                        {linkUrl && (
                            <>
                                <button
                                    type="button"
                                    className="assinatura-btn assinatura-btn--outline"
                                    onClick={abrirLink}
                                >
                                    <ExternalLink size={16} /> Abrir checkout
                                </button>
                                <button
                                    type="button"
                                    className="assinatura-btn assinatura-btn--outline"
                                    onClick={handleCopiar}
                                >
                                    <Copy size={16} /> Copiar link
                                </button>
                            </>
                        )}
                    </div>

                    {linkUrl && (
                        <div className="assinatura-link-box">
                            <label>Link de pagamento Infinite Pay</label>
                            <div className="assinatura-link-row">
                                <input
                                    type="text"
                                    className="assinatura-link-input"
                                    readOnly
                                    value={linkUrl}
                                    onFocus={(e) => e.target.select()}
                                />
                                <button
                                    type="button"
                                    className="assinatura-btn assinatura-btn--secondary"
                                    onClick={handleCopiar}
                                    aria-label="Copiar link"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="assinatura-hint">
                        O pagamento é processado pela Infinite Pay. Após a confirmação, o acesso é liberado automaticamente.
                    </p>
                </div>
            )}
        </div>
    );
}
