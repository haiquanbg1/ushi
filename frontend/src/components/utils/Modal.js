'use client';
import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose, className = '' }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
            <div
                className={`w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 ${className || 'sm:max-w-md' // ✅ Nếu không truyền className thì dùng max-w-md
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-200 font-semibold text-base">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 transition-colors"
                        type="button"
                    >
                        <X className="size-5" />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
}