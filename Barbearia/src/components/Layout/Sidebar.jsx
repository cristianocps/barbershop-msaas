import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Settings, LogOut, Menu, X, Building2, Scissors, Star, CalendarClock, Landmark, DollarSign, Smartphone, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserMaxPolicy, isPlataformaStaff } from '../../utils/userPolicy';

const PolicyLevels = {
    'consulta': 1,
    'usuario': 2,
    'profissional': 3,
    'gerente': 4,
    'admin': 5,
    'desenvolvedor': 6
};

const navGroups = [
    {
        label: 'Principal',
        items: [
            { path: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard', exact: true, minPolicy: 'usuario' },
            { path: '/agendamentos', icon: <CalendarDays size={18} />, label: 'Agendamentos', minPolicy: 'usuario' },
            { path: '/financeiro', icon: <DollarSign size={18} />, label: 'Financeiro', minPolicy: 'gerente' },
        ]
    },
    {
        label: 'Cadastros',
        items: [
            { path: '/clientes', icon: <Users size={18} />, label: 'Clientes', minPolicy: 'usuario' },
            { path: '/usuarios', icon: <Users size={18} />, label: 'Usuários', minPolicy: 'admin' },
            { path: '/profissionais', icon: <Star size={18} />, label: 'Profissionais', minPolicy: 'profissional' },
            { path: '/horarios', icon: <CalendarClock size={18} />, label: 'Horários', minPolicy: 'profissional' },
            { path: '/empresas', icon: <Building2 size={18} />, label: 'Barbearias', minPolicy: 'profissional' },
            { path: '/servicos', icon: <Scissors size={18} />, label: 'Serviços', minPolicy: 'profissional' },
        ]
    },
    {
        label: 'Configurações',
        items: [
            { path: '/configuracoes/dados-bancarios', icon: <Landmark size={18} />, label: 'Dados Bancários', minPolicy: 'admin' },
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

const assinaturaNavItem = {
    path: '/assinatura',
    icon: <DollarSign size={18} />,
    label: 'Assinatura / Pagamento',
    exact: false,
    minPolicy: 'gerente',
};

export function Sidebar({ bloqueado = false }) {
    const { logout, user, empresa } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const staffPlataforma = isPlataformaStaff(user);
    const groupsToRender = staffPlataforma ? platformNavGroups : navGroups;

    const close = () => setIsOpen(false);

    // Pega a role de maior nível do usuário logado e formata o label
    const roleLabel = (() => {
        if (!user?.roles || user.roles.length === 0) return 'Usuário';
        let topRole = '';
        let topLevel = 0;
        user.roles.forEach(role => {
            const norm = role.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const level = PolicyLevels[norm] || 0;
            if (level >= topLevel) { topLevel = level; topRole = role; }
        });
        // Primeira letra maiúscula, resto minúsculo
        return topRole
            ? topRole.charAt(0).toUpperCase() + topRole.slice(1).toLowerCase()
            : 'Usuário';
    })();

    return (
        <>
            {/* FAB Toggle Mobile */}
            <button className="mobile-toggle" onClick={() => setIsOpen(true)} aria-label="Abrir Menu">
                <Menu size={22} />
            </button>

            {/* Overlay Mobile */}
            {isOpen && <div className="sidebar-overlay" onClick={close} />}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <button className="mobile-close" onClick={close} aria-label="Fechar">
                    <X size={20} />
                </button>

                {/* Brand */}
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

                {/* Nav */}
                <nav className="sidebar-nav">
                    {bloqueado ? (
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ padding: '0.5rem 1rem 0.35rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)' }}>
                                Pagamento
                            </div>
                            <NavLink
                                to={assinaturaNavItem.path}
                                onClick={close}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                {assinaturaNavItem.icon}
                                <span>{assinaturaNavItem.label}</span>
                            </NavLink>
                        </div>
                    ) : groupsToRender.map((group) => {
                        const userMaxPolicy = getUserMaxPolicy(user);

                        const filteredItems = group.items.filter(item => {
                            if (!item.minPolicy) return true; // sem regra exigida, qualquer um ve
                            const reqPolicyLevel = PolicyLevels[item.minPolicy.toLowerCase()] || 0;
                            return userMaxPolicy >= reqPolicyLevel;
                        });

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
                    })}
                </nav>

                {/* Footer */}
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
