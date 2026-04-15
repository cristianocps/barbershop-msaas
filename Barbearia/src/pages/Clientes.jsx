import React, { useState, useEffect, useCallback } from 'react';
import { Users, Edit2, Trash2, Phone, MapPin } from 'lucide-react';
import { DataGrid } from '../components/UI/DataGrid';
import { PageHeader, PageSearch } from '../components/UI/PageHeader';
import { FormModal } from '../components/UI/FormModal';
import { ClienteForm, ClienteFormDefault } from '../components/forms/ClienteForm';
import { ClientesService } from '../services/Configuracoes/ClientesService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../components/ui/ConfirmModal';

export function Clientes() {
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
    const [form, setForm] = useState(ClienteFormDefault());

    const isEditing = (form.id ?? 0) !== 0;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const start = (page - 1) * pageSize;
            const res = await ClientesService.carregarGrid({ value: searchTerm }, start, pageSize);
            setData(res?.data || res?.Data || []);
            setTotal(res?.recordsTotal || res?.RecordsTotal || 0);
        } catch (err) {
            setError(err.message || 'Erro ao carregar clientes');
            toast.error(err.message || 'Falha ao carregar clientes');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchTerm]);

    useEffect(() => { loadData(); }, [loadData]);

    const openNew = () => {
        setForm(ClienteFormDefault());
        setModalOpen(true);
    };

    const openEdit = async (row) => {
        const id = row.id || row.ID || row.Id;
        setForm(ClienteFormDefault());
        setModalOpen(true);
        setModalLoading(true);
        try {
            const res = await ClientesService.editar(id);
            const dados = res?.data || res?.Data || res;
            if (!dados) throw new Error('Dados não encontrados');
            setForm({
                id:        dados.id        ?? dados.ID        ?? dados.Id        ?? id,
                descricao: dados.descricao ?? dados.Descricao ?? dados.nome ?? dados.Nome ?? '',
                telefone:  dados.telefone  ?? dados.Telefone  ?? '',
                endereco:  dados.endereco  ?? dados.Endereco  ?? '',
                status:    dados.status    ?? dados.Status    ?? 1,
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
        setSaving(true);
        try {
            await ClientesService.alterar({
                id:        form.id || 0,
                descricao: form.descricao || '',
                telefone:  form.telefone || '',
                endereco:  form.endereco || '',
                status:    form.status ?? 1,
            });
            toast.success(isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
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
            title: 'Inativar cliente',
            message: 'Deseja inativar este cliente? Ele não poderá realizar novos agendamentos.',
            type: 'warning',
            confirmText: 'Inativar',
            onConfirm: async () => {
                try {
                    await ClientesService.alterarStatus(id, 0);
                    toast.success('Status do cliente alterado com sucesso.');
                    loadData();
                } catch (err) {
                    toast.error(err.message || 'Erro ao inativar.');
                }
            },
        });
    };

    const badge = (active) => (
        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: active ? '#dcfce7' : '#fee2e2', color: active ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
            {active ? 'Ativo' : 'Inativo'}
        </span>
    );

    const columns = [
        {
            label: 'Nome', key: 'Nome', render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Users size={15} color="#f6b001" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row.descricao || row.Descricao || '–'}
                        </div>
                    </div>
                </div>
            )
        },
        { label: 'Telefone', key: 'Telefone', render: (row) => <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.85rem' }}><Phone size={13} />{row.telefone || row.Telefone || '–'}</span> },
        { label: 'Endereço', key: 'Endereco', render: (row) => <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.85rem' }}><MapPin size={13} />{row.endereco || row.Endereco || '–'}</span> },
        { label: 'Status', key: 'Status', render: (row) => badge((row.status ?? row.Status) === 1) },
        {
            label: 'Ações', align: 'right', render: (row) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button title="Editar" onClick={() => openEdit(row)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(246,176,1,0.1)', color: '#e09800', border: '1px solid rgba(246,176,1,0.2)', cursor: 'pointer' }}>
                        <Edit2 size={14} />
                    </button>
                    {canInativar && (
                        <button title="Inativar" onClick={() => handleInativar(row.id || row.ID)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const renderCard = (row) => {
        const active = (row.status ?? row.Status) === 1;
        return (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '14px', border: '1px solid #e5e7eb', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Users size={17} color="#f6b001" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.descricao || row.Descricao}</strong>
                    </div>
                    {badge(active)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#6b7280' }}><Phone size={13} />{row.telefone || row.Telefone || '–'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#6b7280' }}><MapPin size={13} />{row.endereco || row.Endereco || '–'}</span>
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
                icon={<Users />}
                title="Clientes"
                subtitle="Gerenciamento da carteira de clientes"
                newLabel="Novo Cliente"
                onNew={openNew}
            />
            <PageSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={loadData}
                placeholder="Buscar por nome ou telefone..."
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
                emptyIcon={<Users size={24} color="var(--text-muted)" />}
                emptyTitle="Nenhum cliente encontrado"
                emptyMessage="Cadastre um novo cliente para começar."
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
                subtitle={isEditing ? 'Altere os dados do cliente' : 'Preencha os dados do cliente'}
                icon={<Users />}
                onSave={handleSave}
                saving={saving}
                loading={modalLoading}
                saveLabel={isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            >
                <ClienteForm form={form} onChange={setForm} />
            </FormModal>
            {confirmModal}
        </div>
    );
}
