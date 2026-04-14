import React, { useState, useEffect } from 'react';
import { FormField, FormRow } from '../UI/FormModal';
import { useAuth } from '../../contexts/AuthContext';
import { ProfissionaisService } from '../../services/Configuracoes/ProfissionaisService';

const DIAS_SEMANA = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
];

export function HorarioForm({ form, onChange }) {
    const set = (field, value) => onChange({ ...form, [field]: value });
    const [profissionais, setProfissionais] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        ProfissionaisService.carregarCombo('', 1)
            .then(res => {
                const lista = res?.Data ?? res?.data ?? [];
                setProfissionais(Array.isArray(lista) ? lista : []);
            })
            .catch(() => setProfissionais([]));
    }, []);

    // Helper para converter "HH:mm:ss" ou "HH:mm" vindo do C# TimeSpan para o input type="time"
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        // C# TimeSpan is like "08:00:00"
        return timeStr.substring(0, 5); 
    };

    return (
        <>
            <FormField label="Profissional" required>
                <select
                    className="fm-select"
                    value={form.idProfissional || 0}
                    onChange={e => set('idProfissional', parseInt(e.target.value))}
                    disabled={form.id > 0} // Nao permitir trocar o profissional do horario depois de criado
                >
                    <option value={0}>— Selecione o Profissional —</option>
                    {profissionais.map(p => (
                        <option key={p.id} value={p.id}>{p.text}</option>
                    ))}
                </select>
            </FormField>

            <FormField label="Dia da Semana" required>
                <select
                    className="fm-select"
                    value={form.diaSemana ?? 1}
                    onChange={e => set('diaSemana', parseInt(e.target.value))}
                >
                    {DIAS_SEMANA.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                </select>
            </FormField>

            <FormRow>
                <FormField label="Hora Início" required>
                    <input
                        className="fm-input"
                        type="time"
                        value={formatTime(form.horaInicio)}
                        onChange={e => set('horaInicio', e.target.value + ":00")}
                    />
                </FormField>

                <FormField label="Hora Fim (Saída/Pausa)" required>
                    <input
                        className="fm-input"
                        type="time"
                        value={formatTime(form.horaFim)}
                        onChange={e => set('horaFim', e.target.value + ":00")}
                    />
                </FormField>
            </FormRow>

            <FormField label="Duração do Atendimento (Minutos)" required>
                <input
                    className="fm-input"
                    type="number"
                    min="15"
                    step="5"
                    placeholder="Ex: 30"
                    value={form.duracaoMinutos ?? 30}
                    onChange={e => set('duracaoMinutos', parseInt(e.target.value) || 30)}
                />
                <small style={{display: 'block', marginTop: '4px', fontSize: '0.75rem', color: '#6b7280'}}>
                    De quanto em quanto tempo a Vitrine deve gerar os horários (Ex: a cada 30 min).
                </small>
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

export function HorarioFormDefault() {
    return {
        id: 0,
        idEmpresa: 0,
        idProfissional: 0,
        diaSemana: 1, // Segunda-feira
        horaInicio: "08:00:00",
        horaFim: "12:00:00",
        duracaoMinutos: 30,
        status: 1
    };
}
