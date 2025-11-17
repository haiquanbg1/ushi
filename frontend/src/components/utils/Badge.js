import React from 'react';

export default function Badge({ children, tone = 'slate' }) {
    const map = {
        slate: 'bg-slate-800 text-slate-200 border-slate-700',
        blue: 'bg-blue-600/10 text-blue-300 border-blue-700/40',
        emerald: 'bg-emerald-600/10 text-emerald-300 border-emerald-700/40',
        rose: 'bg-rose-600/10 text-rose-300 border-rose-700/40',
        violet: 'bg-violet-600/10 text-violet-300 border-violet-700/40',
        amber: 'bg-amber-600/10 text-amber-300 border-amber-700/40',
    };
    return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
}