import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const css = `
.fm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fm-fade-in 0.2s ease;
}
@keyframes fm-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.fm-box {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22);
  animation: fm-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes fm-slide-up {
  from { opacity: 0; transform: translateY(30px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
.fm-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.fm-header::after {
  content: '';
  position: absolute;
  top: -30px; right: -20px;
  width: 130px; height: 130px;
  background: radial-gradient(circle, rgba(246,176,1,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.fm-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
}
.fm-header-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f6b001, #e09800);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(246,176,1,0.3);
  flex-shrink: 0;
}
.fm-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}
.fm-subtitle {
  color: rgba(255,255,255,0.5);
  font-size: 0.75rem;
  margin: 2px 0 0;
}
.fm-close {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.7);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}
.fm-close:hover {
  background: rgba(255,255,255,0.2);
  color: #fff;
}
.fm-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}
.fm-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
  background: #fafafa;
}
.fm-btn-cancel {
  flex: 1;
  padding: 0.7rem;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.fm-btn-cancel:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}
.fm-btn-save {
  flex: 1;
  padding: 0.7rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #f6b001, #e09800);
  color: #1a1a1a;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(246,176,1,0.3);
}
.fm-btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(246,176,1,0.4);
}
.fm-btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Form field styles */
.fm-field {
  margin-bottom: 1rem;
}
.fm-field:last-child { margin-bottom: 0; }
.fm-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.fm-label span.required {
  color: #ef4444;
  margin-left: 2px;
}
.fm-input,
.fm-select,
.fm-textarea {
  width: 100%;
  padding: 0.65rem 0.875rem;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  font-size: 0.9rem;
  color: #111827;
  background: #f9fafb;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}
.fm-input:focus,
.fm-select:focus,
.fm-textarea:focus {
  border-color: #f6b001;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(246,176,1,0.12);
}
.fm-textarea { resize: vertical; min-height: 80px; }
.fm-select { appearance: none; cursor: pointer; }
.fm-input-hint {
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 4px;
}
.fm-input-error {
  font-size: 0.72rem;
  color: #dc2626;
  margin-top: 4px;
  font-weight: 600;
}
.fm-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 480px) {
  .fm-row { grid-template-columns: 1fr; }
}
.fm-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 20px;
}
.fm-spinner {
  width: 32px; height: 32px;
  border: 3px solid #f3f4f6;
  border-top-color: #f6b001;
  border-radius: 50%;
@keyframes fm-spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .fm-overlay {
    padding: 0;
  }
  .fm-box {
    width: 100%;
    max-width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }
  .fm-header {
    border-radius: 0;
  }
}

`;

export function FormModal({
    open,
    onClose,
    title,
    subtitle,
    icon,
    onSave,
    saving = false,
    loading = false,
    saveLabel = 'Salvar',
    children,
}) {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (open) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [open, onClose]);

    if (!open) return null;

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    return (
        <>
            <style>{css}</style>
            <div className="fm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
                <div className="fm-box" style={{ position: 'relative' }}>
                    {loading && (
                        <div className="fm-loading-overlay">
                            <div className="fm-spinner" />
                        </div>
                    )}
                    <div className="fm-header">
                        <div className="fm-header-left">
                            {icon && (
                                <div className="fm-header-icon">
                                    {React.cloneElement(icon, { size: 18, color: '#1a1a1a' })}
                                </div>
                            )}
                            <div>
                                <h2 className="fm-title">{title}</h2>
                                {subtitle && <p className="fm-subtitle">{subtitle}</p>}
                            </div>
                        </div>
                        <button className="fm-close" onClick={onClose} disabled={saving}>
                            <X size={16} />
                        </button>
                    </div>
                    <div className="fm-body">{children}</div>
                    <div className="fm-footer">
                        <button className="fm-btn-cancel" onClick={onClose} disabled={saving}>
                            Cancelar
                        </button>
                        <button className="fm-btn-save" onClick={onSave} disabled={saving || loading}>
                            {saving ? 'Salvando...' : saveLabel}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* Helper sub-components for form fields */
export function FormField({ label, required, hint, error, children }) {
    return (
        <div className="fm-field">
            {label && (
                <label className="fm-label">
                    {label}{required && <span className="required">*</span>}
                </label>
            )}
            {children}
            {error && <div className="fm-input-error" role="alert">{error}</div>}
            {hint && !error && <div className="fm-input-hint">{hint}</div>}
        </div>
    );
}

export function FormRow({ children }) {
    return <div className="fm-row">{children}</div>;
}
