import React, { useEffect, useState, useCallback } from 'react';
import { Smartphone, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/UI/PageHeader';
import { InfinitePayConfigService } from '../services/Configuracoes/InfinitePayConfigService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

function CopyRow({ label, value, onCopy }) {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#6b7280',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
            }}
            >
                {label}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input className="page-search-input" readOnly value={value} style={{ flex: 1, fontSize: '0.8rem' }} />
                <button type="button" className="page-search-btn" onClick={onCopy}>
                    Copiar
                </button>
            </div>
        </div>
    );
}

export function InfinitePayConfig() {
    const toast = useToast();
    const { empresa } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [handle, setHandle] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [descricaoEmpresa, setDescricaoEmpresa] = useState('');

    const load = useCallback(async () => {
        const cfg = await InfinitePayConfigService.obter();
        setHandle(cfg.handle || '');
        setWebhookSecret(cfg.webhookSecret || '');
        setDescricaoEmpresa(cfg.descricaoEmpresa || empresa?.descricao || empresa?.Descricao || '');
    }, [empresa]);

    useEffect(() => {
        load()
            .catch((err) => toast.error(err.message || 'Erro ao carregar configuração.'))
            .finally(() => setLoading(false));
    }, [load, toast]);

    const copy = (text, msg) => {
        navigator.clipboard?.writeText(text);
        toast.success(msg);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!handle.trim()) {
            toast.error('Informe o Infinite Tag (handle) da loja.');
            return;
        }
        setSaving(true);
        try {
            const cfg = await InfinitePayConfigService.salvar({ handle: handle.trim() });
            if (cfg?.webhookSecret) setWebhookSecret(cfg.webhookSecret);
            toast.success('Configuração salva!');
        } catch (err) {
            toast.error(err.message || 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerar = async () => {
        setRegenerating(true);
        try {
            const secret = await InfinitePayConfigService.regenerarSecret();
            setWebhookSecret(secret);
            toast.success('Segredo regenerado!');
        } catch (err) {
            toast.error(err.message || 'Erro ao regenerar segredo.');
        } finally {
            setRegenerating(false);
        }
    };

    const webhookUrl = `${window.location.origin}/api/webhooks/infinitepay`;

    return (
        <div>
            <PageHeader
                icon={<Smartphone />}
                title="Infinite Pay"
                subtitle={descricaoEmpresa ? `Loja: ${descricaoEmpresa}` : 'Configuração da loja'}
            />

            <form
                onSubmit={handleSave}
                style={{
                    maxWidth: '520px',
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
            >
                {loading ? (
                    <p style={{ color: '#6b7280' }}>Carregando...</p>
                ) : (
                    <>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: '#6b7280',
                                marginBottom: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                            }}
                            >
                                Infinite Tag
                            </label>
                            <input
                                className="page-search-input"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                placeholder="$minha_barbearia"
                                disabled={saving || regenerating}
                            />
                        </div>

                        <CopyRow
                            label="URL do webhook"
                            value={webhookUrl}
                            onCopy={() => copy(webhookUrl, 'URL copiada!')}
                        />

                        <CopyRow
                            label="Segredo do webhook"
                            value={webhookSecret || '—'}
                            onCopy={() => webhookSecret && copy(webhookSecret, 'Segredo copiado!')}
                        />

                        <button
                            type="button"
                            className="page-search-btn"
                            onClick={handleRegenerar}
                            disabled={regenerating || saving || !handle.trim()}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}
                        >
                            <RefreshCw size={14} className={regenerating ? 'cal-spin' : ''} />
                            {regenerating ? 'Gerando...' : 'Gerar novo segredo'}
                        </button>

                        <button
                            type="submit"
                            className="page-filters-btn"
                            disabled={saving || regenerating}
                            style={{ width: '100%' }}
                        >
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
