import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Lock, X } from 'lucide-react';

export function PasswordPromptModal({
    open,
    title = 'Autenticação necessária',
    message = 'Informe seu PIN ou senha de confirmação para continuar.',
    confirmText = 'Descriptografar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    loading = false
}) {
    const inputRef = useRef(null);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (open) {
            setPassword('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (e.key === 'Escape') onCancel?.();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password.trim()) return;
        onConfirm?.(password);
    };

    return (
        <>
            <style>{`
                .pm-overlay {
                    position: fixed; inset: 0; z-index: 9999;
                    background: rgba(0,0,0,0.45);
                    backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 1rem;
                    animation: pm-fade-in 0.15s ease;
                }
                @keyframes pm-fade-in { from { opacity: 0; } to { opacity: 1; } }
                .pm-card {
                    background: #fff; border-radius: 20px; padding: 2rem;
                    max-width: 420px; width: 100%;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.2);
                    animation: pm-slide-up 0.2s cubic-bezier(0.34,1.56,0.64,1);
                    font-family: 'Inter', sans-serif;
                }
                @keyframes pm-slide-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .pm-icon-wrap {
                    width: 52px; height: 52px; border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    background: #f3f4f6; color: #4b5563; margin-bottom: 1.25rem; flex-shrink: 0;
                }
                .pm-title {
                    font-size: 1.1rem; font-weight: 800; color: #111; margin: 0 0 0.5rem; letter-spacing: -0.3px;
                }
                .pm-message { font-size: 0.9rem; color: #666; line-height: 1.55; margin: 0 0 1.25rem; }
                .pm-input-wrap { margin-bottom: 1.75rem; }
                .pm-input {
                    width: 100%; padding: 0.85rem 1rem;
                    border: 1.5px solid #e5e7eb; border-radius: 10px;
                    font-size: 1rem; color: #111; outline: none; transition: border-color 0.2s;
                }
                .pm-input:focus { border-color: #f6b001; }
                .pm-actions { display: flex; gap: 0.75rem; }
                .pm-btn {
                    flex: 1; padding: 0.78rem 1rem; border-radius: 11px; border: none;
                    font-size: 0.9rem; font-weight: 700; font-family: 'Inter', sans-serif;
                    cursor: pointer; transition: all 0.2s;
                }
                .pm-btn-cancel { background: #f5f5f5; color: #555; }
                .pm-btn-cancel:hover { background: #eee; color: #333; }
                .pm-btn-submit {
                    background: linear-gradient(135deg,#f6b001,#e09800); color: #111;
                }
                .pm-btn-submit:hover:not(:disabled) { filter: brightness(1.05); }
                .pm-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
            <div className="pm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
                <form className="pm-card" onSubmit={handleSubmit}>
                    <div className="pm-icon-wrap">
                        <Lock size={22} />
                    </div>
                    <p className="pm-title">{title}</p>
                    <p className="pm-message">{message}</p>
                    
                    <div className="pm-input-wrap">
                        <input
                            ref={inputRef}
                            type="password"
                            className="pm-input"
                            placeholder="*************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="pm-actions">
                        <button type="button" className="pm-btn pm-btn-cancel" onClick={onCancel} disabled={loading}>
                            {cancelText}
                        </button>
                        <button type="submit" className="pm-btn pm-btn-submit" disabled={!password.trim() || loading}>
                            {loading ? 'Processando...' : confirmText}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export function usePasswordPrompt() {
    const [state, setState] = useState({ open: false });

    const askPassword = useCallback((opts) => {
        setState({ open: true, ...opts });
    }, []);

    const handleCancel = useCallback(() => {
        setState((s) => ({ ...s, open: false }));
        state.onCancel?.();
    }, [state]);

    const handleConfirm = useCallback((password) => {
        setState((s) => ({ ...s, open: false }));
        if (state.onConfirm) state.onConfirm(password);
    }, [state]);

    const passwordModal = (
        <PasswordPromptModal
            open={state.open}
            title={state.title}
            message={state.message}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { passwordModal, askPassword };
}
