import React from 'react';
import { FormField, FormRow } from '../UI/FormModal';

export function ClienteForm({ form, onChange }) {
    const set = (field, value) => onChange({ ...form, [field]: value });

    return (
        <>
            <FormField label="Nome do Cliente" required>
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Ex: João Silva"
                    value={form.descricao || ''}
                    onChange={e => set('descricao', e.target.value)}
                    autoFocus
                />
            </FormField>

            <FormField label="Telefone" hint="Será usado para confirmar os agendamentos">
                <input
                    className="fm-input"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={form.telefone || ''}
                    onChange={e => set('telefone', e.target.value)}
                />
            </FormField>

            <FormField label="Endereço" hint="Opcional">
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Ex: Rua Direita, 100"
                    value={form.endereco || ''}
                    onChange={e => set('endereco', e.target.value)}
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

export const ClienteFormDefault = () => ({
    id: 0,
    descricao: '',
    telefone: '',
    endereco: '',
    status: 1,
});
