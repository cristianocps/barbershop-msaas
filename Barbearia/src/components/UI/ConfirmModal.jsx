import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle, Trash2, ToggleLeft, X, CheckCircle } from 'lucide-react';

/* ══════════════════════════════════════════════
   COMPONENTE: ConfirmModal
   Props:
     open       — boolean
     title      — string
     message    — string
     type       — 'danger' | 'warning' | 'info'  (default: 'danger')
     confirmText — string  (default: 'Confirmar')
     cancelText  — string  (default: 'Cancelar')
     onConfirm  — fn
     onCancel   — fn
══════════════════════════════════════════════ */
export function ConfirmModal({
    open,
    title = 'Confirmar ação',
    message = 'Tem certeza que deseja continuar?',
    type = 'danger',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
}) {
    const confirmRef = useRef(null);

    // Foca o botão de cancelar ao abrir (segurança)
    useEffect(() => {
        if (open) {
            setTimeout(() => confirmRef.current?.focus(), 50);
        }
    }, [open]);

    // Fecha com ESC
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onCancel]);

    if (!open) return null;

    const palette = {
        danger:  { icon: <Trash2 size={22} />,       bg: '#fef2f2', border: '#fca5a5', iconBg: '#ef4444', btn: 'linear-gradient(135deg,#dc2626,#ef4444)', shadow: 'rgba(239,68,68,0.35)' },
        warning: { icon: <AlertTriangle size={22} />, bg: '#fffbeb', border: '#fcd34d', iconBg: '#f59e0b', btn: 'linear-gradient(135deg,#d97706,#f59e0b)', shadow: 'rgba(245,158,11,0.35)' },
        info:    { icon: <CheckCircle size={22} />,   bg: '#f0fdf4', border: '#86efac', iconBg: '#22c55e', btn: 'linear-gradient(135deg,#16a34a,#22c55e)', shadow: 'rgba(34,197,94,0.35)'  },
    };
    const p = palette[type] || palette.danger;

    return (
        <>
            <style>{`
                .cm-overlay {
                    position: fixed; inset: 0; z-index: 9999;
                    background: rgba(0,0,0,0.45);
                    backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 1rem;
                    animation: cm-fade-in 0.15s ease;
                }
                @keyframes cm-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                .cm-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 2rem;
                    max-width: 420px;
                    width: 100%;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.2);
                    animation: cm-slide-up 0.2s cubic-bezier(0.34,1.56,0.64,1);
                    font-family: 'Inter', sans-serif;
                }
                @keyframes cm-slide-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0)    scale(1);    }
                }
                .cm-icon-wrap {
                    width: 52px; height: 52px; border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; margin-bottom: 1.25rem;
                    flex-shrink: 0;
                }
                .cm-title {
                    font-size: 1.1rem; font-weight: 800;
                    color: #111; margin: 0 0 0.5rem;
                    letter-spacing: -0.3px;
                }
                .cm-message {
                    font-size: 0.9rem; color: #666;
                    line-height: 1.55; margin: 0 0 1.75rem;
                }
                .cm-actions {
                    display: flex; gap: 0.75rem;
                }
                .cm-btn {
                    flex: 1; padding: 0.78rem 1rem;
                    border-radius: 11px; border: none;
                    font-size: 0.9rem; font-weight: 700;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer; transition: all 0.2s;
                }
                .cm-btn-cancel {
                    background: #f5f5f5; color: #555;
                }
                .cm-btn-cancel:hover { background: #eee; color: #333; }
                .cm-btn-confirm {
                    color: #fff;
                }
                .cm-btn-confirm:hover { filter: brightness(1.1); transform: translateY(-1px); }
                .cm-btn-confirm:active { transform: translateY(0); }
            `}</style>

            <div className="cm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
                <div className="cm-card" role="alertdialog" aria-modal="true" aria-labelledby="cm-title">
                    <div className="cm-icon-wrap" style={{ background: p.iconBg }}>
                        {p.icon}
                    </div>
                    <p className="cm-title" id="cm-title">{title}</p>
                    <p className="cm-message">{message}</p>
                    <div className="cm-actions">
                        <button className="cm-btn cm-btn-cancel" onClick={onCancel}>
                            {cancelText}
                        </button>
                        <button
                            ref={confirmRef}
                            className="cm-btn cm-btn-confirm"
                            style={{ background: p.btn, boxShadow: `0 4px 16px ${p.shadow}` }}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ══════════════════════════════════════════════
   HOOK: useConfirm
   Uso:
     const { confirmModal, askConfirm } = useConfirm();
     
     // Para disparar:
     askConfirm({
       title: 'Excluir horário',
       message: 'Esta ação não pode ser desfeita.',
       type: 'danger',
       confirmText: 'Excluir',
       onConfirm: () => handleDelete(id),
     });
     
     // No JSX:
     {confirmModal}
══════════════════════════════════════════════ */
export function useConfirm() {
    const [state, setState] = useState({ open: false });

    const askConfirm = useCallback((opts) => {
        setState({ open: true, ...opts });
    }, []);

    const handleConfirm = useCallback(() => {
        setState(s => ({ ...s, open: false }));
        state.onConfirm?.();
    }, [state]);

    const handleCancel = useCallback(() => {
        setState(s => ({ ...s, open: false }));
        state.onCancel?.();
    }, [state]);

    const confirmModal = (
        <ConfirmModal
            open={state.open}
            title={state.title}
            message={state.message}
            type={state.type}
            confirmText={state.confirmText}
            cancelText={state.cancelText}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    );

    return { confirmModal, askConfirm };
}
