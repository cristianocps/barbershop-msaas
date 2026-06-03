import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff, User, Phone, X, ChevronLeft } from 'lucide-react';
import { GoogleLoginButton } from './GoogleLoginButton';

export function LoginModal({ onSuccess, onClose }) {
    const { login, registrar, loginGoogle } = useAuth();
    const toast = useToast();

    // Fluxo: 'login' | 'register' | 'complete-profile'
    const [mode, setMode] = useState('login');
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [googlePendingToken, setGooglePendingToken] = useState(null);

    const resetForm = () => {
        setNome('');
        setTelefone('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setShowPass(false);
        setGooglePendingToken(null);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (mode === 'register') {
            if (password !== confirmPassword) {
                toast.error('As senhas não coincidem!');
                setLoading(false);
                return;
            }
            if (nome.trim().length < 2) {
                toast.error('Informe seu nome.');
                setLoading(false);
                return;
            }
            const result = await registrar({
                email,
                password,
                confirmPassword,
                tipoCadastro: 'Cliente',
                nome: nome.trim(),
                telefone: telefone.trim() || undefined,
            });
            setLoading(false);
            if (result?.success) {
                toast.success('Cadastro realizado com sucesso!');
                onSuccess?.();
            }
        } else {
            const result = await login(email, password);
            setLoading(false);
            if (result?.success) {
                toast.success('Login realizado com sucesso!');
                onSuccess?.();
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const idToken = credentialResponse?.credential;
        if (!idToken) return;

        setLoading(true);
        const result = await loginGoogle({ idToken });

        if (result?.requiresTipoCadastro) {
            // Precisamos completar o perfil (nome/telefone)
            setGooglePendingToken(idToken);
            setLoading(false);
            setMode('complete-profile');
            return;
        }

        setLoading(false);
        if (result?.success) {
            toast.success('Login com Google concluído!');
            onSuccess?.();
        }
    };

    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        if (!googlePendingToken) return;

        if (nome.trim().length < 2) {
            toast.error('Informe seu nome.');
            return;
        }

        setLoading(true);
        const result = await loginGoogle({
            idToken: googlePendingToken,
            tipoCadastro: 'Cliente',
            nome: nome.trim(),
            telefone: telefone.trim() || undefined,
        });
        setLoading(false);

        if (result?.success) {
            toast.success('Conta criada com sucesso!');
            onSuccess?.();
        }
    };

    const isCompleteProfile = mode === 'complete-profile';
    const isRegister = mode === 'register';

    return (
        <>
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
            }} onClick={onClose}>
                <div style={{
                    background: '#fff',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '420px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '2rem',
                    position: 'relative',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                }} onClick={(e) => e.stopPropagation()}>
                    {/* Botão fechar */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#9ca3af',
                            padding: '4px',
                        }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #0d1526, #1a2a52)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                        }}>
                            <User size={24} color="#d4af37" />
                        </div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0d1526', marginBottom: '0.25rem' }}>
                            {isCompleteProfile
                                ? 'Complete seu cadastro'
                                : isRegister
                                    ? 'Crie sua conta'
                                    : 'Faça seu login'}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                            {isCompleteProfile
                                ? 'Informe seus dados para finalizar o cadastro com Google'
                                : isRegister
                                    ? 'Cadastre-se para finalizar seu agendamento'
                                    : 'Entre para confirmar seu agendamento'}
                        </p>
                    </div>

                    {isCompleteProfile ? (
                        /* ── Passo: Completar perfil (após Google) ── */
                        <form onSubmit={handleCompleteProfile}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Nome *</label>
                                <div style={inputWrapStyle}>
                                    <User size={15} style={iconStyle} />
                                    <input
                                        type="text"
                                        placeholder="Seu nome completo"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Telefone</label>
                                <div style={inputWrapStyle}>
                                    <Phone size={15} style={iconStyle} />
                                    <input
                                        type="tel"
                                        placeholder="(11) 99999-9999"
                                        value={telefone}
                                        onChange={(e) => setTelefone(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={submitBtnStyle(loading)}
                            >
                                {loading ? (
                                    <span>Processando...</span>
                                ) : (
                                    <>
                                        Finalizar Cadastro
                                        <ArrowRight size={17} />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                style={{
                                    width: '100%',
                                    marginTop: '0.75rem',
                                    padding: '0.6rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#6b7280',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                }}
                            >
                                <ChevronLeft size={16} />
                                Voltar
                            </button>
                        </form>
                    ) : (
                        /* ── Passo: Login / Register ── */
                        <>
                            <form onSubmit={handleSubmit}>
                                {isRegister && (
                                    <>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={labelStyle}>Nome *</label>
                                            <div style={inputWrapStyle}>
                                                <User size={15} style={iconStyle} />
                                                <input
                                                    type="text"
                                                    placeholder="Seu nome completo"
                                                    value={nome}
                                                    onChange={(e) => setNome(e.target.value)}
                                                    style={inputStyle}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={labelStyle}>Telefone</label>
                                            <div style={inputWrapStyle}>
                                                <Phone size={15} style={iconStyle} />
                                                <input
                                                    type="tel"
                                                    placeholder="(11) 99999-9999"
                                                    value={telefone}
                                                    onChange={(e) => setTelefone(e.target.value)}
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>E-mail</label>
                                    <div style={inputWrapStyle}>
                                        <Mail size={15} style={iconStyle} />
                                        <input
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            style={inputStyle}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={labelStyle}>Senha</label>
                                    <div style={inputWrapStyle}>
                                        <Lock size={15} style={iconStyle} />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            style={{ ...inputStyle, paddingRight: '2.5rem' }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            style={eyeBtnStyle}
                                        >
                                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {isRegister && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={labelStyle}>Confirmar Senha</label>
                                        <div style={inputWrapStyle}>
                                            <Lock size={15} style={iconStyle} />
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                style={inputStyle}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={submitBtnStyle(loading)}
                                >
                                    {loading ? (
                                        <span>Processando...</span>
                                    ) : (
                                        <>
                                            {isRegister ? 'Cadastrar e Continuar' : 'Entrar e Continuar'}
                                            <ArrowRight size={17} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                                <span style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                                ou
                                <span style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                            </div>

                            <GoogleLoginButton
                                disabled={loading}
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Falha no login com Google.')}
                            />

                            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                                {isRegister ? (
                                    <p style={{ color: '#666' }}>
                                        Já tem uma conta?{' '}
                                        <button
                                            type="button"
                                            onClick={() => switchMode('login')}
                                            style={linkStyle}
                                        >
                                            Fazer Login
                                        </button>
                                    </p>
                                ) : (
                                    <p style={{ color: '#666' }}>
                                        Ainda não tem cadastro?{' '}
                                        <button
                                            type="button"
                                            onClick={() => switchMode('register')}
                                            style={linkStyle}
                                        >
                                            Cadastre-se aqui
                                        </button>
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#555',
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
};

const inputWrapStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
};

const iconStyle = {
    position: 'absolute',
    left: '12px',
    color: '#bbb',
    pointerEvents: 'none',
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.4rem',
    border: '1.5px solid #e8e8e8',
    borderRadius: '10px',
    fontSize: '0.92rem',
    background: '#fafafa',
    color: '#111',
    outline: 'none',
    transition: 'border-color 0.2s',
};

const eyeBtnStyle = {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#bbb',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
};

const linkStyle = {
    background: 'none',
    border: 'none',
    color: '#d4af37',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: 0,
};

function submitBtnStyle(loading) {
    return {
        width: '100%',
        padding: '0.85rem',
        background: 'linear-gradient(135deg, #c8a020, #d4af37, #e8c44a)',
        border: 'none',
        borderRadius: '12px',
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#1a1a1a',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        opacity: loading ? 0.65 : 1,
    };
}
