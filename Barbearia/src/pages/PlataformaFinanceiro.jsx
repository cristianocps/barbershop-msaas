import React, { useState, useEffect, useCallback } from 'react';
import { Building2, CreditCard, RefreshCw, X } from 'lucide-react';
import { PageHeader } from '../components/UI/PageHeader';
import { DataGrid } from '../components/UI/DataGrid';
import { PlataformaFinanceiroService } from '../services/Plataforma/PlataformaFinanceiroService';
import { useToast } from '../contexts/ToastContext';
import { unwrapApiResponse } from '../services/apiHelpers';

const STATUS_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'trial', label: 'Trial' },
    { value: 'active', label: 'Ativo' },
    { value: 'overdue', label: 'Em atraso' },
    { value: 'blocked', label: 'Bloqueado' },
];

const STATUS_LABELS = {
    trial: 'Trial',
    active: 'Ativo',
    overdue: 'Em atraso',
    blocked: 'Bloqueado',
};

function formatMoney(centavos) {
    const n = (Number(centavos) || 0) / 100;
    return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('pt-BR');
}

function StatusBadge({ status }) {
    const s = (status || '').toLowerCase();
    return (
        <span className={`plataforma-status-badge plataforma-status-badge--${s}`}>
            {STATUS_LABELS[s] || status || '—'}
        </span>
    );
}

function unwrapList(res) {
    const { ok, data, message } = unwrapApiResponse(res);
    if (!ok) throw new Error(message || 'Erro na operação');
    return Array.isArray(data) ? data : [];
}

