import React, { useEffect } from 'react';

export default function ToastHost({ toasts, setToasts }) {
    useEffect(() => {
        if (toasts.length === 0) return;
        const timers = toasts.map((t) => setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== t.id)), t.duration || 2200));
        return () => timers.forEach(clearTimeout);
    }, [toasts, setToasts]);

    return (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 space-y-2 w-[92%] max-w-sm">
            {toasts.map((t) => (
                <div key={t.id} className={`rounded-xl px-5 py-4 shadow-lg backdrop-blur-sm animate-slide-up ${t.type === 'success' ? 'bg-emerald-600 text-white' : t.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white'}`}>
                    {t.message}
                </div>
            ))}
        </div>
    );
}
