import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Settings, LogOut, Menu, X, Building2, Scissors, Star, CalendarClock, Landmark, DollarSign, Smartphone, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserMaxPolicy, isPlataformaStaff, isClienteUser, POLICY_LEVELS } from '../../utils/userPolicy';
import { AUTH_ACCOUNT_TYPE_KEY } from '../../utils/authToken';

const navGroups = [
    {
        label: 'Principal',
        items: [
            { path: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', exact: true, minPolicy: 'consulta' },
            { path: '/agendamentos', icon: <CalendarDays size={18} />, label: 'Agendamentos', minPolicy: 'consulta' },
            { path: '/financeiro', icon: <DollarSign size={18} />, label: 'Financeiro', minPolicy: 'gerente' },
        ]
    },
    {
        label: 'Cadastros',
        items: [
            { path: '/clientes', icon: <Users size={18} />, label: 'Clientes', minPolicy: 'consulta' },
            { path: '/usuarios', icon: <Users size={18} />, label: 'Usuários', minPolicy: 'admin' },
            { path: '/profissionais', icon: <Star size={18} />, label: 'Profissionais', minPolicy: 'consulta' },
            { path: '/horarios', icon: <CalendarClock size={18} />, label: 'Horários', minPolicy: 'consulta' },
            { path: '/minha-barbearia', icon: <Building2 size={18} />, label: 'Minha barbearia', minPolicy: 'profissional' },
            { path: '/empresas', icon: <Building2 size={18} />, label: 'Barbearias', minPolicy: 'admin' },
            { path: '/servicos', icon: <Scissors size={18} />, label: 'Serviços', minPolicy: 'consulta' },
        ]
    },
    {
        label: 'Configurações',
        items: [
            { path: '/configuracoes/dados-bancarios', icon: <Landmark size={18} />, label: 'Dados Bancários', minPolicy: 'profissional' },
            { path: '/configuracoes/infinite-pay', icon: <Smartphone size={18} />, label: 'Infinite Pay', minPolicy: 'gerente' },
            { path: '/assinatura', icon: <DollarSign size={18} />, label: 'Assinatura', minPolicy: 'gerente' },
        ]
    },
];

const platformNavGroups = [
    {
        label: 'Plataforma',
        items: [
            { path: '/plataforma/financeiro', icon: <Shield size={18} />, label: 'Assinaturas', exact: false },
        ],
    },
];

const essentialWhenBlocked = [
    { path: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', exact: true },
    { path: '/minha-barbearia', icon: <Building2 size={18} />, label: 'Minha barbearia' },
    { path: '/assinatura', icon: <DollarSign size={18} />, label: 'Assinatura / Pagamento' },
];

function filterItemsByPolicy(items, userMaxPolicy) {
    return items.filter((item) => {
        if (!item.minPolicy) return true;
        const req = POLICY_LEVELS[item.minPolicy.toLowerCase()] || 0;
        return userMaxPolicy >= req;
    });
}

function renderNavGroup(group, filteredItems, close) {
    if (filteredItems.length === 0) return null;
    return (
        <div key={group.label} style={{ marginBottom: '0.75rem' }}>
            <div style={{ padding: '0.5rem 1rem 0.35rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)' }}>
                {group.label}
            </div>
            {filteredItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={close}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </div>
    );
}

export function Sidebar({ bloqueado = false }) {
    const { logout, user, empresa } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const staffPlataforma = isPlataformaStaff(user);
    const accountType = user?.accountType || localStorage.getItem(AUTH_ACCOUNT_TYPE_KEY);
    const isBarbeariaAccount = accountType === 'barbearia' || (!staffPlataforma && !isClienteUser(user) && !!user?.email);
    const groupsToRender = staffPlataforma ? platformNavGroups : navGroups;

    const close = () => setIsOpen(false);

    const userMaxPolicy = getUserMaxPolicy(user) || (isBarbeariaAccount ? POLICY_LEVELS.profissional : 0);

    const roleLabel = (() => {
        if (!user?.roles?.length) return isBarbeariaAccount ? 'Profissional' : 'Usuário';
        let topRole = '';
        let topLevel = 0;
        user.roles.forEach((role) => {
            const norm = role.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const level = POLICY_LEVELS[norm] || 0;
            if (level >= topLevel) { topLevel = level; topRole = role; }
        });
        return topRole
            ? topRole.charAt(0).toUpperCase() + topRole.slice(1).toLowerCase()
            : 'Usuário';
    })();

    const barbeariaNav = groupsToRender
        .map((group) => renderNavGroup(group, filterItemsByPolicy(group.items, userMaxPolicy), close))
        .filter(Boolean);

    return (
        <>
            <button className="mobile-toggle" onClick={() => setIsOpen(true)} aria-label="Abrir Menu">
                <Menu size={22} />
            </button>

            {isOpen && <div className="sidebar-overlay" onClick={close} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <button className="mobile-close" onClick={close} aria-label="Fechar">
                    <X size={20} />
                </button>

                <div className="sidebar-logo">
                    <div className="header-logo-placeholder" style={{ borderRadius: '12px', fontSize: '1.3rem', overflow: 'hidden', padding: 0 }}>
                        {staffPlataforma ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                                <Shield size={22} />
                            </span>
                        ) : empresa?.logoData ? (
                            <img
                                src={empresa.logoData}
                                alt="Logo"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>✂</span>
                        )}
                    </div>
                    <div className="sidebar-title">
                        <h4>{staffPlataforma ? 'BarberShop' : 'Admin Panel'}</h4>
                        <p>{staffPlataforma ? 'Administração da plataforma' : (empresa?.descricao || localStorage.getItem('empresa_nome') || 'Barbearia MVP')}</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {bloqueado && isBarbeariaAccount ? (
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ padding: '0.5rem 1rem 0.35rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)' }}>
                                Acesso
                            </div>
                            {essentialWhenBlocked.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.exact}
                                    onClick={close}
                                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ) : isBarbeariaAccount ? (
                        barbeariaNav.length > 0 ? barbeariaNav : (
                            <div style={{ marginBottom: '0.75rem' }}>
                                {essentialWhenBlocked.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.exact}
                                        onClick={close}
                                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        )
                    ) : (
                        groupsToRender.map((group) => renderNavGroup(group, filterItemsByPolicy(group.items, userMaxPolicy), close)).filter(Boolean)
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-mini-profile">
                        <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                        <div className="user-info">
                            <strong>{user?.name || 'Administrador'}</strong>
                            <span>{roleLabel}</span>
                        </div>
                    </div>
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={18} />
                        <span>Sair</span>
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
                        versão app 1.1.0
                    </div>
                </div>
            </aside>
        </>
    );
}
