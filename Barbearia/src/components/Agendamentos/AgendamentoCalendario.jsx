import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    addDays,
    format,
    isSameDay,
    isToday,
    startOfDay,
    startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AgendamentosService } from '../../services/Agendamentos/AgendamentosService';
import { ProfissionaisService } from '../../services/Configuracoes/ProfissionaisService';

const HORA_INICIO = 8;
const HORA_FIM = 20;
const SLOT_MINUTOS = 30;
/** Altura em px de cada slot de 30 min — define a escala temporal do calendário */
const ALTURA_SLOT = 48;

const STATUS_MAP = {
    0: { label: 'Pendente', opacity: 0.85 },
    1: { label: 'Agendado', opacity: 1 },
    2: { label: 'Concluído', opacity: 0.65 },
    3: { label: 'Cancelado', opacity: 0.4 },
};

function pick(row, ...keys) {
    for (const k of keys) {
        if (row?.[k] !== undefined && row?.[k] !== null) return row[k];
    }
    return undefined;
}

function toDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function slotToDatetimeLocal(day, slot) {
    const d = new Date(day);
    d.setHours(slot.hour, slot.minute, 0, 0);
    return `${format(d, 'yyyy-MM-dd')}T${format(d, 'HH:mm')}`;
}

function slotOverlapsApt(slot, apt) {
    const dt = toDate(pick(apt, 'dtAgendamento', 'DtAgendamento'));
    if (!dt) return false;

    const aptStart = dt.getHours() * 60 + dt.getMinutes();
    const aptDur = pick(apt, 'duracaoMinutos', 'DuracaoMinutos') || SLOT_MINUTOS;
    const aptEnd = aptStart + aptDur;
    const slotStart = slot.hour * 60 + slot.minute;
    const slotEnd = slotStart + SLOT_MINUTOS;

    return slotStart < aptEnd && slotEnd > aptStart;
}

