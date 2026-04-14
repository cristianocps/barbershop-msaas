import React, { useState, useEffect } from 'react';
import { FormField, FormRow } from '../UI/FormModal';
import { EmpresasService } from '../../services/Configuracoes/EmpresasService';
import { useAuth } from '../../contexts/AuthContext';

export function ProfissionalForm({ form, onChange }) {
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

    const isWhatsAppValido = (phone) => {
        if (!phone) return false;
        const digits = phone.replace(/\D/g, '');
        return digits.length === 11 && digits[2] === '9';
    };

    return (
        <>
            <FormField label="Nome do Profissional" required>
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={form.descricao || ''}
                    onChange={e => set('descricao', e.target.value)}
                    autoFocus
                />
            </FormField>

            <FormRow>
                <FormField label="Telefone">
                    <input
                        className="fm-input"
                        type="tel"
                        placeholder="(00) 90000-0000"
                        value={form.telefone || ''}
                        onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 11) set('telefone', val);
                        }}
                        style={form.telefone && !isWhatsAppValido(form.telefone) ? { borderColor: '#ef4444' } : {}}
                    />
                    {form.telefone && !isWhatsAppValido(form.telefone) && (
                        <small style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                            ⚠️ Informe um WhatsApp válido (DDD + 9 dígitos). Ex: 11912345678
                        </small>
                    )}
                    {form.telefone && isWhatsAppValido(form.telefone) && (
                        <small style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                            ✅ WhatsApp válido
                        </small>
                    )}
                </FormField>
                <FormField label="Cor na Agenda (Opcional)">
                    <input
                        className="fm-input"
                        type="color"
                        value={form.corAgenda || '#000000'}
                        onChange={e => set('corAgenda', e.target.value)}
                        style={{ padding: '0px', height: '42px', cursor: 'pointer', borderRadius: '10px' }}
                    />
                </FormField>
            </FormRow>

            {user?.userMaxPolicy >= 4 && (
                <FormField label="Barbearia (Empresa)">
                    <select
                        className="fm-select"
                        value={form.idEmpresa || 0}
                        onChange={e => set('idEmpresa', parseInt(e.target.value))}
                    >
                        <option value={0}>— Selecione a barbearia —</option>
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

export const ProfissionalFormDefault = () => ({
    id: 0,
    descricao: '',
    telefone: '',
    corAgenda: '#000000',
    idEmpresa: 0,
    status: 1,
});
