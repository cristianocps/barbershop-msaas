import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Edit2, Trash2, MapPin, Phone, ExternalLink } from 'lucide-react';
import { DataGrid } from '../components/UI/DataGrid';
import { PageHeader, PageSearch } from '../components/UI/PageHeader';
import { FormModal } from '../components/UI/FormModal';
import { EmpresaForm, EmpresaFormDefault } from '../components/forms/EmpresaForm';
import { EmpresasService } from '../services/Configuracoes/EmpresasService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../components/ui/ConfirmModal';

const ProfessionalWelcomeCard = ({ onAction }) => (
    <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        color: '#fff',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)'
    }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: 'rgba(246, 176, 1, 0.1)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
            <div style={{ background: '#f6b001', padding: '12px', borderRadius: '12px', color: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={28} />
            </div>
            <div style={{ flex: '1 1 300px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700 }}>Bem-vindo ao seu novo painel!</h3>
                <p style={{ margin: '0 0 16px 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    Você ainda está usando nossa unidade de demonstração. Para começar a gerenciar sua própria barbearia e receber agendamentos, você precisa cadastrar sua empresa real.
                </p>
                <button 
                    onClick={onAction}
                    style={{
                        background: '#f6b001',
                        color: '#1a1a2e',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(246, 176, 1, 0.3)',
                        fontSize: '0.9rem'
                    }}
                >
                    Cadastrar minha Barbearia <ExternalLink size={16} />
                </button>
            </div>
        </div>
    </div>
);

export function Empresas() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();
    const { user, refreshEmpresa, empresa } = useAuth();
    const canInativar = (user?.userMaxPolicy ?? 0) >= 4;
    const { confirmModal, askConfirm } = useConfirm();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EmpresaFormDefault());

    const isEditing = (form.id ?? 0) !== 0;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const start = (page - 1) * pageSize;
            const res = await EmpresasService.carregarGrid({ value: searchTerm }, start, pageSize);
            const list = res?.data || res?.Data || [];
            const display = canInativar ? list : list.filter(r => (r.status ?? r.Status) === 1);
            setData(display);
            setTotal(res?.recordsTotal || res?.RecordsTotal || 0);
        } catch (err) {
            setError(err.message || 'Erro ao carregar empresas');
            toast.error(err.message || 'Falha ao carregar empresas');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchTerm, canInativar]);

    useEffect(() => { loadData(); }, [loadData]);

    const openNew = () => {
        setForm(EmpresaFormDefault());
        setModalOpen(true);
    };

    const openEdit = async (row) => {
        const id = row.id || row.ID || row.Id;
        setForm(EmpresaFormDefault());
        setModalOpen(true);
        setModalLoading(true);
        try {
            const res = await EmpresasService.editar(id);
            const dados = res?.data || res?.Data || res;
            if (!dados) throw new Error('Dados não encontrados');
            setForm({
                id:        dados.id        ?? dados.ID        ?? dados.Id        ?? id,
                descricao: dados.descricao ?? dados.Descricao ?? '',
                cnpj:      dados.cnpj      ?? dados.Cnpj      ?? '',
                telefone:  dados.telefone  ?? dados.Telefone  ?? '',
                email:     dados.email     ?? dados.Email     ?? '',
                endereco:  dados.endereco  ?? dados.Endereco  ?? '',
                cidade:    dados.cidade    ?? dados.Cidade    ?? '',
                estado:    dados.estado    ?? dados.Estado    ?? '',
                slug:      dados.slug      ?? dados.Slug      ?? '',
                logoData:  dados.logoData  ?? dados.LogoData  ?? '',
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
            toast.error('Informe o nome da empresa.');
            return;
        }
        setSaving(true);
        try {
            await EmpresasService.alterar({
                id:        form.id || 0,
                descricao: form.descricao,
                cnpj:      form.cnpj     || '',
                telefone:  form.telefone || '',
                email:     form.email    || '',
                endereco:  form.endereco || '',
                cidade:    form.cidade   || '',
                estado:    form.estado   || '',
                slug:      form.slug     || '',
                logoData:  form.logoData || '',
                status:    form.status   ?? 1,
            });
            toast.success(isEditing ? 'Empresa atualizada com sucesso!' : 'Empresa cadastrada com sucesso!');
            setModalOpen(false);
            loadData();
            refreshEmpresa(); // Atualiza logo/nome na sidebar imediatamente
        } catch (err) {
            toast.error(err.message || 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const handleInativar = (id) => {
        askConfirm({
            title: 'Alterar status da empresa',
            message: 'Deseja inativar/ativar esta empresa? Empresas inativas não aceitam novos agendamentos.',
            type: 'warning',
            confirmText: 'Confirmar',
            onConfirm: async () => {
                try {
                    await EmpresasService.alterarStatus(id, 0);
                    toast.success('Status alterado com sucesso.');
                    loadData();
                } catch (err) {
                    toast.error(err.message || 'Erro ao alterar status.');
                }
            },
        });
    };

    const badge = (active) => (
        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: active ? '#dcfce7' : '#fee2e2', color: active ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
            {active ? 'Ativa' : 'Inativa'}
        </span>
    );

    const actionBtns = (row) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button title="Acessar Vitrine" onClick={() => window.open(`/${row.slug || row.Slug}`, '_blank')} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ExternalLink size={14} />
            </button>
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
            label: 'Empresa', key: 'Nome', render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={15} color="#f6b001" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.descricao || row.Descricao || '–'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.cnpj || row.Cnpj || ''}</div>
                    </div>
                </div>
            )
        },
        { label: 'Telefone', key: 'Telefone', render: (row) => <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.85rem' }}><Phone size={13} />{row.telefone || row.Telefone || '–'}</span> },
        { label: 'Endereço', key: 'Endereco', render: (row) => <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><MapPin size={13} />{row.endereco || row.Endereco || '–'}</span> },
        { label: 'Status', key: 'Status', render: (row) => badge((row.status ?? row.Status) === 1) },
        { label: 'Ações', align: 'right', render: actionBtns }
    ];

    const renderCard = (row) => {
        const active = (row.status ?? row.Status) === 1;
        return (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '14px', border: '1px solid #e5e7eb', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={17} color="#f6b001" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.descricao || row.Descricao}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{row.cnpj || row.Cnpj || ''}</span>
                    </div>
                    {badge(active)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#6b7280' }}><Phone size={13} />{row.telefone || row.Telefone || '–'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#6b7280' }}><MapPin size={13} />{row.endereco || row.Endereco || '–'}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button title="Acessar Vitrine" onClick={() => window.open(`/${row.slug || row.Slug}`, '_blank')} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', fontSize: '0.825rem' }}><ExternalLink size={13} /> Vitrine</button>
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
                icon={<Building2 />}
                title="Barbearias"
                subtitle="Gerencie as unidades da rede"
                newLabel="Nova Empresa"
                onNew={((user?.userMaxPolicy === 3 && empresa?.id === 1) || (user?.userMaxPolicy >= 4)) ? openNew : undefined}
            />
            {(user?.userMaxPolicy === 3 && empresa?.id === 1) && (
                <ProfessionalWelcomeCard onAction={openNew} />
            )}
            <PageSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={loadData}
                placeholder="Buscar por nome, CNPJ ou endereço..."
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
                emptyIcon={<Building2 size={24} color="var(--text-muted)" />}
                emptyTitle="Nenhuma empresa encontrada"
                emptyMessage="Cadastre uma nova barbearia para começar."
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditing ? 'Editar Empresa' : 'Nova Empresa'}
                subtitle={isEditing ? 'Altere os dados da empresa' : 'Preencha os dados da empresa'}
                icon={<Building2 />}
                onSave={handleSave}
                saving={saving}
                loading={modalLoading}
                saveLabel={isEditing ? 'Salvar Alterações' : 'Cadastrar Empresa'}
            >
                <EmpresaForm form={form} onChange={setForm} />
            </FormModal>
            {confirmModal}
        </div>
    );
}
