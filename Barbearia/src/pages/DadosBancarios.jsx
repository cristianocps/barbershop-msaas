import React, { useState, useEffect, useCallback } from 'react';
import { Landmark, Key, List, Edit2, Trash2 } from 'lucide-react';
import { DataGrid } from '../components/UI/DataGrid';
import { PageHeader, PageSearch } from '../components/UI/PageHeader';
import { FormModal } from '../components/UI/FormModal';
import { ChavePixForm, ChavePixFormDefault } from '../components/forms/ChavePixForm';
import { TipoChaveForm, TipoChaveFormDefault } from '../components/forms/TipoChaveForm';
import { DadosBancariosService } from '../services/Configuracoes/DadosBancariosService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from '../components/UI/ConfirmModal';
import { usePasswordPrompt } from '../components/UI/PasswordPromptModal';
import { Eye, EyeOff } from 'lucide-react';

export function DadosBancarios() {
    const [activeTab, setActiveTab] = useState('chaves'); // 'chaves' | 'tipos'
    
    // Shared state
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
    const { passwordModal, askPassword } = usePasswordPrompt();

    const [decryptedKeys, setDecryptedKeys] = useState({}); // id -> string
    
    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [formChave, setFormChave] = useState(ChavePixFormDefault());
    const [formTipo, setFormTipo] = useState(TipoChaveFormDefault());

    const isEditing = activeTab === 'chaves' ? (formChave.id ?? 0) !== 0 : (formTipo.id ?? 0) !== 0;

    // Reset pagination when tab changes
    useEffect(() => {
        setPage(1);
        setSearchTerm('');
    }, [activeTab]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const start = (page - 1) * pageSize;
            
            let res;
            if (activeTab === 'chaves') {
                res = await DadosBancariosService.carregarGridDadosBancarios({ value: searchTerm }, start, pageSize);
            } else {
                res = await DadosBancariosService.carregarGridTipoChave({ value: searchTerm }, start, pageSize);
            }

            const list = res?.data || res?.Data || [];
            const display = canInativar ? list : list.filter(r => (r.status ?? r.Status) === 1);
            setData(display);
            setTotal(res?.recordsTotal || res?.RecordsTotal || 0);
        } catch (err) {
            setError(err.message || `Erro ao carregar ${activeTab}`);
            toast.error(err.message || 'Falha ao carregar os dados');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, searchTerm, canInativar, activeTab]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleDecrypt = (row) => {
        const id = row.id || row.ID || row.Id;
        
        // Se já está descriptografado, apenas esconde
        if (decryptedKeys[id]) {
            setDecryptedKeys(prev => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
            return;
        }

        askPassword({
            title: 'Descriptografar Chave PIX',
            message: 'Informe a senha de confirmação (PIN) para visualizar a chave em texto limpo.',
            onConfirm: async (senha) => {
                try {
                    const res = await DadosBancariosService.descriptografarChave(id, senha);
                    const chaveLimpa = res?.data || res?.Data || res;
                    setDecryptedKeys(prev => ({ ...prev, [id]: chaveLimpa }));
                    toast.success('Chave descriptografada com sucesso.');
                } catch (err) {
                    toast.error(err.message || 'Senha incorreta ou erro ao descriptografar.');
                }
            }
        });
    };

    const openNew = () => {
        if (activeTab === 'chaves') setFormChave(ChavePixFormDefault());
        else setFormTipo(TipoChaveFormDefault());
        setModalOpen(true);
    };

    const openEdit = async (row) => {
        const id = row.id || row.ID || row.Id;
        setModalOpen(true);
        setModalLoading(true);
        try {
            if (activeTab === 'chaves') {
                setFormChave(ChavePixFormDefault());
                const res = await DadosBancariosService.editarDadosBancarios(id);
                const dados = res?.data || res?.Data || res;
                setFormChave({
                    id: dados.id ?? dados.ID ?? id,
                    descricao: '', // we dont show original key text to the user for security, they must re-enter it or they are editing only status
                    idTipoChavePix: dados.idTipoChavePix ?? dados.IdTipoChavePix ?? '',
                    senhaConfirmacao: '',
                    status: dados.status ?? dados.Status ?? 1,
                });
            } else {
                setFormTipo(TipoChaveFormDefault());
                const res = await DadosBancariosService.editarTipoChave(id);
                const dados = res?.data || res?.Data || res;
                setFormTipo({
                    id: dados.id ?? dados.ID ?? id,
                    descricao: dados.descricao ?? dados.Descricao ?? '',
                    status: dados.status ?? dados.Status ?? 1,
                });
            }
        } catch (err) {
            toast.error('Erro ao carregar dados: ' + err.message);
            setModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (activeTab === 'chaves') {
                if (!formChave.idTipoChavePix) throw new Error("Selecione o tipo da chave.");
                if (!formChave.descricao) throw new Error("Informe a chave PIX.");
                if (!formChave.senhaConfirmacao) throw new Error("A senha de confirmação é obrigatória.");
                
                await DadosBancariosService.alterarDadosBancarios({
                    id: formChave.id || 0,
                    descricao: formChave.descricao,
                    idTipoChavePix: formChave.idTipoChavePix,
                    senhaConfirmacao: formChave.senhaConfirmacao,
                    status: formChave.status ?? 1
                });
            } else {
                if (!formTipo.descricao) throw new Error("Informe a descrição do tipo.");
                
                await DadosBancariosService.alterarTipoChave({
                    id: formTipo.id || 0,
                    descricao: formTipo.descricao,
                    status: formTipo.status ?? 1
                });
            }
            toast.success(isEditing ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!');
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
            title: 'Alterar status',
            message: 'Deseja inativar/ativar este registro?',
            type: 'warning',
            confirmText: 'Confirmar',
            onConfirm: async () => {
                try {
                    if (activeTab === 'chaves') {
                        await DadosBancariosService.alterarStatusDadosBancarios(id, 0);
                    } else {
                        await DadosBancariosService.alterarStatusTipoChave(id, 0);
                    }
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
            {active ? 'Ativo' : 'Inativo'}
        </span>
    );

    const actionBtns = (row) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {activeTab === 'chaves' && (
                <button title={decryptedKeys[row.id || row.ID] ? "Ocultar Chave" : "Descriptografar"} onClick={() => handleDecrypt(row)} style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {decryptedKeys[row.id || row.ID] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            )}
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

    const columnsChaves = [
        {
            label: 'Chave PIX', key: 'Descricao', render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#f6b001,#e09800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Key size={15} color="#1a1a1a" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {decryptedKeys[row.id || row.ID] || row.descricao || row.Descricao || '[Dado Criptografado]'}
                        </div>
                    </div>
                </div>
            )
        },
        { label: 'Status', key: 'Status', render: (row) => badge((row.status ?? row.Status) === 1) },
        { label: 'Ações', align: 'right', render: actionBtns }
    ];

    const columnsTipos = [
        {
            label: 'Tipo', key: 'Descricao', render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#f6b001,#e09800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <List size={15} color="#1a1a1a" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {row.descricao || row.Descricao || '–'}
                        </div>
                    </div>
                </div>
            )
        },
        { label: 'Status', key: 'Status', render: (row) => badge((row.status ?? row.Status) === 1) },
        { label: 'Ações', align: 'right', render: actionBtns }
    ];

    const renderCard = (row) => {
        const active = (row.status ?? row.Status) === 1;
        const Icon = activeTab === 'chaves' ? Key : List;
        const id = row.id || row.ID;
        const title = decryptedKeys[id] || row.descricao || row.Descricao || (activeTab === 'chaves' ? '[Dado Criptografado]' : '–');
        return (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '14px', border: '1px solid #e5e7eb', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#f6b001,#e09800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={17} color="#1a1a1a" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</strong>
                    </div>
                    {badge(active)}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {activeTab === 'chaves' && (
                        <button onClick={() => handleDecrypt(row)} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', fontSize: '0.825rem' }}>
                            {decryptedKeys[id] ? <><EyeOff size={13} /> Ocultar</> : <><Eye size={13} /> Revelar</>}
                        </button>
                    )}
                    <button onClick={() => openEdit(row)} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(246,176,1,0.1)', color: '#e09800', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(246,176,1,0.2)', cursor: 'pointer', fontSize: '0.825rem' }}><Edit2 size={13} /> Editar</button>
                    {canInativar && (
                        <button onClick={() => handleInativar(row.id || row.ID)} style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderRadius: '10px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontSize: '0.825rem' }}><Trash2 size={13} /> Inativar</button>
                    )}
                </div>
            </div>
        );
    };

    const tabStyle = (active) => ({
        padding: '10px 20px',
        cursor: 'pointer',
        borderBottom: active ? '2px solid #e09800' : '2px solid transparent',
        color: active ? '#e09800' : '#6b7280',
        fontWeight: active ? 'bold' : 'normal',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
    });

    return (
        <div>
            <PageHeader
                icon={<Landmark />}
                title="Dados Bancários"
                subtitle="Gerenciamento de chaves PIX"
                newLabel={activeTab === 'chaves' ? "Nova Chave PIX" : "Novo Tipo"}
                onNew={openNew}
            />
            
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
                <div style={tabStyle(activeTab === 'chaves')} onClick={() => setActiveTab('chaves')}>
                    <Key size={18} /> Chaves PIX
                </div>
                <div style={tabStyle(activeTab === 'tipos')} onClick={() => setActiveTab('tipos')}>
                    <List size={18} /> Tipos de Chave PIX
                </div>
            </div>

            <PageSearch
                value={searchTerm}
                onChange={setSearchTerm}
                onSearch={loadData}
                placeholder="Buscar por descrição..."
            />
            
            <DataGrid
                columns={activeTab === 'chaves' ? columnsChaves : columnsTipos}
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
                emptyIcon={activeTab === 'chaves' ? <Key size={24} color="var(--text-muted)" /> : <List size={24} color="var(--text-muted)" />}
                emptyTitle={activeTab === 'chaves' ? "Nenhuma chave PIX encontrada" : "Nenhum tipo encontrado"}
                emptyMessage={activeTab === 'chaves' ? "Cadastre uma nova chave PIX." : "Cadastre um novo tipo de chave PIX."}
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={isEditing ? `Editar ${activeTab === 'chaves' ? 'Chave PIX' : 'Tipo'}` : `Novo ${activeTab === 'chaves' ? 'Chave PIX' : 'Tipo'}`}
                subtitle="Preencha os dados abaixo"
                icon={activeTab === 'chaves' ? <Key /> : <List />}
                onSave={handleSave}
                saving={saving}
                loading={modalLoading}
                saveLabel="Salvar"
            >
                {activeTab === 'chaves' ? (
                    <ChavePixForm form={formChave} onChange={setFormChave} />
                ) : (
                    <TipoChaveForm form={formTipo} onChange={setFormTipo} />
                )}
            </FormModal>
            {passwordModal}
            {confirmModal}
        </div>
    );
}
