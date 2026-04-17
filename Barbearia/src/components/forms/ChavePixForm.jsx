import React, { useState, useEffect } from 'react';
import { FormField } from '../UI/FormModal';
import { DadosBancariosService } from '../../services/Configuracoes/DadosBancariosService';

export function ChavePixForm({ form, onChange }) {
    const set = (field, value) => onChange({ ...form, [field]: value });
    const [tiposChave, setTiposChave] = useState([]);

    useEffect(() => {
        DadosBancariosService.carregarComboTipoChaves('', 1)
            .then(res => {
                const lista = res?.Data ?? res?.data ?? [];
                setTiposChave(Array.isArray(lista) ? lista : []);
            })
            .catch(() => setTiposChave([]));
    }, []);

    return (
        <>
            <FormField label="Tipo de Chave PIX" required>
                <select
                    className="fm-select"
                    value={form.idTipoChavePix || ''}
                    onChange={e => set('idTipoChavePix', parseInt(e.target.value))}
                >
                    <option value="">— Selecione o Tipo —</option>
                    {tiposChave.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                            {tipo.text}
                        </option>
                    ))}
                </select>
            </FormField>

            <FormField label="Chave PIX (Descrição)" required>
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Informe a chave PIX"
                    value={form.descricao || ''}
                    onChange={e => set('descricao', e.target.value)}
                />
            </FormField>
            
            <FormField label="Senha de Confirmação" required>
                <input
                    className="fm-input"
                    type="password"
                    placeholder="Senha exigida pelo sistema para confirmação"
                    value={form.senhaConfirmacao || ''}
                    onChange={e => set('senhaConfirmacao', e.target.value)}
                />
            </FormField>

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

export const ChavePixFormDefault = () => ({
    id: 0,
    descricao: '',
    idTipoChavePix: '',
    senhaConfirmacao: '',
    status: 1,
});
