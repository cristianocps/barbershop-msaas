import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Calendar, User, LogOut, Scissors } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ClienteLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <header style={{
                background: 'linear-gradient(135deg, #0d1526 0%, #1a2a52 100%)',
                color: '#fff',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Scissors size={22} color="#d4af37" />
                    <strong>BarberPro · Área do Cliente</strong>
                </div>
                <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <NavLink
                        to="/cliente/agendamentos"
                        style={({ isActive }) => ({
                            color: isActive ? '#d4af37' : '#fff',
                            textDecoration: 'none',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        })}
                    >
                        <Calendar size={16} /> Meus agendamentos
                    </NavLink>
                    <NavLink
                        to="/cliente/perfil"
                        style={({ isActive }) => ({
                            color: isActive ? '#d4af37' : '#fff',
                            textDecoration: 'none',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        })}
                    >
                        <User size={16} /> Perfil
                    </NavLink>
                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <LogOut size={14} /> Sair
                    </button>
                </nav>
            </header>
            <main style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>Olá, {user?.name || user?.email}</p>
                <Outlet />
            </main>
        </div>
    );
}
