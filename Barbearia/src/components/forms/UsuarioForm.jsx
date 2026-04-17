import React, { useState, useEffect } from 'react';
import { FormField, FormRow } from '../UI/FormModal';
import { PerfilService } from '../../services/Acessos/PerfilService';
import { EmpresasService } from '../../services/Configuracoes/EmpresasService';
import { useAuth } from '../../contexts/AuthContext';

export function UsuarioForm({ form, onChange, isEditing }) {
    const set = (field, value) => onChange({ ...form, [field]: value });
    const [perfis, setPerfis] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        PerfilService.carregarCombo('', 1)
            .then(res => {
                const lista = res?.Data ?? res?.data ?? [];
                setPerfis(Array.isArray(lista) ? lista : []);
            })
            .catch(() => setPerfis([]));

        EmpresasService.carregarCombo('', 1)
            .then(res => {
                const lista = res?.Data ?? res?.data ?? [];
                // if it comes as { Data: [...], ... }
                setEmpresas(Array.isArray(lista) ? lista : []);
            })
            .catch(() => setEmpresas([]));
    }, []);

    return (
        <>
            <FormField label="Nome completo" required>
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={form.descricao || ''}
                    onChange={e => set('descricao', e.target.value)}
                    autoFocus
                />
            </FormField>

            <FormField label="E-mail" required hint="Usado como login de acesso ao sistema">
                <input
                    className="fm-input"
                    type="email"
                    placeholder="usuario@email.com"
                    value={form.email || ''}
                    onChange={e => set('email', e.target.value)}
                    readOnly={isEditing}
                    style={isEditing ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                />
            </FormField>

            {!isEditing && (
                <FormField label="Senha" required hint="Mínimo 6 caracteres">
                    <input
                        className="fm-input"
                        type="password"
                        placeholder="••••••••"
                        value={form.senha || ''}
                        onChange={e => set('senha', e.target.value)}
                    />
                </FormField>
            )}

            <FormRow>
                <FormField label="Telefone">
                    <input
                        className="fm-input"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={form.telefone || ''}
                        onChange={e => set('telefone', e.target.value)}
                    />
                </FormField>
                <FormField label="Documento (CPF)" required>
                    <input
                        className="fm-input"
                        type="text"
                        placeholder="000.000.000-00"
                        value={form.documento || ''}
                        onChange={e => set('documento', e.target.value)}
                    />
                </FormField>
            </FormRow>

            <FormField label="Cidade">
                <input
                    className="fm-input"
                    type="text"
                    placeholder="Ex: São Paulo"
                    value={form.cidade || ''}
                    onChange={e => set('cidade', e.target.value)}
                />
            </FormField>

            <FormField label="Perfil de Acesso">
                <select
                    className="fm-select"
                    value={form.idClains || ''}
                    onChange={e => set('idClains', e.target.value)}
                >
                    <option value="">— Selecione um perfil —</option>
                    {perfis.map((p) => (
                        // DataSelect2DTO sempre retorna { id, text }
                        <option key={p.id} value={p.id}>
                            {p.text}
                        </option>
                    ))}
                </select>
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

export const UsuarioFormDefault = () => ({
    id: 0,
    descricao: '',
    email: '',
    senha: '',
    telefone: '',
    documento: '',
    cidade: '',
    idClains: '',
    idEmpresa: 0,
    status: 1,
});
