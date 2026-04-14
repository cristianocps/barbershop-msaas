import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

let toastIdCount = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = toastIdCount++;
        const newToast = { id, message, type };
        
        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
    };

    return (
        <ToastContext.Provider value={{ toasts, toast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context.toast;
};

// Hook interno usado pelo componente ToastContainer para renderizar os toasts
export const useToastState = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToastState must be used within a ToastProvider');
    }
    return { toasts: context.toasts, removeToast: context.removeToast };
};
