import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Edit2, XCircle } from 'lucide-react';
import { DataGrid } from '../components/UI/DataGrid';
import { PageHeader, PageSearch } from '../components/UI/PageHeader';
import { FormModal } from '../components/UI/FormModal';
import { AgendamentoForm, AgendamentoFormDefault } from '../components/forms/AgendamentoForm';
import { AgendamentosService } from '../services/Agendamentos/AgendamentosService';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmModal';

export function Agendamentos() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();
    const { confirmModal, askConfirm } = useConfirm();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(AgendamentoFormDefault());

    const isEditing = (form.id ?? 0) !== 0;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const start = (page - 1) * pageSize;
            const res = await AgendamentosService.carregarGrid({ value: searchTerm }, start, pageSize);
            const list = res?.data || res?.Data || [];
            const recordsTotal = res?.recordsTotal || res?.RecordsTotal || 0;
            setData(list);
            setTotal(recordsTotal);
        } catch (err) {
            setError(err.message || 'Erro ao carregar agendamentos');
            toast.error(err.message || 'Falha ao carregar agendamentos');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchTerm, toast]);

    useEffect(() => { loadData(); }, [loadData]);

    const openNew = () => {
        setForm(AgendamentoFormDefault());
        setModalOpen(true);
    };

    const openEdit = async (row) => {
        const id = row.id || row.ID || row.Id;
        setForm(AgendamentoFormDefault());
        setModalOpen(true);
        setModalLoading(true);
        try {
            const res = await AgendamentosService.editar(id);

            // A API retorna { JsonTypes, Mensagem, Data, RecordsTotal }
            // Se JsonTypes = "error", o backend teve um problema (coluna inválida etc.)
            if (res?.JsonTypes === 'error' || res?.jsonTypes === 'error') {
                throw new Error(res?.Mensagem || res?.mensagem || 'Erro ao carregar dados do agendamento');
            }

            const dados = res?.Data ?? res?.data ?? res;
            if (!dados || typeof dados !== 'object' || (!dados.ID && !dados.id)) {
                throw new Error('Dados do agendamento não encontrados');
            }

            // Formata a data para datetime-local input (yyyy-MM-ddTHH:mm)
            const rawDate = dados.DtAgendamento ?? dados.dtAgendamento ?? dados.dtagendamento ?? '';
            let dtFormatted = '';
            if (rawDate) {
                const d = new Date(rawDate);
                if (!isNaN(d)) {
                    dtFormatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                }
            }

            // Mapeia Itens[] retornados pelo backend para form.itens
            const itensBackend = dados.Itens ?? dados.itens ?? [];
            const itensMapeados = Array.isArray(itensBackend) && itensBackend.length > 0
                ? itensBackend.map(i => ({
                    idServico:    String(i.IdServico    ?? i.idServico    ?? ''),
                    valorCobrado: String(i.ValorCobrado ?? i.valorCobrado ?? ''),
                }))
                : [{ idServico: '', valorCobrado: '' }];

            setForm({
                id:             dados.ID             ?? dados.id             ?? id,
                descricao:      dados.Descricao      ?? dados.descricao      ?? '',
                telefone:       dados.Telefone       ?? dados.telefone       ?? '',
                dtAgendamento:  dtFormatted,
                idProfissional: dados.IdProfissional ?? dados.idProfissional ?? '',
                itens:          itensMapeados,
                observacao:     dados.Observacao     ?? dados.observacao     ?? '',
                status:         dados.Status         ?? dados.status         ?? 1,
            });
        } catch (err) {
            toast.error('Erro ao carregar dados: ' + err.message);
            setModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.descricao?.trim()) {
            toast.error('Informe o nome do cliente.');
            return;
        }
        if (!form.dtAgendamento) {
            toast.error('Informe a data e hora do agendamento.');
            return;
        }
        setSaving(true);
        try {
            // Monta Itens[] para o backend (agendamento_itens)
            const itensPayload = (form.itens ?? [])
                .filter(i => i.idServico)
                .map(i => ({
                    idServico:    parseInt(i.idServico),
                    valorCobrado: parseFloat(i.valorCobrado) || 0,
                    status:       1,
                }));

            await AgendamentosService.alterar({
                id:             form.id || 0,
                descricao:      form.descricao,
                telefone:       form.telefone     || '',
                dtAgendamento:  form.dtAgendamento,
                idProfissional: form.idProfissional ? parseInt(form.idProfissional) : null,
                itens:          itensPayload,
                observacao:     form.observacao    || '',
                status:         form.status        ?? 1,
            });
            toast.success(isEditing ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!');
            setModalOpen(false);
            loadData();
        } catch (err) {
            toast.error(err.message || 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const handleInativar = (id) => {
        askConfirm({
            title: 'Cancelar agendamento',
            message: 'Deseja cancelar/inativar este agendamento? Esta ação poderá ser revertida pelo administrador.',
            type: 'warning',
            confirmText: 'Cancelar agendamento',
            onConfirm: async () => {
                try {
                    await AgendamentosService.alterarStatus(id, 0);
                    toast.success('Agendamento cancelado com sucesso.');
                    loadData();
                } catch (err) {
                    toast.error(err.message || 'Erro ao cancelar.');
                }
            },
        });
    };

    // Helpers
    const getDescricao = (row) => row.descricao || row.Descricao || '–';
    const getData = (row) => {
        const d = row.dtAgendamento || row.DtAgendamento || row.dtagendamento;
        if (!d) return '–';
        return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };
    const getTelefone = (row) => row.telefone || row.Telefone || '–';
    const getValorTotal = (row) => {
        const val = row.valorTotal ?? row.ValorTotal ?? 0;
        if (!val || val === 0) return '–';
        return `R$ ${Number(val).toFixed(2).replace('.', ',')}`;
    };
    const getStatusInfo = (row) => {
        const st = row.status ?? row.Status;
        const map = {
            0: { label: 'Pendente',   bg: '#fef9c3', color: '#854d0e' },
            1: { label: 'Agendado',   bg: '#dbeafe', color: '#1d4ed8' },
            2: { label: 'Concluído',  bg: '#dcfce7', color: '#16a34a' },
            3: { label: 'Cancelado',  bg: '#fee2e2', color: '#dc2626' }
        };
        return map[st] ?? map[0];
    };

    const columns = [
        {
            label: 'Agendamento', key: 'Descricao', render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CalendarDays size={15} color="#f6b001" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>{getDescricao(row)}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{getTelefone(row)}</div>
                    </div>
                </div>
            )
        },
        { label: 'Data/Hora', key: 'DtAgendamento', render: (row) => <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>📅 {getData(row)}</span> },
        { label: 'Valor', key: 'Valor', render: (row) => <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#16a34a', whiteSpace: 'nowrap' }}>{getValorTotal(row)}</span> },
        {
            label: 'Status', key: 'Status', render: (row) => {
                const s = getStatusInfo(row);
                return <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>;
            }
        },
        {
            label: 'Ações', align: 'right', render: (row) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button title="Editar" onClick={() => openEdit(row)} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(246,176,1,0.1)', color: '#e09800', border: '1px solid rgba(246,176,1,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Edit2 size={14} />
                    </button>
                    {(row?.comprovantePix || row?.ComprovantePix) ? (
                        <button title="Ver Comprovante PIX" onClick={() => {
                            const img = row?.comprovantePix || row?.ComprovantePix;
                            askConfirm({
                                title: 'Comprovante PIX',
                                message: <img src={img} alt="Comprovante" style={{ width: '100%', borderRadius: '8px', maxHeight: '70vh', objectFit: 'contain' }} />,
                                type: 'success',
                                confirmText: 'Fechar',
                                cancelText: '',
                                onConfirm: () => {}
                            });
                        }} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CalendarDays size={14} />
                        </button>
                    ) : (
                        <div title="Pagamento Presencial" style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                           <XCircle size={14} />
                        </div>
                    )}
                    <button title="Cancelar" onClick={() => handleInativar(row?.id || row?.ID || row?.Id)} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <XCircle size={14} />
                    </button>
                </div>
            )
        }
    ];

    const renderCard = (row) => {
        const s = getStatusInfo(row);
        const hasPix = row?.comprovantePix || row?.ComprovantePix;
        return (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '14px', border: '1px solid #e5e7eb', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CalendarDays size={17} color="#f6b001" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getDescricao(row)}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{getTelefone(row)}</span>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>📅 {getData(row)}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a' }}>💰 {getValorTotal(row)}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        {hasPix ? (
                            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={14} /> Pix Anexado
                            </span>
                        ) : (
                            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <XCircle size={14} color="#9ca3af" /> Pagamento no local
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => openEdit(row)} style={{ flex: 1, minWidth: '80px', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(246,176,1,0.1)', color: '#e09800', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(246,176,1,0.2)', cursor: 'pointer', fontSize: '0.825rem' }}>
                        <Edit2 size={13} /> Editar
                    </button>
                    {hasPix ? (
                        <button onClick={() => {
                            askConfirm({
                                title: 'Comprovante PIX',
                                message: <img src={hasPix} alt="Comprovante" style={{ width: '100%', borderRadius: '8px' }} />,
                                type: 'success',
                                confirmText: 'Fechar',
                                cancelText: '',
                                onConfirm: () => {}
                            });
                        }} style={{ flex: 1, minWidth: '80px', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(34,197,94,0.08)', color: '#16a34a', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(34,197,94,0.15)', cursor: 'pointer', fontSize: '0.825rem' }}>
                            <CalendarDays size={13} /> Ver Pix
                        </button>
                    ) : (
                        <button disabled style={{ flex: 1, minWidth: '80px', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#f3f4f6', color: '#9ca3af', borderRadius: '10px', fontWeight: 700, border: '1px solid #e5e7eb', cursor: 'not-allowed', fontSize: '0.825rem', opacity: 0.6 }}>
                            <XCircle size={13} /> Sem Pix
                        </button>
                    )}
                    <button onClick={() => handleInativar(row?.id || row?.ID || row?.Id)} style={{ flex: 1, minWidth: '80px', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontSize: '0.825rem' }}>
                        <XCircle size={13} /> Cancelar
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <PageHeader
                icon={<CalendarDays />}
                title="Agendamentos"
                subtitle="Gerencie todos os agendamentos"
                newLabel="Novo Agendamento"
                onNew={openNew}
            />
            <PageSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={loadData}
                placeholder="Buscar por cliente ou profissional..."
            />
            <DataGrid
                columns={columns}
                data={data}
                loading={loading}
                error={error}
                onRetry={loadData}
                page={page}
                pageSize={pageSize}
                total={total}
                onPage={setPage}
                onPageSize={(s) => { setPageSize(s); setPage(1); }}
                renderCard={renderCard}
                emptyTitle="Nenhum agendamento encontrado"
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
                subtitle={isEditing ? 'Altere os dados do agendamento' : 'Preencha os dados do agendamento'}
                icon={<CalendarDays />}
                onSave={handleSave}
                saving={saving}
                loading={modalLoading}
                saveLabel={isEditing ? 'Salvar Alterações' : 'Criar Agendamento'}
            >
                <AgendamentoForm form={form} onChange={setForm} />
            </FormModal>
            {confirmModal}
        </div>
    );
}
