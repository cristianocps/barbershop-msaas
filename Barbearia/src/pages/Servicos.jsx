import React, { useState, useEffect, useCallback } from 'react';
import { Scissors, Edit2, Trash2, DollarSign, Plus } from 'lucide-react';
import { DataGrid } from '../components/UI/DataGrid';
import { PageHeader, PageSearch } from '../components/UI/PageHeader';
import { FormModal } from '../components/UI/FormModal';
import { ServicoForm, ServicoFormDefault } from '../components/forms/ServicoForm';
import { ServicosAppService } from '../services/Configuracoes/ServicosService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../components/ui/ConfirmModal';

export function Servicos() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();
    const { user } = useAuth();
    const canInativar = (user?.userMaxPolicy ?? 0) >= 4;
    const { confirmModal, askConfirm } = useConfirm();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(ServicoFormDefault());

    const isEditing = (form.id ?? 0) !== 0;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const start = (page - 1) * pageSize;
            const res = await ServicosAppService.carregarGrid({ value: searchTerm }, start, pageSize);
            setData(res?.data || res?.Data || []);
            setTotal(res?.recordsTotal || res?.RecordsTotal || 0);
        } catch (err) {
            setError(err.message || 'Erro ao carregar serviços');
            toast.error(err.message || 'Falha ao carregar serviços');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchTerm]);

    useEffect(() => { loadData(); }, [loadData]);

    const openNew = () => {
        setForm(ServicoFormDefault());
        setModalOpen(true);
    };

    const openEdit = async (row) => {
        const id = row.id || row.ID || row.Id;
        setForm(ServicoFormDefault());
        setModalOpen(true);
        setModalLoading(true);
        try {
            const res = await ServicosAppService.editar(id);
            const dados = res?.data || res?.Data || res;
            if (!dados) throw new Error('Dados não encontrados');
            setForm({
                id:            dados.id            ?? dados.ID            ?? dados.Id            ?? id,
                descricao:     dados.descricao     ?? dados.Descricao     ?? '',
                valorUnitario: dados.valorUnitario ?? dados.ValorUnitario ?? dados.valor_unitario ?? '',
                unidade:       dados.unidade       ?? dados.Unidade       ?? 'UN',
                duracao:       dados.duracao       ?? dados.Duracao       ?? '',
                observacao:    dados.observacao    ?? dados.Observacao    ?? '',
                idEmpresa:     dados.idEmpresa     ?? dados.IdEmpresa     ?? 0,
                status:        dados.status        ?? dados.Status        ?? 1,
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
            toast.error('Informe o nome do serviço.');
            return;
        }
        if (!form.valorUnitario && form.valorUnitario !== 0) {
            toast.error('Informe o valor do serviço.');
            return;
        }
        setSaving(true);
        try {
            await ServicosAppService.alterar({
                id:            form.id || 0,
                descricao:     form.descricao,
                valorUnitario: parseFloat(form.valorUnitario) || 0,
                unidade:       form.unidade || 'UN',
                duracao:       parseInt(form.duracao) || 0,
                observacao:    form.observacao || '',
                idEmpresa:     parseInt(form.idEmpresa) || 0,
                status:        form.status ?? 1,
            });
            toast.success(isEditing ? 'Serviço atualizado com sucesso!' : 'Serviço cadastrado com sucesso!');
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
            title: 'Alterar status do serviço',
            message: 'Deseja inativar/ativar este serviço? Serviços inativos não aparecem na vitrine.',
            type: 'warning',
            confirmText: 'Confirmar',
            onConfirm: async () => {
                try {
                    await ServicosAppService.alterarStatus(id, 0);
                    toast.success('Status alterado com sucesso.');
                    loadData();
                } catch (err) {
                    toast.error(err.message || 'Erro ao alterar status.');
                }
            },
        });
    };

    const formatPrice = (row) => {
        const v = row.valor_unitario ?? row.ValorUnitario ?? row.preco ?? row.Preco;
        return v != null ? `R$ ${parseFloat(v).toFixed(2).replace('.', ',')}` : '–';
    };
    const formatUnit = (row) => row.unidade || row.Unidade || '–';
    const getNome = (row) => row.descricao || row.Descricao || row.nome || row.Nome || '–';

    const badge = (active) => (
        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: active ? '#dcfce7' : '#fee2e2', color: active ? '#16a34a' : '#dc2626' }}>
            {active ? 'Ativo' : 'Inativo'}
        </span>
    );

    const actionBtns = (row) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button title="Editar" onClick={() => openEdit(row)} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(246,176,1,0.1)', color: '#e09800', border: '1px solid rgba(246,176,1,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit2 size={14} />
            </button>
            {canInativar && (
                <button title="Inativar" onClick={() => handleInativar(row.id || row.ID)} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );

    const columns = [
        {
            label: 'Serviço', key: 'Descricao', render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#f6b001,#e09800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Scissors size={15} color="#1a1a1a" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getNome(row)}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatUnit(row)}</div>
                    </div>
                </div>
            )
        },
        { label: 'Preço', key: 'ValorUnitario', render: (row) => <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, fontSize: '0.9rem', color: '#16a34a', whiteSpace: 'nowrap' }}><DollarSign size={13} />{formatPrice(row)}</span> },
        { label: 'Status', key: 'Status', render: (row) => badge((row.status ?? row.Status) === 1) },
        { label: 'Ações', align: 'right', render: actionBtns }
    ];

    const renderCard = (row) => {
        const active = (row.status ?? row.Status) === 1;
        return (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '14px', border: '1px solid #e5e7eb', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#f6b001,#e09800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Scissors size={17} color="#1a1a1a" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getNome(row)}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{formatUnit(row)}</span>
                    </div>
                    {badge(active)}
                </div>
                <div style={{ display: 'flex', gap: '1rem', padding: '8px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', fontWeight: 800, color: '#16a34a' }}><DollarSign size={13} />{formatPrice(row)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(row)} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(246,176,1,0.1)', color: '#e09800', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(246,176,1,0.2)', cursor: 'pointer', fontSize: '0.825rem' }}><Edit2 size={13} /> Editar</button>
                    {canInativar && (
                        <button onClick={() => handleInativar(row.id || row.ID)} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontSize: '0.825rem' }}><Trash2 size={13} /> Inativar</button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <PageHeader
                icon={<Scissors />}
                title="Serviços"
                subtitle="Catálogo de serviços da barbearia"
                newLabel="Novo Serviço"
                onNew={openNew}
            />
            <PageSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={loadData}
                placeholder="Buscar por nome ou descrição..."
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
                emptyIcon={<Scissors size={24} color="var(--text-muted)" />}
                emptyTitle="Nenhum serviço encontrado"
                emptyMessage="Cadastre um novo serviço para o seu catálogo."
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditing ? 'Editar Serviço' : 'Novo Serviço'}
                subtitle={isEditing ? 'Altere os dados do serviço' : 'Preencha os dados do serviço'}
                icon={<Scissors />}
                onSave={handleSave}
                saving={saving}
                loading={modalLoading}
                saveLabel={isEditing ? 'Salvar Alterações' : 'Cadastrar Serviço'}
            >
                <ServicoForm form={form} onChange={setForm} />
            </FormModal>
            {confirmModal}
        </div>
    );
}
