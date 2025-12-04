import React from 'react';
import { Plus } from 'lucide-react';

const tone = {
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary:
        'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
};

const money = (v) => (Number(v || 0)).toLocaleString('vi-VN') + '₫';

export default function MenuCard({ item, onAdd, onOpen }) {
    const isCombo = item.type === 'combo';

    return (
        <div
            onClick={() => onOpen?.(item)}
            className={`${tone.card} rounded-2xl overflow-hidden cursor-pointer transform hover:-translate-y-1 active:scale-[0.98] group`}
        >
            <div className="aspect-[4/3] bg-gradient-to-br from-orange-50 to-amber-100 relative overflow-hidden">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full grid place-items-center text-4xl">
                        {isCombo ? '🧺' : '🍽️'}
                    </div>
                )}

                {isCombo && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-sky-600/90 text-[11px] text-white font-semibold">
                        Combo
                    </div>
                )}
            </div>

            <div className="p-3 sm:p-4">
                <div className="font-semibold text-sm sm:text-base leading-tight line-clamp-1 mb-1">
                    {item.name}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2 sm:mb-3 min-h-[2.5rem] sm:min-h-[2.75rem]">
                    {item.desc}
                </div>

                <div
                    className="flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-orange-700 font-extrabold text-sm sm:text-lg">
                        {money(item.price)}
                    </div>
                    <button
                        onClick={onAdd}
                        className={`${tone.primary} px-3 py-1.5 rounded-full text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-sm hover:scale-105 active:scale-95 transition-all duration-200`}
                    >
                        <Plus size={16} className="hidden sm:inline" />
                        <span>Thêm</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
