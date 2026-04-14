import React, { useState, useEffect, useCallback } from 'react';
import { Star, Edit2, Trash2, Phone } from 'lucide-react';
import { DataGrid } from '../components/UI/DataGrid';
import { PageHeader, PageSearch } from '../components/UI/PageHeader';
import { FormModal } from '../components/UI/FormModal';
import { ProfissionalForm, ProfissionalFormDefault } from '../components/forms/ProfissionalForm';
import { ProfissionaisService } from '../services/Configuracoes/ProfissionaisService';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../components/ui/ConfirmModal';

export function Profissionais() {
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
    const [form, setForm] = useState(ProfissionalFormDefault());

    const isEditing = (form.id ?? 0) !== 0;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const start = (page - 1) * pageSize;
            const res = await ProfissionaisService.carregarGrid({ value: searchTerm }, start, pageSize);
            const list = res?.data || res?.Data || [];
            setData(list);
            setTotal(res?.recordsTotal || res?.RecordsTotal || 0);
        } catch (err) {
            setError(err.message || 'Erro ao carregar profissionais');
            toast.error(err.message || 'Falha ao carregar profissionais');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchTerm]);

    useEffect(() => { loadData(); }, [loadData]);

    const openNew = () => {
        setForm(ProfissionalFormDefault());
        setModalOpen(true);
    };

    const openEdit = async (row) => {
        const id = row.id || row.ID || row.Id;
        setForm(ProfissionalFormDefault());
        setModalOpen(true);
        setModalLoading(true);
        try {
            const res = await ProfissionaisService.editar(id);
            const dados = res?.data || res?.Data || res;
            if (!dados) throw new Error('Dados não encontrados');
            setForm({
                id:        dados.id        ?? dados.ID        ?? id,
                descricao: dados.descricao ?? dados.Descricao ?? '',
                telefone:  dados.telefone  ?? dados.Telefone  ?? '',
                corAgenda: dados.corAgenda ?? dados.CorAgenda ?? dados.cor_agenda ?? '#000000',
                idEmpresa: dados.idEmpresa ?? dados.IdEmpresa ?? 0,
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
            toast.error('Informe o nome do profissional.');
            return;
        }
        setSaving(true);
        try {
            await ProfissionaisService.alterar({
                id:        form.id || 0,
                descricao: form.descricao || '',
                telefone:  form.telefone || '',
                corAgenda: form.corAgenda || '#000000',
                idEmpresa: parseInt(form.idEmpresa) || 0,
                status:    form.status ?? 1,
            });
            toast.success(isEditing ? 'Profissional atualizado com sucesso!' : 'Profissional cadastrado com sucesso!');
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
            title: 'Inativar profissional',
            message: 'Deseja inativar este profissional? Ele não aparecerá mais na vitrine de agendamentos.',
            type: 'warning',
            confirmText: 'Inativar',
            onConfirm: async () => {
                try {
                    await ProfissionaisService.alterarStatus(id, 0);
                    toast.success('Profissional inativado com sucesso.');
                    loadData();
                } catch (err) {
                    toast.error(err.message || 'Erro ao inativar profissional.');
                }
            },
        });
    };

    const badge = (active) => (
        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: active ? '#dcfce7' : '#fee2e2', color: active ? '#16a34a' : '#dc2626' }}>
            {active ? 'Ativo' : 'Inativo'}
        </span>
    );

    const getNome = (row) => row.descricao || row.Descricao || row.nome || '–';

    const columns = [
        {
            label: 'Profissional', key: 'Descricao', render: (row) => {
                const cor = row.corAgenda || row.CorAgenda || row.cor_agenda || '#1a1a2e';
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Star size={15} color="#fff" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getNome(row)}</div>
                        </div>
                    </div>
                );
            }
        },
        { label: 'Telefone', key: 'Telefone', render: (row) => <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}><Phone size={12} /> {row.telefone || row.Telefone || '–'}</span> },
        { label: 'Status', key: 'Status', render: (row) => badge((row.status ?? row.Status) === 1) },
        {
            label: 'Ações', align: 'right', render: (row) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button title="Editar" onClick={() => openEdit(row)} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(246,176,1,0.1)', color: '#e09800', border: '1px solid rgba(246,176,1,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Edit2 size={14} />
                    </button>
                    <button title="Inativar" onClick={() => handleInativar(row.id || row.ID)} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={14} />
                    </button>
                </div>
            )
        }
    ];

    const renderCard = (row) => {
        const active = (row.status ?? row.Status) === 1;
        const cor = row.corAgenda || row.CorAgenda || row.cor_agenda || '#1a1a2e';
        return (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '14px', border: '1px solid #e5e7eb', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Star size={17} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getNome(row)}</strong>
                    </div>
                    {badge(active)}
                </div>
                <div style={{ padding: '8px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: '10px', fontSize: '0.82rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} /> {row.telefone || row.Telefone || 'Sem telefone'}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(row)} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(246,176,1,0.1)', color: '#e09800', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(246,176,1,0.2)', cursor: 'pointer', fontSize: '0.825rem' }}><Edit2 size={13} /> Editar</button>
                    <button onClick={() => handleInativar(row.id || row.ID)} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontSize: '0.825rem' }}><Trash2 size={13} /> Inativar</button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <PageHeader
                icon={<Star />}
                title="Profissionais"
                subtitle="Gerencie os barbeiros da barbearia"
                newLabel="Novo Profissional"
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
                emptyIcon={<Star size={24} color="var(--text-muted)" />}
                emptyTitle="Nenhum profissional"
                emptyMessage="Cadastre os barbeiros da sua empresa."
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditing ? 'Editar Profissional' : 'Novo Profissional'}
                subtitle={isEditing ? 'Altere os dados do profissional' : 'Cadastre um novo barbeiro e sua cor de agenda'}
                icon={<Star />}
                onSave={handleSave}
                saving={saving}
                loading={modalLoading}
                saveLabel={isEditing ? 'Salvar Alterações' : 'Cadastrar Profissional'}
            >
                <ProfissionalForm form={form} onChange={setForm} />
            </FormModal>
            {confirmModal}
        </div>
    );
}
