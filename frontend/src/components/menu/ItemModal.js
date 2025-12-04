import React from 'react';
import { X, Plus } from 'lucide-react';

const tone = {
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary:
        'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
};

const money = (v) => (Number(v || 0)).toLocaleString('vi-VN') + '₫';

export default function ItemModal({ item, open, onClose, onAdd }) {
    if (!open || !item) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />
            <div className={`${tone.card} relative rounded-3xl p-5 sm:p-6 w-full max-w-md max-h-[85vh] overflow-auto animate-scale-in`}>
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="space-y-5">
                    <h3 className="text-2xl font-bold pr-8">{item.name}</h3>

                    <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 overflow-hidden grid place-items-center">
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <span className="text-5xl">🍽️</span>
                        )}
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                        {item.desc || 'Món ăn ngon dành cho bạn.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-top border-orange-100">
                        <div className="text-2xl font-extrabold text-orange-700">
                            {money(item.price)}
                        </div>
                        <button
                            onClick={() => {
                                onAdd(item);
                                onClose();
                            }}
                            className={`${tone.primary} px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95`}
                        >
                            <Plus size={20} />
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
