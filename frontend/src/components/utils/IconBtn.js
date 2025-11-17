import React from 'react';

export default function IconBtn({ children, tone = 'neutral', ...rest }) {
    const cls = tone === 'danger'
        ? 'text-rose-300 hover:bg-rose-950/50'
        : 'text-slate-300 hover:bg-slate-800';
    return (
        <button className={`rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 ${cls}`} {...rest}>
            {children}
        </button>
    );
}