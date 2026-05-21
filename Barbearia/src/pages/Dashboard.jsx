import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    CalendarDays, Users, Scissors, Building2,
    ArrowRight, BarChart3, Star, TrendingUp
} from 'lucide-react';
import { AgendamentosService } from '../services/Agendamentos/AgendamentosService';
import { UsuariosService } from '../services/Acessos/UsuariosService';
import { ServicosAppService } from '../services/Configuracoes/ServicosService';
import { EmpresasService } from '../services/Configuracoes/EmpresasService';
import { useAuth } from '../contexts/AuthContext';
import { OnboardingService } from '../services/Configuracoes/OnboardingService';
import { canManageAllEmpresas } from '../utils/userPolicy';

/* ─── CSS embutido com media queries reais ─── */
const css = `
.dash-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}
@media (min-width: 768px) {
    .dash-stats-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

.dash-bottom-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
}
@media (min-width: 900px) {
    .dash-bottom-grid {
        grid-template-columns: 1.5fr 1fr;
    }
}

.dash-quick-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
}

.stat-card {
    background: #fff;
    border-radius: 18px;
    padding: 1.1rem 1rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    text-decoration: none;
    display: block;
    position: relative;
    overflow: hidden;
}
.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.stat-card-strip {
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    border-radius: 18px 0 0 18px;
}
.stat-card-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #9ca3af;
    margin: 0 0 0.4rem 0;
    line-height: 1.2;
}
.stat-card-value {
    font-size: 2rem;
    font-weight: 900;
    color: #111827;
    line-height: 1;
    min-height: 2rem;
}
@media (min-width: 768px) {
    .stat-card-value {
        font-size: 2.4rem;
    }
}
.stat-card-sub {
    font-size: 0.72rem;
    color: #9ca3af;
    margin: 0.3rem 0 0;
}
.stat-card-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
}
.stat-card-footer {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

.skeleton-box {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
}
@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.ag-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    transition: background 0.2s;
}
.ag-item:hover {
    background: #f1f5f9;
}

.quick-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 14px;
    border-radius: 14px;
    transition: background 0.2s, transform 0.2s;
    cursor: pointer;
    text-decoration: none;
}
.quick-btn:hover {
    transform: scale(1.02);
}

.panel-card {
    background: #fff;
    border-radius: 20px;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}
`;

function SkeletonValue() {
    return <div className="skeleton-box" style={{ height: '2rem', width: '60px' }} />;
}

function StatusBadge({ status }) {
    const map = {
        0: { label: 'Pendente', bg: '#fef9c3', color: '#854d0e' },
        1: { label: 'Agendado', bg: '#dbeafe', color: '#1d4ed8' },
        2: { label: 'Concluído', bg: '#dcfce7', color: '#16a34a' },
        3: { label: 'Cancelado', bg: '#fee2e2', color: '#dc2626' },
    };
    const s = map[status] ?? map[0];
    return (
        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {s.label}
        </span>
    );
}

