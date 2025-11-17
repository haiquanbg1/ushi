import React from 'react';
import { X, Plus } from 'lucide-react';

const tone = { card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm', primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200' };

export default function ItemModal({ item, open, onClose, onAdd }) {
    if (!open || !item) return null;
    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className={`${tone.card} relative rounded-3xl p-6 shadow-2xl w-full max-w-md max-h-[85vh] overflow-auto animate-scale-in`}>
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
                <div className="space-y-5">
                    <h3 className="text-2xl font-bold pr-8">{item.name}</h3>
                    <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 grid place-items-center text-5xl">🍽️</div>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-orange-100">
                        <div className="text-2xl font-extrabold text-orange-700">{(item.price || 0).toLocaleString('vi-VN')}₫</div>
                        <button onClick={() => { onAdd(item); onClose(); }} className={`${tone.primary} px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105`}><Plus size={20} /> Thêm vào giỏ</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