export function PlataformaFinanceiro() {
    const toast = useToast();
    const [filtroStatus, setFiltroStatus] = useState('');
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [cobrancas, setCobrancas] = useState([]);
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);
    const [overrideStatus, setOverrideStatus] = useState('active');
    const [overrideDias, setOverrideDias] = useState(30);
    const [salvando, setSalvando] = useState(false);

    const loadEmpresas = useCallback(async () => {
        setLoading(true);
        try {
            const res = await PlataformaFinanceiroService.listarEmpresas(filtroStatus || undefined);
            setEmpresas(unwrapList(res));
        } catch (err) {
            toast.error(err.message || 'Erro ao carregar empresas.');
            setEmpresas([]);
        } finally {
            setLoading(false);
        }
    }, [filtroStatus, toast]);

    useEffect(() => { loadEmpresas(); }, [loadEmpresas]);

    const abrirDetalhe = async (row) => {
        setSelected(row);
        setOverrideStatus((row.status ?? row.Status ?? 'active').toLowerCase());
        setOverrideDias(30);
        setLoadingDetalhe(true);
        setCobrancas([]);
        try {
            const res = await PlataformaFinanceiroService.listarCobrancas(row.idEmpresa ?? row.IdEmpresa);
            setCobrancas(unwrapList(res));
        } catch {
            setCobrancas([]);
        } finally {
            setLoadingDetalhe(false);
        }
    };

    const fecharDetalhe = () => setSelected(null);

    const aplicarOverride = async () => {
        if (!selected) return;
        const id = selected.idEmpresa ?? selected.IdEmpresa;
        const fim = new Date();
        fim.setDate(fim.getDate() + parseInt(overrideDias, 10) || 30);
        setSalvando(true);
        try {
            const res = await PlataformaFinanceiroService.atualizarAssinatura(id, {
                status: overrideStatus,
                periodoFim: fim.toISOString(),
            });
            const { ok, message } = unwrapApiResponse(res);
            if (!ok) throw new Error(message);
            toast.success('Assinatura atualizada.');
            fecharDetalhe();
            loadEmpresas();
        } catch (err) {
            toast.error(err.message || 'Erro ao atualizar.');
        } finally {
            setSalvando(false);
        }
    };

    const gerarLinkStaff = async (row) => {
        const id = row.idEmpresa ?? row.IdEmpresa;
        try {
            const res = await PlataformaFinanceiroService.gerarLink(id);
            const { ok, data, message } = unwrapApiResponse(res);
            if (!ok) throw new Error(message);
            const url = data?.url ?? data?.Url;
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
                toast.success('Link de pagamento gerado.');
            }
        } catch (err) {
            toast.error(err.message || 'Erro ao gerar link.');
        }
    };

    const columns = [
        { key: 'descricao', label: 'Barbearia', render: (r) => r.descricao ?? r.Descricao },
        { key: 'slug', label: 'Slug', render: (r) => r.slug ?? r.Slug ?? '—' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status ?? r.Status} /> },
        { key: 'dias', label: 'Dias restantes', render: (r) => r.diasRestantes ?? r.DiasRestantes ?? 0 },
        { key: 'valor', label: 'Mensalidade', render: (r) => formatMoney(r.valorMensalCentavos ?? r.ValorMensalCentavos) },
        { key: 'fim', label: 'Período / Trial', render: (r) => formatDate(r.periodoFim ?? r.PeriodoFim ?? r.trialEndsAt ?? r.TrialEndsAt) },
        {
            key: 'acoes',
            label: 'Ações',
            render: (r) => (
                <div className="table-actions">
                    <button type="button" className="assinatura-btn assinatura-btn--secondary assinatura-btn--sm" onClick={() => abrirDetalhe(r)}>
                        Detalhes
                    </button>
                    <button type="button" className="assinatura-btn assinatura-btn--outline assinatura-btn--sm" onClick={() => gerarLinkStaff(r)}>
                        <CreditCard size={14} /> Link
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="page-plataforma-financeiro">
            <PageHeader
                icon={<Building2 />}
                title="Financeiro da plataforma"
                subtitle="Gestão de assinaturas de todas as barbearias"
            />

            <div className="page-filters">
                <div className="page-filters-field">
                    <label>Status</label>
                    <select
                        className="page-search-input"
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value || 'all'} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
                <button type="button" className="page-filters-btn" onClick={loadEmpresas}>
                    <RefreshCw size={16} /> Atualizar
                </button>
            </div>

            <DataGrid
                columns={columns}
                data={empresas}
                loading={loading}
                emptyTitle="Nenhuma barbearia encontrada"
                emptyMessage="Ajuste o filtro de status ou aguarde novos cadastros."
            />

            {selected && (
                <div className="admin-modal-overlay" onClick={fecharDetalhe} role="presentation">
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                        <div className="admin-modal__header">
                            <h3>{selected.descricao ?? selected.Descricao}</h3>
                            <button type="button" className="admin-modal__close" onClick={fecharDetalhe} aria-label="Fechar">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="admin-modal__meta">
                            <p>Status: <StatusBadge status={selected.status ?? selected.Status} /></p>
                            <p>Slug: <strong>{selected.slug ?? selected.Slug ?? '—'}</strong></p>
                            <p>Último pagamento: <strong>{formatDate(selected.dtUltimoPagamento ?? selected.DtUltimoPagamento)}</strong></p>
                            <p>Mensalidade: <strong>{formatMoney(selected.valorMensalCentavos ?? selected.ValorMensalCentavos)}</strong></p>
                        </div>

                        <p className="admin-modal__section-title">Override manual</p>
                        <div className="admin-form-field">
                            <label htmlFor="override-status">Novo status</label>
                            <select
                                id="override-status"
                                className="admin-form-input"
                                value={overrideStatus}
                                onChange={(e) => setOverrideStatus(e.target.value)}
                            >
                                <option value="trial">Trial</option>
                                <option value="active">Ativo</option>
                                <option value="overdue">Em atraso</option>
                                <option value="blocked">Bloqueado</option>
                            </select>
                        </div>
                        <div className="admin-form-field">
                            <label htmlFor="override-dias">Estender período (dias a partir de hoje)</label>
                            <input
                                id="override-dias"
                                type="number"
                                min={1}
                                className="admin-form-input"
                                value={overrideDias}
                                onChange={(e) => setOverrideDias(e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="assinatura-btn assinatura-btn--primary"
                            onClick={aplicarOverride}
                            disabled={salvando}
                        >
                            {salvando ? 'Salvando...' : 'Aplicar alterações'}
                        </button>

                        <p className="admin-modal__section-title">Histórico de cobranças</p>
                        {loadingDetalhe ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Carregando...</p>
                        ) : (
                            <ul className="cobrancas-list">
                                {cobrancas.length === 0 ? (
                                    <li className="cobrancas-list__empty">Nenhuma cobrança registrada.</li>
                                ) : (
                                    cobrancas.map((c) => {
                                        const gs = (c.gatewayStatus ?? c.GatewayStatus ?? '').toLowerCase();
                                        return (
                                            <li key={c.id ?? c.Id}>
                                                <strong>{c.referencia ?? c.Referencia}</strong>
                                                {' — '}
                                                {formatMoney(c.valorCentavos ?? c.ValorCentavos)}
                                                {' — '}
                                                <span className={`cobrancas-list__status cobrancas-list__status--${gs}`}>
                                                    {gs === 'paid' ? 'Pago' : gs === 'pending' ? 'Pendente' : gs}
                                                </span>
                                            </li>
                                        );
                                    })
                                )}
                            </ul>
                        )}

                        <div className="admin-modal__actions">
                            <button
                                type="button"
                                className="assinatura-btn assinatura-btn--outline"
                                onClick={() => gerarLinkStaff(selected)}
                            >
                                <CreditCard size={16} /> Gerar link de pagamento
                            </button>
                            <button type="button" className="assinatura-btn assinatura-btn--secondary" onClick={fecharDetalhe}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