export function Dashboard() {
    const { user } = useAuth();
    const [counts, setCounts] = useState({ agendamentos: null, usuarios: null, servicos: null, empresas: null });
    const [loading, setLoading] = useState(true);
    const [recent, setRecent] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [pendentes, setPendentes] = useState([]);
    const [loadingPendentes, setLoadingPendentes] = useState(true);
    const [onboarding, setOnboarding] = useState(null);

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const firstName = user?.name?.split(' ')[0] || 'Admin';
    const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    const PolicyLevels = { 'consulta': 1, 'usuario': 2, 'profissional': 3, 'gerente': 4, 'admin': 5, 'desenvolvedor': 6 };
    const managesAllEmpresas = canManageAllEmpresas(user);
    let userMaxPolicy = 0;
    if (user?.roles && user.roles.length > 0) {
        user.roles.forEach(role => {
            const norm = role.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const level = PolicyLevels[norm] || 0;
            if (level > userMaxPolicy) userMaxPolicy = level;
        });
    }

    useEffect(() => {
        Promise.allSettled([
            AgendamentosService.carregarGrid(null, 0, 1),
            (userMaxPolicy >= PolicyLevels['admin'] ? UsuariosService.carregarGrid(null, 0, 1) : Promise.reject('deny')),
            (userMaxPolicy >= PolicyLevels['profissional'] ? ServicosAppService.carregarGrid(null, 0, 1) : Promise.reject('deny')),
            (managesAllEmpresas ? EmpresasService.carregarGrid(null, 0, 1) : Promise.reject('deny')),
        ]).then(([ag, us, sv, em]) => {
            const pick = (r) => r.status === 'fulfilled' ? (r.value?.recordsTotal ?? r.value?.RecordsTotal ?? 0) : '–';
            setCounts({ agendamentos: pick(ag), usuarios: pick(us), servicos: pick(sv), empresas: pick(em) });
            setLoading(false);
        });

        AgendamentosService.carregarGrid(null, 0, 5)
            .then(res => setRecent(res?.data || res?.Data || []))
            .catch(() => setRecent([]))
            .finally(() => setLoadingRecent(false));

        AgendamentosService.getPendentesHoje()
            .then(res => setPendentes(res?.Data ?? res?.data ?? res ?? []))
            .catch(() => setPendentes([]))
            .finally(() => setLoadingPendentes(false));

        OnboardingService.obterStatus()
            .then(res => setOnboarding(res?.data ?? res?.Data ?? null))
            .catch(() => setOnboarding(null));
    }, []);

    const stats = [
        { label: 'Agendamentos', value: counts.agendamentos, icon: <CalendarDays size={20} />, color: '#3b82f6', link: '/agendamentos', minPolicy: 'usuario' },
        { label: 'Usuários', value: counts.usuarios, icon: <Users size={20} />, color: '#8b5cf6', link: '/usuarios', minPolicy: 'admin' },
        { label: 'Serviços', value: counts.servicos, icon: <Scissors size={20} />, color: '#f6b001', link: '/servicos', minPolicy: 'profissional' },
        ...(managesAllEmpresas
            ? [{ label: 'Barbearias', value: counts.empresas, icon: <Building2 size={20} />, color: '#ef4444', link: '/empresas', minPolicy: 'admin' }]
            : [{ label: 'Minha unidade', value: '—', icon: <Building2 size={20} />, color: '#ef4444', link: '/minha-barbearia', minPolicy: 'profissional' }]),
    ].filter(s => userMaxPolicy >= (PolicyLevels[s.minPolicy] || 0));

    const quickLinks = [
        { label: 'Agendamentos', icon: <CalendarDays size={18} />, color: '#3b82f6', to: '/agendamentos', minPolicy: 'usuario' },
        { label: 'Financeiro', icon: <TrendingUp size={18} />, color: '#16a34a', to: '/financeiro', minPolicy: 'gerente' },
        { label: 'Usuários', icon: <Users size={18} />, color: '#8b5cf6', to: '/usuarios', minPolicy: 'admin' },
        { label: 'Serviços', icon: <Scissors size={18} />, color: '#f6b001', to: '/servicos', minPolicy: 'profissional' },
        ...(managesAllEmpresas
            ? [{ label: 'Barbearias', icon: <Building2 size={18} />, color: '#ef4444', to: '/empresas', minPolicy: 'admin' }]
            : [{ label: 'Minha barbearia', icon: <Building2 size={18} />, color: '#ef4444', to: '/minha-barbearia', minPolicy: 'profissional' }]),
    ].filter(s => userMaxPolicy >= (PolicyLevels[s.minPolicy] || 0));

    return (
        <>
            {/* Inject CSS com media queries */}
            <style>{css}</style>

            <div style={{ paddingBottom: '3rem' }}>

                {/* ── Welcome Banner ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
                    borderRadius: '22px',
                    padding: '1.75rem',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(26,26,46,0.2)',
                }}>
                    <div style={{ position: 'absolute', top: '-40px', right: '-20px', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(246,176,1,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <Star size={14} color="#f6b001" fill="#f6b001" />
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{dateStr}</span>
                        </div>
                        <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, margin: '0 0 4px' }}>
                            {greeting}, {firstName}! 👋
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: 0 }}>
                            Bem-vindo ao seu painel de controle.
                        </p>
                    </div>
                </div>

                {onboarding && !onboarding.onboardingCompleto && (onboarding.percentual ?? 0) < 100 && (
                    <div style={{
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                        borderRadius: 16,
                        padding: '1.25rem 1.5rem',
                        marginBottom: '1.5rem',
                        color: '#fff',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '1rem',
                        justifyContent: 'space-between',
                    }}>
                        <div>
                            <strong style={{ fontSize: '1.05rem' }}>Complete a configuração inicial</strong>
                            <p style={{ margin: '0.35rem 0 0', opacity: 0.85, fontSize: '0.9rem' }}>
                                Progresso: {onboarding.percentual ?? 0}% — serviços, barbeiros e pagamentos
                            </p>
                        </div>
                        <Link
                            to="/onboarding"
                            style={{
                                background: '#f6b001',
                                color: '#1a1a2e',
                                padding: '10px 18px',
                                borderRadius: 10,
                                fontWeight: 700,
                                textDecoration: 'none',
                            }}
                        >
                            Continuar setup
                        </Link>
                    </div>
                )}

                {/* ── Stats Grid ── */}
                <div className="dash-stats-grid" style={{ marginBottom: '1.5rem' }}>
                    {stats.map(s => (
                        <NavLink key={s.link} to={s.link} className="stat-card">
                            <div className="stat-card-strip" style={{ background: s.color }} />
                            <div className="stat-card-icon" style={{ background: s.color + '18' }}>
                                {React.cloneElement(s.icon, { color: s.color })}
                            </div>
                            <p className="stat-card-label">{s.label}</p>
                            <div className="stat-card-value">
                                {loading ? <SkeletonValue /> : s.value}
                            </div>
                            <div className="stat-card-footer" style={{ color: s.color }}>
                                <span>Acessar</span>
                                <ArrowRight size={13} />
                            </div>
                        </NavLink>
                    ))}
                </div>

                {/* Pendentes para confirmar */}
                {userMaxPolicy >= 2 && (loadingPendentes || pendentes.length > 0) && (
                    <div className="panel-card" style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CalendarDays size={15} color="#854d0e" />
                                </div>
                                <h2 style={{ fontWeight: 800, fontSize: '0.975rem', color: '#111827', margin: 0 }}>
                                    Pendentes para confirmar
                                    {!loadingPendentes && pendentes.length > 0 && (
                                        <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '12px', background: '#fef9c3', color: '#854d0e', fontSize: '0.75rem' }}>{pendentes.length}</span>
                                    )}
                                </h2>
                            </div>
                            <NavLink to="/agendamentos" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Ver todos <ArrowRight size={13} />
                            </NavLink>
                        </div>
                        {loadingPendentes ? (
                            <div className="skeleton-box" style={{ height: '58px', borderRadius: '14px' }} />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {pendentes.slice(0, 5).map((ag, i) => (
                                    <div key={ag.id ?? ag.Id ?? i} className="ag-item">
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <strong style={{ display: 'block', fontSize: '0.85rem', color: '#111827' }}>
                                                {ag.nomeCliente ?? ag.NomeCliente ?? ag.descricao ?? ag.Descricao ?? 'Cliente'}
                                            </strong>
                                            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                                                {ag.servico ?? ag.Servico ?? ''}
                                                {(ag.dtAgendamento || ag.DtAgendamento) ? ` · ${new Date(ag.dtAgendamento || ag.DtAgendamento).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : ''}
                                            </span>
                                        </div>
                                        <StatusBadge status={0} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Bottom: Recentes + Quick Access ── */}
                <div className="dash-bottom-grid">

                    {/* Agendamentos Recentes */}
                    {userMaxPolicy >= 2 && (
                        <div className="panel-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CalendarDays size={15} color="#f6b001" />
                                </div>
                                <h2 style={{ fontWeight: 800, fontSize: '0.975rem', color: '#111827', margin: 0 }}>Recentes</h2>
                            </div>
                            <NavLink to="/agendamentos" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>
                                Ver todos <ArrowRight size={13} />
                            </NavLink>
                        </div>

                        {loadingRecent ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[1, 2, 3].map(i => <div key={i} className="skeleton-box" style={{ height: '58px', borderRadius: '14px' }} />)}
                            </div>
                        ) : recent.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#9ca3af' }}>
                                <CalendarDays size={36} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.4 }} />
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>Nenhum agendamento ainda</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {recent.map((ag, i) => (
                                    <div key={i} className="ag-item">
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <CalendarDays size={15} color="#f6b001" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <strong style={{ display: 'block', fontSize: '0.85rem', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {ag.nomeCliente || ag.NomeCliente || ag.cliente || ag.Cliente || 'Cliente'}
                                            </strong>
                                            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                                                {ag.nomeServico || ag.NomeServico || ag.servico || ''}
                                                {(ag.dataAgendamento || ag.DataAgendamento) ? ` · ${ag.dataAgendamento || ag.DataAgendamento}` : ''}
                                            </span>
                                        </div>
                                        <StatusBadge status={ag.status ?? ag.Status} />
                                    </div>
                                ))}
                            </div>
                        )}
                        </div>
                    )}

                    {/* Acesso Rápido */}
                    <div className="panel-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.1rem' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#f6b001,#e09800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BarChart3 size={15} color="#1a1a1a" />
                            </div>
                            <h2 style={{ fontWeight: 800, fontSize: '0.975rem', color: '#111827', margin: 0 }}>Acesso Rápido</h2>
                        </div>
                        <div className="dash-quick-grid">
                            {quickLinks.map(item => (
                                <NavLink key={item.to} to={item.to} className="quick-btn" style={{ background: item.color + '12', border: `1px solid ${item.color}22` }}>
                                    <div style={{ color: item.color, flexShrink: 0 }}>{item.icon}</div>
                                    <span style={{ fontWeight: 600, fontSize: '0.83rem', color: '#111827' }}>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>

                        {/* Mini dica */}
                        <div style={{ marginTop: '1.25rem', padding: '12px 14px', background: 'linear-gradient(135deg,rgba(246,176,1,0.08),rgba(246,176,1,0.04))', borderRadius: '14px', border: '1px solid rgba(246,176,1,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <TrendingUp size={16} color="#f6b001" style={{ flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.5 }}>
                                Use o menu lateral para navegar entre os módulos do sistema.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
