import React, { useState, useEffect, useCallback } from 'react';
import { CalendarClock, Edit2, Trash2, Clock, CalendarDays, User } from 'lucide-react';
import { DataGrid } from '../components/UI/DataGrid';
import { PageHeader, PageSearch } from '../components/UI/PageHeader';
import { FormModal } from '../components/UI/FormModal';
import { HorarioForm, HorarioFormDefault } from '../components/forms/HorarioForm';
import { HorariosService } from '../services/Configuracoes/HorariosService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../components/UI/ConfirmModal';

export function Horarios() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // List states
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();
    const { user } = useAuth();
    const { confirmModal, askConfirm } = useConfirm();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(HorarioFormDefault());

    const isEditing = (form.id ?? 0) !== 0;

    const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const start = (page - 1) * pageSize;
            const res = await HorariosService.carregarGrid({ value: searchTerm }, start, pageSize);
            setData(res?.data || res?.Data || []);
            setTotal(res?.recordsTotal || res?.RecordsTotal || 0);
        } catch (err) {
            setError(err.message || 'Erro ao carregar horários');
            toast.error(err.message || 'Falha ao carregar horários');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchTerm]);

    useEffect(() => { loadData(); }, [loadData]);

    const openNew = () => {
        setForm(HorarioFormDefault());
        setModalOpen(true);
    };

    const openEdit = async (row) => {
        const id = row.id || row.ID || row.Id;
        setForm(HorarioFormDefault());
        setModalOpen(true);
        setModalLoading(true);
        try {
            const res = await HorariosService.editar(id);
            const dados = res?.data || res?.Data || res;
            if (!dados) throw new Error('Dados não encontrados');
            setForm({
                id:             dados.id             ?? dados.ID ?? id,
                idEmpresa:      dados.idEmpresa      ?? dados.IdEmpresa ?? 0,
                idProfissional: dados.idProfissional ?? dados.IdProfissional ?? 0,
                diaSemana:      dados.diaSemana      ?? dados.DiaSemana ?? 0,
                horaInicio:     dados.horaInicio     ?? dados.HoraInicio ?? "08:00:00",
                horaFim:        dados.horaFim        ?? dados.HoraFim ?? "18:00:00",
                duracaoMinutos: dados.duracaoMinutos ?? dados.DuracaoMinutos ?? 30,
                status:         dados.status         ?? dados.Status ?? 1,
            });
        } catch (err) {
            toast.error('Erro ao carregar dados: ' + err.message);
            setModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.idProfissional || form.idProfissional <= 0) {
            toast.error('Selecione um Profissional.');
            return;
        }
        if (!form.horaInicio || !form.horaFim) {
            toast.error('Informe a Hora de Início e Hora de Fim.');
            return;
        }

        setSaving(true);
        try {
            await HorariosService.alterar({
                id:             form.id || 0,
                idEmpresa:      form.idEmpresa || 0,
                idProfissional: form.idProfissional,
                diaSemana:      form.diaSemana,
                horaInicio:     form.horaInicio,
                horaFim:        form.horaFim,
                duracaoMinutos: form.duracaoMinutos,
                status:         form.status ?? 1,
            });
            toast.success(isEditing ? 'Horário atualizado!' : 'Horário registrado!');
            setModalOpen(false);
            loadData();
        } catch (err) {
            toast.error(err.message || 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeletar = (id) => {
        askConfirm({
            title: 'Excluir horário',
            message: 'Esta ação não pode ser desfeita. O horário será removido permanentemente.',
            type: 'danger',
            confirmText: 'Excluir',
            onConfirm: async () => {
                try {
                    await HorariosService.deletar(id);
                    toast.success('Horário excluído com sucesso.');
                    loadData();
                } catch (err) {
                    toast.error(err.message || 'Erro ao excluir horário.');
                }
            },
        });
    };

    const handleInativar = (id) => {
        askConfirm({
            title: 'Inativar / Ativar horário',
            message: 'Deseja alternar o status deste horário de trabalho?',
            type: 'warning',
            confirmText: 'Confirmar',
        });
    };

    const formatTime = (ts) => ts ? ts.substring(0, 5) : "--:--";

    const badge = (active) => (
        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: active ? '#dcfce7' : '#fee2e2', color: active ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
            {active ? 'Ativo' : 'Inativo'}
        </span>
    );

    const actionBtns = (row) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button title="Editar" onClick={() => openEdit(row)} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(246,176,1,0.1)', color: '#e09800', border: '1px solid rgba(246,176,1,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit2 size={14} />
            </button>
            <button title="Excluir" onClick={() => handleDeletar(row.id || row.ID)} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={14} />
            </button>
        </div>
    );

    const columns = [
        {
            label: 'Grade / Turno', key: 'Nome', render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CalendarClock size={15} color="#f6b001" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>{row.nomeProfissional || row.NomeProfissional}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarDays size={12} /> {DIAS_SEMANA[row.diaSemana ?? row.DiaSemana]}
                        </div>
                    </div>
                </div>
            )
        },
        { 
            label: 'Das', 
            key: 'HoraInicio', 
            render: (row) => <span style={{ fontWeight: 600, color: '#111827' }}>{formatTime(row.horaInicio || row.HoraInicio)}</span> 
        },
        { 
            label: 'Às', 
            key: 'HoraFim', 
            render: (row) => <span style={{ fontWeight: 600, color: '#111827' }}>{formatTime(row.horaFim || row.HoraFim)}</span> 
        },
        { 
            label: 'Intervalo', 
            key: 'DuracaoMinutos', 
            render: (row) => <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{(row.duracaoMinutos || row.DuracaoMinutos)} min</span> 
        },
        { label: 'Status', key: 'Status', render: (row) => badge((row.status ?? row.Status) === 1) },
        { label: 'Ações', align: 'right', render: actionBtns }
    ];

    const renderCard = (row) => {
        const active = (row.status ?? row.Status) === 1;
        const dia = DIAS_SEMANA[row.diaSemana ?? row.DiaSemana];
        const hInicio = formatTime(row.horaInicio || row.HoraInicio);
        const hFim = formatTime(row.horaFim || row.HoraFim);

        return (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '14px', border: '1px solid #e5e7eb', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={17} color="#f6b001" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.nomeProfissional || row.NomeProfissional}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}><CalendarDays size={12}/> {dia}</span>
                    </div>
                    {badge(active)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: '10px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <Clock size={16} color="#9ca3af" />
                         <span style={{ fontWeight: 600, color: '#374151' }}>{hInicio} — {hFim}</span>
                     </div>
                     <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '3px 8px', borderRadius: '12px' }}>
                         a cada {row.duracaoMinutos || row.DuracaoMinutos}m
                     </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(row)} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(246,176,1,0.1)', color: '#e09800', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(246,176,1,0.2)', cursor: 'pointer', fontSize: '0.825rem' }}><Edit2 size={13} /> Editar</button>
                    <button onClick={() => handleDeletar(row.id || row.ID)} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontSize: '0.825rem' }}><Trash2 size={13} /> Excluir</button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <PageHeader
                icon={<CalendarClock />}
                title="Grade de Horários"
                subtitle="Configure os horários de expediente e de folga dos profissionais"
                newLabel="Nova Grade"
                // Profissionais (nivel 3) e acima (Gerentes/Admins) podem criar as proprias grades
                onNew={(user?.userMaxPolicy >= 3) ? openNew : undefined}
            />
            
            <PageSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={loadData}
                placeholder="Buscar por profissional..."
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
                emptyIcon={<CalendarClock size={24} color="var(--text-muted)" />}
                emptyTitle="Nenhuma grade configurada"
                emptyMessage="Clique em Nova Grade para iniciar o expediente da barbearia."
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditing ? 'Editar Grade de Horários' : 'Nova Grade'}
                subtitle="Defina o turno de trabalho do profissional para gerar a agenda."
                icon={<CalendarClock />}
                onSave={handleSave}
                saving={saving}
                loading={modalLoading}
                saveLabel={isEditing ? 'Salvar Alterações' : 'Criar Turno'}
            >
                <HorarioForm form={form} onChange={setForm} />
            </FormModal>
            {confirmModal}
        </div>
    );
}
