import React, { useState, useEffect, useCallback } from 'react';
import { FormField, FormRow } from '../UI/FormModal';
import { ClienteAutocomplete } from '../UI/ClienteAutocomplete';
import { ServicosAppService } from '../../services/Configuracoes/ServicosService';
import { ProfissionaisService } from '../../services/Configuracoes/ProfissionaisService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const STATUS_MAP = [
    { value: 0, label: 'Pendente' },
    { value: 1, label: 'Agendado' },
    { value: 2, label: 'Concluído' },
    { value: 3, label: 'Cancelado' },
];

// Linha vazia padrão de item de serviço
const itemVazio = () => ({ idServico: '', valorCobrado: '', duracaoMinutos: 0 });

export function AgendamentoForm({ form, onChange }) {
    const set = (field, value) => onChange({ ...form, [field]: value });
    const [servicos, setServicos] = useState([]);
    const [profissionais, setProfissionais] = useState([]);
    const [loadingPreco, setLoadingPreco] = useState({}); // { index: bool }
    const { user } = useAuth();
    const toast = useToast();

    // Garante que sempre haja pelo menos 1 item na lista
    const itens = (form.itens && form.itens.length > 0) ? form.itens : [itemVazio()];

    useEffect(() => {
        ServicosAppService.carregarCombo('', 1)
            .then(res => {
                const lista = res?.Data ?? res?.data ?? [];
                setServicos(Array.isArray(lista) ? lista : []);
            })
            .catch(() => setServicos([]));

        ProfissionaisService.carregarCombo('', 1)
            .then(res => {
                const lista = res?.Data ?? res?.data ?? [];
                const parsed = Array.isArray(lista) ? lista : [];
                setProfissionais(parsed);
                if (parsed.length === 1 && !form.idProfissional && (form.id === 0 || !form.id)) {
                    set('idProfissional', parsed[0].id);
                }
            })
            .catch(() => setProfissionais([]));
    }, []);

    // Auto-seleciona profissional ao CRIAR (não ao editar)
    useEffect(() => {
        if (profissionais.length === 1 && !form.idProfissional && (form.id === 0 || !form.id)) {
            set('idProfissional', profissionais[0].id);
        }
    }, [profissionais]);

    // --- Handlers dos itens de serviço ---

    const handleServicoChange = useCallback(async (index, idServico) => {
        // Verificação de serviço duplicado
        if (idServico) {
            const jaSelecionado = itens.some(
                (item, i) => i !== index && String(item.idServico) === String(idServico)
            );
            if (jaSelecionado) {
                toast.warning('Serviço já selecionado! Escolha um serviço diferente.');
                return; // mantém o select no valor anterior
            }
        }

        const novosItens = itens.map((item, i) =>
            i === index ? { ...item, idServico, valorCobrado: '', duracaoMinutos: 0 } : item
        );
        onChange({ ...form, itens: novosItens });

        if (!idServico) return;

        // Busca o preço do serviço automaticamente (Opção A)
        setLoadingPreco(prev => ({ ...prev, [index]: true }));
        try {
            const res = await ServicosAppService.editar(idServico);
            const dados = res?.Data ?? res?.data ?? res;
            const valor = dados?.ValorUnitario ?? dados?.valor_unitario ?? dados?.valorUnitario ?? 0;
            const duracao = dados?.DuracaoMinutos ?? dados?.duracaoMinutos ?? dados?.duracao ?? 30;
            onChange(prev => ({
                ...prev,
                itens: (prev.itens && prev.itens.length > 0 ? prev.itens : [itemVazio()]).map((item, i) =>
                    i === index
                        ? {
                            ...item,
                            idServico,
                            valorCobrado: Number(valor).toFixed(2),
                            duracaoMinutos: parseInt(duracao, 10) || 30,
                        }
                        : item
                )
            }));
        } catch {
            // Falhou — deixa o usuário digitar manualmente
        } finally {
            setLoadingPreco(prev => ({ ...prev, [index]: false }));
        }
    }, [itens, form, onChange]);

    const handleValorChange = (index, valorCobrado) => {
        onChange({
            ...form,
            itens: itens.map((item, i) => i === index ? { ...item, valorCobrado } : item)
        });
    };

    const adicionarItem = () => {
        onChange({ ...form, itens: [...itens, itemVazio()] });
    };

    const removerItem = (index) => {
        const novos = itens.filter((_, i) => i !== index);
        onChange({ ...form, itens: novos.length > 0 ? novos : [itemVazio()] });
    };

    // Calcula total dos itens para exibição
    const totalItens = itens.reduce((acc, item) => {
        const v = parseFloat(item.valorCobrado);
        return acc + (isNaN(v) ? 0 : v);
    }, 0);

    const totalDuracao = itens.reduce((acc, item) => {
        const d = parseInt(item.duracaoMinutos, 10);
        return acc + (isNaN(d) || d <= 0 ? 0 : d);
    }, 0);

    return (
        <>
            <FormField label="Cliente" required hint="Busque por nome, CPF ou celular no cadastro">
                <ClienteAutocomplete
                    idCliente={form.idCliente ?? 0}
                    nome={form.descricao || ''}
                    telefone={form.telefone || ''}
                    cpf={form.cpf || ''}
                    onChange={({ idCliente, descricao, telefone, cpf }) =>
                        onChange({ ...form, idCliente, descricao, telefone, cpf })
                    }
                />
            </FormField>

            <FormRow>
                <FormField label="CPF" hint="Opcional">
                    <input
                        className="fm-input"
                        type="text"
                        placeholder="000.000.000-00"
                        value={form.cpf || ''}
                        onChange={e => set('cpf', e.target.value)}
                    />
                </FormField>
                <FormField label="Telefone" required>
                    <input
                        className="fm-input"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={form.telefone || ''}
                        onChange={e => set('telefone', e.target.value)}
                    />
                </FormField>
            </FormRow>

            <FormField label="Data e Hora" required>
                <input
                    className="fm-input"
                    type="datetime-local"
                    value={form.dtAgendamento || ''}
                    onChange={e => set('dtAgendamento', e.target.value)}
                />
            </FormField>

            {user?.userMaxPolicy >= 3 && (
                <FormField label="Profissional">
                    <select
                        className="fm-select"
                        value={form.idProfissional || ''}
                        onChange={e => set('idProfissional', e.target.value)}
                    >
                        <option value="">— Selecione um profissional —</option>
                        {profissionais.map(p => (
                            <option key={p.id} value={p.id}>{p.text}</option>
                        ))}
                    </select>
                </FormField>
            )}

            {/* ── SERVIÇOS (múltiplos) ── */}
            <FormField label="Serviços">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {itens.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr auto auto',
                                gap: '8px',
                                alignItems: 'center',
                                background: 'rgba(246,176,1,0.04)',
                                border: '1px solid rgba(246,176,1,0.15)',
                                borderRadius: '10px',
                                padding: '8px 10px',
                            }}
                        >
                            {/* Select do serviço */}
                            <select
                                className="fm-select"
                                style={{ margin: 0 }}
                                value={item.idServico || ''}
                                onChange={e => handleServicoChange(index, e.target.value)}
                            >
                                <option value="">— Selecione um serviço —</option>
                                {servicos.map(s => (
                                    <option key={s.id} value={s.id}>{s.text}</option>
                                ))}
                            </select>

                            {/* Campo de valor — readonly para garantir preço do cadastro */}
                            <div style={{ position: 'relative', width: '110px' }}>
                                {loadingPreco[index] && (
                                    <span style={{
                                        position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                                        fontSize: '0.7rem', color: '#f6b001'
                                    }}>⏳</span>
                                )}
                                <input
                                    className="fm-input"
                                    style={{
                                        margin: 0,
                                        paddingLeft: loadingPreco[index] ? '24px' : undefined,
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        background: '#f3f4f6',
                                        color: '#6b7280',
                                        cursor: 'not-allowed',
                                    }}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="R$ 0,00"
                                    value={item.valorCobrado ?? ''}
                                    readOnly
                                    tabIndex={-1}
                                />
                            </div>

                            {/* Botão remover */}
                            <button
                                type="button"
                                title="Remover serviço"
                                onClick={() => removerItem(index)}
                                disabled={itens.length === 1 && !item.idServico}
                                style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(239,68,68,0.08)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.1rem', lineHeight: 1,
                                    flexShrink: 0,
                                    opacity: itens.length === 1 && !item.idServico ? 0.4 : 1,
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}

                    {/* Rodapé: botão adicionar + total */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <button
                            type="button"
                            onClick={adicionarItem}
                            style={{
                                padding: '5px 14px',
                                borderRadius: '8px',
                                background: 'rgba(246,176,1,0.1)',
                                color: '#e09800',
                                border: '1px solid rgba(246,176,1,0.25)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: '4px',
                            }}
                        >
                            + Adicionar serviço
                        </button>
                        <span style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {totalDuracao > 0 && (
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>
                                    Duração: {totalDuracao} min
                                </span>
                            )}
                            {totalItens > 0 && (
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a' }}>
                                    Total: R$ {totalItens.toFixed(2).replace('.', ',')}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </FormField>

            <FormField label="Observações">
                <textarea
                    className="fm-textarea"
                    placeholder="Alguma observação sobre o agendamento..."
                    rows={3}
                    value={form.observacao || ''}
                    onChange={e => set('observacao', e.target.value)}
                />
            </FormField>

            <FormField label="Status">
                <select
                    className="fm-select"
                    value={form.status ?? 1}
                    onChange={e => set('status', parseInt(e.target.value))}
                >
                    {STATUS_MAP.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </FormField>
        </>
    );
}

export const AgendamentoFormDefault = () => ({
    id: 0,
    idCliente: 0,
    descricao: '',
    telefone: '',
    cpf: '',
    dtAgendamento: '',
    idProfissional: '',
    itens: [itemVazio()],
    observacao: '',
    status: 1,
});
