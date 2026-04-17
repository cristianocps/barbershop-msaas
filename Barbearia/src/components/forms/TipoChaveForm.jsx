import React from 'react';
import { FormField } from '../UI/FormModal';

export function TipoChaveForm({ form, onChange }) {
    const set = (field, value) => onChange({ ...form, [field]: value });

    return (
        <>
            <FormField label="Descrição do Tipo" required>
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Ex: CPF, CNPJ, Email, Celular"
                    value={form.descricao || ''}
                    onChange={e => set('descricao', e.target.value)}
                    autoFocus
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

export const TipoChaveFormDefault = () => ({
    id: 0,
    descricao: '',
    status: 1,
});
