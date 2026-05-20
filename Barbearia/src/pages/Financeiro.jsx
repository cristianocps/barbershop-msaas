import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, CreditCard, Wallet, Smartphone } from 'lucide-react';
import { PageHeader } from '../components/UI/PageHeader';
import { DataGrid } from '../components/UI/DataGrid';
import { FinanceiroService, TIPO_PAGAMENTO_LABEL } from '../services/Agendamentos/AgendamentosService';
import { ProfissionaisService } from '../services/Configuracoes/ProfissionaisService';
import { useToast } from '../contexts/ToastContext';

function formatMoney(v) {
    const n = Number(v) || 0;
    return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

function defaultPeriod() {
    const fim = new Date();
    const inicio = new Date();
    inicio.setDate(1);
    inicio.setHours(0, 0, 0, 0);
    fim.setHours(23, 59, 59, 999);
    return {
        inicio: inicio.toISOString().slice(0, 10),
        fim: fim.toISOString().slice(0, 10),
    };
}

export function Financeiro() {
    const toast = useToast();
    const [period, setPeriod] = useState(defaultPeriod);
    const [idProfissional, setIdProfissional] = useState('');
    const [tipoPagamento, setTipoPagamento] = useState('');
    const [profissionais, setProfissionais] = useState([]);
    const [resumo, setResumo] = useState(null);
    const [lancamentos, setLancamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ProfissionaisService.carregarCombo('', 1)
            .then((res) => {
                const lista = res?.Data ?? res?.data ?? [];
                setProfissionais(Array.isArray(lista) ? lista : []);
            })
            .catch(() => setProfissionais([]));
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const inicio = new Date(`${period.inicio}T00:00:00`);
            const fim = new Date(`${period.fim}T23:59:59`);
            const prof = idProfissional ? parseInt(idProfissional, 10) : null;
            const tipo = tipoPagamento ? parseInt(tipoPagamento, 10) : null;

            const [resResumo, resLanc] = await Promise.all([
                FinanceiroService.resumo(inicio, fim, prof, tipo),
                FinanceiroService.lancamentos(inicio, fim, prof, tipo),
            ]);

            setResumo(resResumo?.Data ?? resResumo?.data ?? resResumo ?? {});
            const list = resLanc?.Data ?? resLanc?.data ?? resLanc ?? [];
            setLancamentos(Array.isArray(list) ? list : []);
        } catch (err) {
            toast.error(err.message || 'Erro ao carregar financeiro.');
            setResumo(null);
            setLancamentos([]);
        } finally {
            setLoading(false);
        }
    }, [period, idProfissional, tipoPagamento, toast]);

    useEffect(() => { loadData(); }, [loadData]);

    const cards = [
        { label: 'Total recebido', value: resumo?.totalRecebido ?? resumo?.TotalRecebido, icon: <TrendingUp size={18} />, color: '#16a34a' },
        { label: 'PIX', value: resumo?.totalPix ?? resumo?.TotalPix, icon: <Smartphone size={18} />, color: '#2563eb' },
        { label: 'Cartão', value: resumo?.totalCartao ?? resumo?.TotalCartao, icon: <CreditCard size={18} />, color: '#8b5cf6' },
        { label: 'Dinheiro', value: resumo?.totalDinheiro ?? resumo?.TotalDinheiro, icon: <Wallet size={18} />, color: '#f59e0b' },
        { label: 'Infinite Pay', value: resumo?.totalInfinite ?? resumo?.TotalInfinite, icon: <DollarSign size={18} />, color: '#0f3460' },
    ];

    const columns = [
        {
            label: 'Cliente / agendamento',
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{row.descricao ?? row.Descricao ?? '–'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{row.nomeProfissional ?? row.NomeProfissional ?? ''}</div>
                </div>
            ),
        },
        {
            label: 'Data pagamento',
            render: (row) => {
                const d = row.dtConfirmacaoPagamento ?? row.DtConfirmacaoPagamento;
                if (!d) return '–';
                try {
                    return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                } catch { return '–'; }
            },
        },
        {
            label: 'Tipo',
            render: (row) => TIPO_PAGAMENTO_LABEL[row.tipoPagamento ?? row.TipoPagamento] ?? '–',
        },
        {
            label: 'Valor',
            align: 'right',
            render: (row) => (
                <span style={{ fontWeight: 800, color: '#16a34a' }}>
                    {formatMoney(row.valor ?? row.Valor)}
                </span>
            ),
        },
        {
            label: 'Gateway',
            render: (row) => row.gateway ?? row.Gateway ?? '–',
        },
    ];

    return (
        <div>
            <PageHeader
                icon={<DollarSign />}
                title="Financeiro"
                subtitle="Recebimentos por tipo de pagamento"
            />

            <div className="page-filters">
                <div className="page-filters-field">
                    <label>Início</label>
                    <input type="date" className="page-search-input" value={period.inicio} onChange={(e) => setPeriod((p) => ({ ...p, inicio: e.target.value }))} />
                </div>
                <div className="page-filters-field">
                    <label>Fim</label>
                    <input type="date" className="page-search-input" value={period.fim} onChange={(e) => setPeriod((p) => ({ ...p, fim: e.target.value }))} />
                </div>
                <div className="page-filters-field">
                    <label>Profissional</label>
                    <select className="page-search-input" value={idProfissional} onChange={(e) => setIdProfissional(e.target.value)}>
                        <option value="">Todos</option>
                        {profissionais.map((p) => (
                            <option key={p.id ?? p.ID} value={p.id ?? p.ID}>{p.descricao ?? p.Descricao}</option>
                        ))}
                    </select>
                </div>
                <div className="page-filters-field">
                    <label>Tipo pagamento</label>
                    <select className="page-search-input" value={tipoPagamento} onChange={(e) => setTipoPagamento(e.target.value)}>
                        <option value="">Todos</option>
                        {Object.entries(TIPO_PAGAMENTO_LABEL).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                        ))}
                    </select>
                </div>
                <button type="button" className="page-filters-btn" onClick={loadData}>
                    Atualizar
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
                {cards.map((c) => (
                    <div key={c.label} style={{ background: '#fff', borderRadius: '14px', padding: '14px', border: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: c.color + '18', color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                            {c.icon}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>{c.label}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#111827' }}>
                            {loading ? '…' : formatMoney(c.value)}
                        </p>
                    </div>
                ))}
            </div>

            <DataGrid
                columns={columns}
                data={lancamentos}
                loading={loading}
                page={1}
                pageSize={lancamentos.length || 10}
                total={lancamentos.length}
                onPage={() => {}}
                emptyTitle="Nenhum lançamento no período"
            />
        </div>
    );
}
