import React from 'react';
import { useToastState } from '../../contexts/ToastContext';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />
};

export function ToastContainer() {
    const { toasts, removeToast } = useToastState();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast-item toast-${toast.type}`}>
                    <div className="toast-icon">
                        {icons[toast.type] || icons.info}
                    </div>
                    <div className="toast-message">
                        {toast.message}
                    </div>
                    <button 
                        onClick={() => removeToast(toast.id)} 
                        className="toast-close"
                        aria-label="Cerrar notificação"
                    >
                        <X size={16} />
                    </button>
                    {/* Progress bar animada na base (opcional, requer css) */}
                    <div className="toast-progress"></div>
                </div>
            ))}
        </div>
    );
}
