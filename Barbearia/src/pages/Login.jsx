import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Scissors, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [focused, setFocused] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(email, password);
        setLoading(false);
        if (success) navigate('/');
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

                .login-root * { box-sizing: border-box; }

                .login-root {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'Inter', sans-serif;
                    background: #fff;
                    overflow: hidden; /* evita scrollbar global */
                }

                /* ══════════════════════════
                   PAINEL ESQUERDO — navy + gold
                ══════════════════════════ */
                .login-left {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;

                    /* Mesmo tom navy do sidebar do sistema */
                    background: linear-gradient(160deg, #0d1526 0%, #152040 45%, #1a2a52 100%);
                }

                /* Brilhos dourados — mesma cor do dourado do sistema */
                .login-left-glow {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse at 20% 30%, rgba(212,175,55,0.18) 0%, transparent 55%),
                        radial-gradient(ellipse at 85% 80%, rgba(212,175,55,0.10) 0%, transparent 50%),
                        radial-gradient(ellipse at 60% 10%, rgba(255,255,255,0.04) 0%, transparent 40%);
                    pointer-events: none;
                }

                /* Círculos decorativos — tons dourados */
                .login-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(70px);
                    opacity: 0.22;
                    animation: orb-float 9s ease-in-out infinite;
                    pointer-events: none;
                }
                .login-orb-1 {
                    width: 350px; height: 350px;
                    background: radial-gradient(circle, #d4af37, #b8962a);
                    top: -100px; left: -80px;
                    animation-delay: 0s;
                }
                .login-orb-2 {
                    width: 280px; height: 280px;
                    background: radial-gradient(circle, #f0c040, #d4af37);
                    bottom: -80px; right: -50px;
                    animation-delay: -4s;
                }
                .login-orb-3 {
                    width: 200px; height: 200px;
                    background: radial-gradient(circle, #d4af37, #8b6914);
                    top: 45%; left: 65%;
                    animation-delay: -7s;
                }

                @keyframes orb-float {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-22px); }
                }

                /* Tesouras decorativas no fundo */
                .login-sc-bg {
                    position: absolute;
                    color: rgba(212,175,55,0.07);
                    pointer-events: none;
                }
                .sc-1 { top: 8%;  right: 12%; transform: rotate(25deg);  }
                .sc-2 { bottom: 15%; left: 8%;  transform: rotate(-40deg); }
                .sc-3 { top: 52%; right: 4%;  transform: rotate(15deg); opacity: 0.04; }

                .login-left-content {
                    position: relative;
                    z-index: 2;
                    text-align: center;
                    color: #fff;
                }

                .login-brand-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(212,175,55,0.12);
                    border: 1px solid rgba(212,175,55,0.3);
                    border-radius: 100px;
                    padding: 5px 16px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 1.2px;
                    text-transform: uppercase;
                    color: #d4af37;
                    margin-bottom: 1.75rem;
                }

                .login-brand-icon {
                    width: 84px;
                    height: 84px;
                    background: linear-gradient(135deg, #d4af37, #f0c040, #e8c44a);
                    border-radius: 26px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.75rem;
                    box-shadow:
                        0 0 0 10px rgba(212,175,55,0.12),
                        0 20px 55px rgba(212,175,55,0.35);
                    animation: icon-pulse 3s ease-in-out infinite;
                }

                @keyframes icon-pulse {
                    0%, 100% { box-shadow: 0 0 0 10px rgba(212,175,55,0.12), 0 20px 55px rgba(212,175,55,0.35); }
                    50%       { box-shadow: 0 0 0 18px rgba(212,175,55,0.08), 0 25px 75px rgba(212,175,55,0.5); }
                }

                .login-brand-title {
                    font-size: 2.6rem;
                    font-weight: 900;
                    letter-spacing: -1.2px;
                    line-height: 1;
                    margin-bottom: 0.7rem;
                    color: #fff;
                }
                .login-brand-title span {
                    background: linear-gradient(135deg, #d4af37, #f5d76e);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .login-brand-sub {
                    color: rgba(255,255,255,0.45);
                    font-size: 0.95rem;
                    margin-bottom: 3rem;
                }

                .login-features {
                    display: flex;
                    flex-direction: column;
                    gap: 0.7rem;
                    text-align: left;
                }

                .login-feature-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: rgba(255,255,255,0.7);
                    font-size: 0.875rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    padding: 0.6rem 1rem;
                    transition: background 0.2s, border-color 0.2s;
                }
                .login-feature-item:hover {
                    background: rgba(212,175,55,0.08);
                    border-color: rgba(212,175,55,0.2);
                    color: rgba(255,255,255,0.9);
                }

                .login-feature-dot {
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: #d4af37;
                    flex-shrink: 0;
                    box-shadow: 0 0 6px rgba(212,175,55,0.7);
                }

                /* ══════════════════════════
                   PAINEL DIREITO — formulário
                ══════════════════════════ */
                .login-right {
                    width: 460px;
                    min-width: 460px;
                    background: #fff;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 3.25rem;
                    border-left: 1px solid #f0f0f0;
                }

                .login-form-header { width: 100%; margin-bottom: 2.25rem; }

                .login-form-header h2 {
                    font-size: 1.85rem;
                    font-weight: 800;
                    color: #0d1526;
                    margin-bottom: 0.35rem;
                    letter-spacing: -0.5px;
                }
                .login-form-header p { color: #999; font-size: 0.9rem; }

                .login-field { width: 100%; margin-bottom: 1.2rem; }

                .login-field label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #555;
                    margin-bottom: 0.45rem;
                    text-transform: uppercase;
                    letter-spacing: 0.7px;
                }

                .login-input-wrap { position: relative; }

                .login-input-icon {
                    position: absolute;
                    left: 13px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #ccc;
                    transition: color 0.2s;
                    pointer-events: none;
                }
                .login-input-wrap.focused .login-input-icon { color: #d4af37; }

                .login-input {
                    width: 100%;
                    padding: 0.82rem 1rem 0.82rem 2.65rem;
                    border: 1.5px solid #e8e8e8;
                    border-radius: 11px;
                    font-size: 0.94rem;
                    font-family: 'Inter', sans-serif;
                    background: #fafafa;
                    color: #111;
                    transition: all 0.2s;
                    outline: none;
                }
                .login-input:focus {
                    border-color: #d4af37;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(212,175,55,0.12);
                }
                .login-input::placeholder { color: #d0d0d0; }

                .login-eye-btn {
                    position: absolute;
                    right: 11px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #bbb;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    transition: color 0.2s;
                }
                .login-eye-btn:hover { color: #d4af37; }

                .login-submit {
                    width: 100%;
                    padding: 0.92rem;
                    /* Dourado = cor do sistema */
                    background: linear-gradient(135deg, #c8a020, #d4af37, #e8c44a);
                    border: none;
                    border-radius: 11px;
                    font-size: 0.97rem;
                    font-weight: 700;
                    font-family: 'Inter', sans-serif;
                    color: #1a1a1a;
                    cursor: pointer;
                    margin-top: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: all 0.25s;
                    box-shadow: 0 4px 20px rgba(212,175,55,0.45);
                    letter-spacing: 0.2px;
                }
                .login-submit:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 28px rgba(212,175,55,0.55);
                }
                .login-submit:active:not(:disabled) { transform: translateY(0); }
                .login-submit:disabled { opacity: 0.65; cursor: not-allowed; }

                .login-submit-spinner {
                    width: 17px; height: 17px;
                    border: 2px solid rgba(0,0,0,0.2);
                    border-top-color: #1a1a1a;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .login-footer {
                    margin-top: 2rem;
                    color: #ccc;
                    font-size: 0.76rem;
                    text-align: center;
                }

                /* ══════════════════════════
                   MOBILE
                ══════════════════════════ */
                @media (max-width: 768px) {
                    .login-root {
                        background: linear-gradient(160deg, #0d1526 0%, #152040 45%, #1a2a52 100%);
                        align-items: center;
                        justify-content: center;
                        padding: 1.5rem;
                    }

                    .login-left { display: none; }

                    .login-right {
                        width: 100%;
                        min-width: unset;
                        max-width: 420px;
                        padding: 2.25rem 1.75rem;
                        border-radius: 22px;
                        border: none;
                        /* Glass sobre o fundo navy */
                        background: rgba(255, 255, 255, 0.94);
                        backdrop-filter: blur(24px);
                        -webkit-backdrop-filter: blur(24px);
                        box-shadow:
                            0 12px 50px rgba(0,0,0,0.4),
                            0 0 0 1px rgba(212,175,55,0.15);
                    }
                }
            `}</style>

            <div className="login-root">

                {/* ── Painel Esquerdo ── */}
                <div className="login-left">
                    <div className="login-left-glow" />
                    <div className="login-orb login-orb-1" />
                    <div className="login-orb login-orb-2" />
                    <div className="login-orb login-orb-3" />

                    <div className="login-sc-bg sc-1"><Scissors size={110} /></div>
                    <div className="login-sc-bg sc-2"><Scissors size={100} /></div>
                    <div className="login-sc-bg sc-3"><Scissors size={75} /></div>

                    <div className="login-left-content">
                        <div className="login-brand-badge">
                            <Scissors size={10} /> Sistema Premium
                        </div>

                        <div className="login-brand-icon">
                            <Scissors size={36} color="#1a1a1a" strokeWidth={2.5} />
                        </div>

                        <div className="login-brand-title">
                            Barber<span>Pro</span>
                        </div>
                        <div className="login-brand-sub">Sistema de Gestão para Barbearias</div>

                        <div className="login-features">
                            {[
                                'Agendamentos em tempo real',
                                'Gestão de profissionais',
                                'Vitrine pública de agendamento',
                                'Controle financeiro completo',
                            ].map((f) => (
                                <div className="login-feature-item" key={f}>
                                    <span className="login-feature-dot" />{f}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Painel Direito ── */}
                <div className="login-right">
                    <div className="login-form-header">
                        <h2>Bem-vindo de volta 👋</h2>
                        <p>Faça login para acessar o painel de gestão</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <div className="login-field">
                            <label>E-mail</label>
                            <div className={`login-input-wrap ${focused === 'email' ? 'focused' : ''}`}>
                                <Mail className="login-input-icon" size={15} />
                                <input
                                    id="login-email"
                                    type="email"
                                    className="login-input"
                                    placeholder="admin@barbearia.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused('')}
                                    required autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label>Senha</label>
                            <div className={`login-input-wrap ${focused === 'pass' ? 'focused' : ''}`}>
                                <Lock className="login-input-icon" size={15} />
                                <input
                                    id="login-password"
                                    type={showPass ? 'text' : 'password'}
                                    className="login-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocused('pass')}
                                    onBlur={() => setFocused('')}
                                    required autoComplete="current-password"
                                    style={{ paddingRight: '2.65rem' }}
                                />
                                <button
                                    type="button" className="login-eye-btn"
                                    onClick={() => setShowPass(!showPass)}
                                    tabIndex={-1}
                                    aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                                >
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button id="login-submit" type="submit" className="login-submit" disabled={loading}>
                            {loading
                                ? <><span className="login-submit-spinner" /> Entrando...</>
                                : <>Entrar no Painel <ArrowRight size={17} /></>
                            }
                        </button>
                    </form>

                    {/* Link de agendamento público desabilitado temporariamente
                    <a href="/agendar" id="link-agendamento-publico">
                        Ir para Agendamento Público
                    </a>
                    */}

                    <div className="login-footer">
                        &copy; {new Date().getFullYear()} BarberPro · Todos os direitos reservados
                    </div>
                </div>
            </div>
        </>
    );
}
