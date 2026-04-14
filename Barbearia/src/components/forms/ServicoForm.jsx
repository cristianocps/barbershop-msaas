import React, { useState, useEffect } from 'react';
import { FormField, FormRow } from '../UI/FormModal';
import { useAuth } from '../../contexts/AuthContext';
import { EmpresasService } from '../../services/Configuracoes/EmpresasService';

const UNIDADES = ['UN', 'HR', 'MIN', 'KG', 'LT', 'M'];

export function ServicoForm({ form, onChange }) {
    const set = (field, value) => onChange({ ...form, [field]: value });
    const [empresas, setEmpresas] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        EmpresasService.carregarCombo('', 1)
            .then(res => {
                const lista = res?.Data ?? res?.data ?? [];
                setEmpresas(Array.isArray(lista) ? lista : []);
            })
            .catch(() => setEmpresas([]));
    }, []);

    return (
        <>
            <FormField label="Nome do Serviço" required>
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Ex: Corte Masculino"
                    value={form.descricao || ''}
                    onChange={e => set('descricao', e.target.value)}
                    autoFocus
                />
            </FormField>

            <FormRow>
                <FormField label="Valor (R$)" required>
                    <input
                        className="fm-input"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={form.valorUnitario ?? ''}
                        onChange={e => set('valorUnitario', e.target.value)}
                    />
                </FormField>
                <FormField label="Unidade">
                    <select
                        className="fm-select"
                        value={form.unidade || 'UN'}
                        onChange={e => set('unidade', e.target.value)}
                    >
                        {UNIDADES.map(u => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </FormField>
            </FormRow>

            <FormField label="Duração estimada (minutos)">
                <input
                    className="fm-input"
                    type="number"
                    min="5"
                    step="5"
                    placeholder="Ex: 30"
                    value={form.duracao ?? ''}
                    onChange={e => set('duracao', e.target.value)}
                />
            </FormField>

            <FormField label="Observações">
                <textarea
                    className="fm-textarea"
                    placeholder="Descrição ou observações sobre o serviço..."
                    rows={3}
                    value={form.observacao || ''}
                    onChange={e => set('observacao', e.target.value)}
                />
            </FormField>

            {user?.userMaxPolicy >= 4 && (
                <FormField label="Barbearia (Empresa)">
                    <select
                        className="fm-select"
                        value={form.idEmpresa || 0}
                        onChange={e => set('idEmpresa', parseInt(e.target.value))}
                    >
                        <option value={0}>— Selecione uma barbearia —</option>
                        {empresas.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.text}
                            </option>
                        ))}
                    </select>
                </FormField>
            )}

            <FormField label="Status">
                <select
                    className="fm-select"
                    value={form.status ?? 1}
                    onChange={e => set('status', parseInt(e.target.value))}
                >
                    <option value={1}>Ativo</option>
                    <option value={0}>Inativo</option>
                </select>
            </FormField>
        </>
    );
}

export const ServicoFormDefault = () => ({
    id: 0,
    descricao: '',
    valorUnitario: '',
    unidade: 'UN',
    duracao: '',
    observacao: '',
    idEmpresa: 0,
    status: 1,
});
