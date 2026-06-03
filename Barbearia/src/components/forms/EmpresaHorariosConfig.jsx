import React from 'react';
import { Clock, CalendarClock } from 'lucide-react';

const DIAS_SEMANA = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
];

const DEFAULT_DIA = {
    diaSemana: 1,
    horaInicio: '08:00:00',
    horaFim: '18:00:00',
    duracaoMinutos: 30,
    ativo: true,
};

function padTime(val) {
    if (!val) return '00:00';
    return val.length >= 5 ? val.substring(0, 5) : val;
}

function parseHorariosValue(value) {
    if (Array.isArray(value) && value.length === 7) return value;
    if (typeof value === 'string' && value.trim()) {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) && parsed.length === 7) return parsed;
        } catch { /* ignore */ }
    }
    return null;
}

export function EmpresaHorariosConfig({ value, onChange }) {
    const horarios = parseHorariosValue(value) ?? DIAS_SEMANA.map(d => ({ ...DEFAULT_DIA, diaSemana: d.value, ativo: d.value >= 1 && d.value <= 5 }));

    const setDia = (idx, field, val) => {
        const next = horarios.map((h, i) => (i === idx ? { ...h, [field]: val } : h));
        onChange(next);
    };

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <CalendarClock size={18} color="#f6b001" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#111827' }}>
                    Horários de Funcionamento
                </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem', marginTop: 0 }}>
                Defina os horários de expediente da barbearia para cada dia da semana. Isso afeta o calendário interno e a vitrine pública de agendamentos.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {horarios.map((h, idx) => (
                    <div
                        key={h.diaSemana}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            flexWrap: 'wrap',
                            padding: '0.75rem 1rem',
                            background: h.ativo ? '#fff' : '#f9fafb',
                            borderRadius: '12px',
                            border: `1px solid ${h.ativo ? '#e5e7eb' : '#f3f4f6'}`,
                            opacity: h.ativo ? 1 : 0.7,
                        }}
                    >
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                minWidth: '140px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                color: '#111827',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={h.ativo}
                                onChange={(e) => setDia(idx, 'ativo', e.target.checked)}
                                style={{ width: '18px', height: '18px', accentColor: '#f6b001', cursor: 'pointer' }}
                            />
                            {DIAS_SEMANA.find(d => d.value === h.diaSemana)?.label}
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={14} color="#9ca3af" />
                                <input
                                    type="time"
                                    value={padTime(h.horaInicio)}
                                    onChange={(e) => setDia(idx, 'horaInicio', e.target.value + ':00')}
                                    disabled={!h.ativo}
                                    style={{
                                        padding: '0.35rem 0.5rem',
                                        borderRadius: '8px',
                                        border: '1.5px solid #e5e7eb',
                                        fontSize: '0.85rem',
                                        color: '#111827',
                                        background: h.ativo ? '#fff' : '#f3f4f6',
                                    }}
                                />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>até</span>
                            <input
                                type="time"
                                value={padTime(h.horaFim)}
                                onChange={(e) => setDia(idx, 'horaFim', e.target.value + ':00')}
                                disabled={!h.ativo}
                                style={{
                                    padding: '0.35rem 0.5rem',
                                    borderRadius: '8px',
                                    border: '1.5px solid #e5e7eb',
                                    fontSize: '0.85rem',
                                    color: '#111827',
                                    background: h.ativo ? '#fff' : '#f3f4f6',
                                }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>Intervalo:</span>
                                <input
                                    type="number"
                                    min={15}
                                    step={5}
                                    value={h.duracaoMinutos}
                                    onChange={(e) => setDia(idx, 'duracaoMinutos', parseInt(e.target.value) || 30)}
                                    disabled={!h.ativo}
                                    style={{
                                        width: '60px',
                                        padding: '0.35rem 0.5rem',
                                        borderRadius: '8px',
                                        border: '1.5px solid #e5e7eb',
                                        fontSize: '0.85rem',
                                        color: '#111827',
                                        background: h.ativo ? '#fff' : '#f3f4f6',
                                    }}
                                />
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>min</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function buildDefaultHorariosConfig() {
    return DIAS_SEMANA.map(d => ({
        diaSemana: d.value,
        horaInicio: '08:00:00',
        horaFim: '18:00:00',
        duracaoMinutos: 30,
        ativo: d.value >= 1 && d.value <= 5,
    }));
}
