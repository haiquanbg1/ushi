'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

let globalId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((toast) => {
        const id = ++globalId;
        const duration = toast.duration ?? 3000;

        setToasts((prev) => [
            ...prev,
            {
                id,
                type: toast.type || 'info',
                title: toast.title || '',
                message: toast.message || '',
                duration,
            },
        ]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const value = {
        show: showToast,
        success: (message, options = {}) =>
            showToast({ type: 'success', message, ...options }),
        error: (message, options = {}) =>
            showToast({ type: 'error', message, ...options }),
        info: (message, options = {}) =>
            showToast({ type: 'info', message, ...options }),
        warning: (message, options = {}) =>
            showToast({ type: 'warning', message, ...options }),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast container */}
            <div className="pointer-events-none fixed inset-x-0 top-3 z-[9999] flex flex-col items-center gap-2 px-2 sm:items-end sm:px-4">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast phải được sử dụng bên trong <ToastProvider>');
    }
    return ctx;
}

function ToastItem({ toast, onClose }) {
    const { type, title, message } = toast;

    const config = {
        success: {
            icon: CheckCircle2,
            bg: 'bg-emerald-950/80',
            border: 'border-emerald-700/70',
            text: 'text-emerald-50',
        },
        error: {
            icon: XCircle,
            bg: 'bg-rose-950/80',
            border: 'border-rose-700/70',
            text: 'text-rose-50',
        },
        info: {
            icon: Info,
            bg: 'bg-slate-900/90',
            border: 'border-slate-700/80',
            text: 'text-slate-50',
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-amber-950/90',
            border: 'border-amber-700/80',
            text: 'text-amber-50',
        },
    }[type] || config.info;

    const Icon = config.icon;

    return (
        <div
            className={[
                'pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border px-3 py-2 shadow-lg shadow-black/40 backdrop-blur-sm',
                config.bg,
                config.border,
                config.text,
            ].join(' ')}
        >
            <div className="mt-0.5">
                <Icon className="size-5" />
            </div>
            <div className="flex-1 text-sm">
                {title && <div className="font-medium mb-0.5">{title}</div>}
                <div className="text-xs sm:text-[13px] leading-snug">{message}</div>
            </div>
            <button
                onClick={onClose}
                className="ml-1 mt-0.5 rounded-full p-1 hover:bg-black/30"
            >
                <X className="size-3.5" />
            </button>
        </div>
    );
}