export function AgendamentoCalendario({ onSelectAgendamento, onCreateAgendamento }) {
    const [weekStart, setWeekStart] = useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );
    const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
    const [profissionais, setProfissionais] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const weekDays = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart]
    );

    const timeSlots = useMemo(() => {
        const slots = [];
        for (let h = HORA_INICIO; h < HORA_FIM; h++) {
            for (let m = 0; m < 60; m += SLOT_MINUTOS) {
                slots.push({
                    hour: h,
                    minute: m,
                    label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
                });
            }
        }
        return slots;
    }, []);

    const totalHeight = timeSlots.length * ALTURA_SLOT;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const inicio = startOfDay(selectedDay);
            const fim = addDays(inicio, 1);

            const [profRes, calRes] = await Promise.all([
                ProfissionaisService.carregarGrid({ value: '' }, 0, 100),
                AgendamentosService.carregarCalendario(inicio, fim),
            ]);

            const profList = (profRes?.data || profRes?.Data || []).filter(
                (p) => (pick(p, 'status', 'Status') ?? 1) === 1
            );
            const calPayload = calRes?.Data ?? calRes?.data ?? calRes ?? [];

            setProfissionais(profList);
            setAgendamentos(Array.isArray(calPayload) ? calPayload : []);
        } catch (err) {
            setError(err.message || 'Erro ao carregar calendário');
        } finally {
            setLoading(false);
        }
    }, [selectedDay]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const agendamentosDoDia = useMemo(() => {
        return agendamentos.filter((a) => {
            const dt = toDate(pick(a, 'dtAgendamento', 'DtAgendamento'));
            return dt && isSameDay(dt, selectedDay);
        });
    }, [agendamentos, selectedDay]);

    const getBlockStyle = (apt) => {
        const dt = toDate(pick(apt, 'dtAgendamento', 'DtAgendamento'));
        if (!dt) return null;

        const startMinutes = dt.getHours() * 60 + dt.getMinutes();
        const dayStartMinutes = HORA_INICIO * 60;
        const duracao = pick(apt, 'duracaoMinutos', 'DuracaoMinutos') || 30;
        const slotSpan = Math.max(duracao / SLOT_MINUTOS, 0.5);
        const top = ((startMinutes - dayStartMinutes) / SLOT_MINUTOS) * ALTURA_SLOT + 1;
        const height = Math.max(Math.round(slotSpan * ALTURA_SLOT) - 3, 40);

        if (startMinutes < dayStartMinutes || startMinutes >= HORA_FIM * 60) return null;

        const cor = pick(apt, 'corAgenda', 'CorAgenda') || '#3B82F6';
        const status = pick(apt, 'status', 'Status') ?? 1;
        const st = STATUS_MAP[status] ?? STATUS_MAP[1];

        return {
            top,
            height,
            duracao,
            compact: height < 52,
            backgroundColor: cor,
            opacity: st.opacity,
        };
    };

    const shiftWeek = (delta) => {
        const next = addDays(weekStart, delta * 7);
        setWeekStart(next);
        setSelectedDay(addDays(selectedDay, delta * 7));
    };

    const selectDay = (day) => {
        setSelectedDay(startOfDay(day));
        setWeekStart(startOfWeek(day, { weekStartsOn: 1 }));
    };

    const goToday = () => {
        const today = new Date();
        setWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
        setSelectedDay(startOfDay(today));
    };

    if (loading && profissionais.length === 0) {
        return (
            <div className="cal-loading">
                <Loader2 size={28} className="cal-spin" />
                <span>Carregando calendário...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cal-error">
                <p>{error}</p>
                <button type="button" onClick={loadData}>Tentar novamente</button>
            </div>
        );
    }

    const profsAtivos = profissionais.length > 0 ? profissionais : [];

    return (
        <div className="cal-wrap">
            <div className="cal-toolbar">
                <div className="cal-nav">
                    <button type="button" className="cal-nav-btn" onClick={() => shiftWeek(-1)} aria-label="Semana anterior">
                        <ChevronLeft size={18} />
                    </button>
                    <button type="button" className="cal-today-btn" onClick={goToday}>
                        Hoje
                    </button>
                    <button type="button" className="cal-nav-btn" onClick={() => shiftWeek(1)} aria-label="Próxima semana">
                        <ChevronRight size={18} />
                    </button>
                </div>
                <h3 className="cal-period-title">
                    {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h3>
            </div>

            <div className="date-slider cal-week-strip">
                {weekDays.map((day) => {
                    const selected = isSameDay(day, selectedDay);
                    const today = isToday(day);
                    const count = agendamentos.filter((a) => {
                        const dt = toDate(pick(a, 'dtAgendamento', 'DtAgendamento'));
                        return dt && isSameDay(dt, day);
                    }).length;

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            className={`date-card cal-day-pick ${selected ? 'selected' : ''} ${today && !selected ? 'today' : ''}`}
                            onClick={() => selectDay(day)}
                        >
                            <div className="date-weekday">{format(day, 'EEE', { locale: ptBR })}</div>
                            <div className="date-day">{format(day, 'd')}</div>
                            {count > 0 && <span className="cal-day-badge">{count}</span>}
                        </button>
                    );
                })}
            </div>

            {profsAtivos.length === 0 ? (
                <div className="cal-empty">
                    <p>Nenhum profissional ativo cadastrado.</p>
                    <p className="cal-empty-hint">Cadastre barbeiros em Configurações → Profissionais.</p>
                </div>
            ) : (
                <div className="cal-grid-scroll">
                    <div
                        className="cal-grid"
                        style={{
                            gridTemplateColumns: `56px repeat(${profsAtivos.length}, minmax(140px, 1fr))`,
                        }}
                    >
                        <div className="cal-corner" />
                        {profsAtivos.map((prof) => {
                            const id = pick(prof, 'id', 'ID', 'Id');
                            const nome = pick(prof, 'descricao', 'Descricao') || 'Profissional';
                            const cor = pick(prof, 'corAgenda', 'CorAgenda') || '#3B82F6';
                            return (
                                <div
                                    key={id}
                                    className="cal-prof-header"
                                    style={{ borderTopColor: cor }}
                                >
                                    <span className="cal-prof-dot" style={{ background: cor }} />
                                    <span className="cal-prof-name">{nome}</span>
                                </div>
                            );
                        })}

                        <div className="cal-time-col" style={{ height: totalHeight }}>
                            {timeSlots.map((slot) => (
                                <div
                                    key={slot.label}
                                    className="cal-time-label"
                                    style={{ height: ALTURA_SLOT }}
                                >
                                    {slot.minute === 0 ? slot.label : ''}
                                </div>
                            ))}
                        </div>

                        {profsAtivos.map((prof) => {
                            const profId = Number(pick(prof, 'id', 'ID', 'Id')) || 0;
                            const apts = agendamentosDoDia.filter(
                                (a) => Number(pick(a, 'idProfissional', 'IdProfissional')) === profId
                            );

                            return (
                                <div
                                    key={profId}
                                    className="cal-prof-col"
                                    style={{ height: totalHeight }}
                                >
                                    {timeSlots.map((slot) => {
                                        const ocupado = apts.some((apt) => slotOverlapsApt(slot, apt));
                                        return (
                                            <button
                                                key={`${profId}-${slot.label}`}
                                                type="button"
                                                className={`cal-slot ${ocupado ? 'cal-slot-busy' : 'cal-slot-free'}`}
                                                style={{ height: ALTURA_SLOT }}
                                                title={ocupado ? undefined : `Novo agendamento — ${slot.label}`}
                                                disabled={ocupado}
                                                onClick={() => {
                                                    if (ocupado || !onCreateAgendamento) return;
                                                    onCreateAgendamento({
                                                        idProfissional: profId,
                                                        dtAgendamento: slotToDatetimeLocal(selectedDay, slot),
                                                    });
                                                }}
                                            />
                                        );
                                    })}
                                    {apts.map((apt) => {
                                        const block = getBlockStyle(apt);
                                        if (!block) return null;
                                        const id = pick(apt, 'id', 'ID', 'Id');
                                        const status = pick(apt, 'status', 'Status') ?? 1;
                                        const st = STATUS_MAP[status] ?? STATUS_MAP[1];
                                        const valor = pick(apt, 'valorTotal', 'ValorTotal');
                                        const dt = toDate(pick(apt, 'dtAgendamento', 'DtAgendamento'));
                                        const { compact, duracao: durMin, ...blockStyle } = block;
                                        const horaFim = dt
                                            ? format(
                                                  new Date(dt.getTime() + (durMin || 30) * 60 * 1000),
                                                  'HH:mm'
                                              )
                                            : '';

                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                className={`cal-apt-block${compact ? ' cal-apt-block--compact' : ''}`}
                                                style={blockStyle}
                                                title={`${pick(apt, 'descricao', 'Descricao')} — ${st.label}${durMin ? ` (${durMin} min)` : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectAgendamento?.(id);
                                                }}
                                            >
                                                <span className="cal-apt-time">
                                                    {dt ? format(dt, 'HH:mm') : ''}
                                                    {horaFim ? ` – ${horaFim}` : ''}
                                                </span>
                                                <span className="cal-apt-title">
                                                    {pick(apt, 'descricao', 'Descricao')}
                                                </span>
                                                {!compact && valor > 0 && (
                                                    <span className="cal-apt-valor">
                                                        R$ {Number(valor).toFixed(2).replace('.', ',')}
                                                    </span>
                                                )}
                                                {!compact && durMin > 0 && (
                                                    <span className="cal-apt-duracao">{durMin} min</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="cal-legend">
                {Object.entries(STATUS_MAP).map(([code, { label }]) => (
                    <span key={code} className="cal-legend-item">
                        <span className={`cal-legend-dot status-${code}`} />
                        {label}
                    </span>
                ))}
                <span className="cal-legend-hint">Clique em um horário vazio para criar agendamento</span>
            </div>
        </div>
    );
}
