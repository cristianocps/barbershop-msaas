import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Edit2, Trash2, MapPin, Phone, ExternalLink } from 'lucide-react';
import { DataGrid } from '../components/UI/DataGrid';
import { PageHeader, PageSearch } from '../components/UI/PageHeader';
import { FormModal } from '../components/UI/FormModal';
import { EmpresaForm, EmpresaFormDefault } from '../components/forms/EmpresaForm';
import { EmpresasService } from '../services/Configuracoes/EmpresasService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../components/UI/ConfirmModal';
import { useOnboardingTour } from '../hooks/useOnboardingTour';
import { TOURS } from '../config/onboardingTours';
import { canManageAllEmpresas } from '../utils/userPolicy';
import { Navigate } from 'react-router-dom';
import { assertApiSuccess } from '../services/apiHelpers';
import { validateEmpresaForm, buildEmpresaApiPayload } from '../utils/validateEmpresaForm';
import { getVitrineUrl } from '../utils/publicSiteUrl';

export function Empresas() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();
    const { user, refreshEmpresa } = useAuth();
    const canInativar = (user?.userMaxPolicy ?? 0) >= 4;
    const { confirmModal, askConfirm } = useConfirm();
    const { iniciarTour } = useOnboardingTour();
    const isAdminEmpresas = canManageAllEmpresas(user);

    useEffect(() => {
        if (!isAdminEmpresas) return;
        const steps = TOURS.empresa({ showWelcome: false, showNovo: true });
        if (steps.length) iniciarTour('empresa-admin', steps);
    }, [iniciarTour, isAdminEmpresas]);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EmpresaFormDefault());
    const [fieldErrors, setFieldErrors] = useState({});

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
                infinitepayHandle: dados.infinitepayHandle ?? dados.InfinitepayHandle ?? '',
            });
        } catch (err) {
            toast.error('Erro ao carregar dados: ' + err.message);
            setModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleSave = async () => {
        const { valid, errors } = validateEmpresaForm(form, { requireSlug: false });
        setFieldErrors(errors);
        if (!valid) {
            toast.error('Corrija os campos destacados antes de salvar.');
            return;
        }
        setSaving(true);
        try {
            const res = await EmpresasService.alterar(buildEmpresaApiPayload(form));
            assertApiSuccess(res, 'Erro ao salvar.');
            toast.success(isEditing ? 'Empresa atualizada com sucesso!' : 'Empresa cadastrada com sucesso!');
            setModalOpen(false);
            setFieldErrors({});
            loadData();
            refreshEmpresa();
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
            <button title="Acessar Vitrine" onClick={() => { const u = getVitrineUrl(row.slug || row.Slug); if (u) window.open(u, '_blank'); }} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    <button title="Acessar Vitrine" onClick={() => { const u = getVitrineUrl(row.slug || row.Slug); if (u) window.open(u, '_blank'); }} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', fontSize: '0.825rem' }}><ExternalLink size={13} /> Vitrine</button>
                    <button onClick={() => openEdit(row)} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(246,176,1,0.1)', color: '#e09800', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(246,176,1,0.2)', cursor: 'pointer', fontSize: '0.825rem' }}><Edit2 size={13} /> Editar</button>
                    {canInativar && (
                        <button onClick={() => handleInativar(row.id || row.ID)} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontSize: '0.825rem' }}><Trash2 size={13} /> Inativar</button>
                    )}
                </div>
            </div>
        );
    };

    if (!isAdminEmpresas) {
        return <Navigate to="/minha-barbearia" replace />;
    }

    return (
        <div>
            <PageHeader
                icon={<Building2 />}
                title="Barbearias"
                subtitle="Administração da plataforma — todas as unidades"
                newLabel="Nova Empresa"
                headerTourId="empresas-page-intro"
                newButtonTourId="empresas-novo"
                onNew={openNew}
            />
            <PageSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={loadData}
                placeholder="Buscar por nome, CNPJ ou endereço..."
            />
            <div data-tour="empresas-grid">
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
            </div>

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
                <EmpresaForm form={form} onChange={setForm} fieldErrors={fieldErrors} />
            </FormModal>
            {confirmModal}
        </div>
    );
}
