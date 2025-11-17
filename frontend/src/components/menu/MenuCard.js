import React from 'react';
import { Plus } from 'lucide-react';

const tone = {
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
};

export default function MenuCard({ item, onAdd, onOpen }) {
    return (
        <div onClick={() => onOpen?.(item)} className={`${tone.card} rounded-xl sm:rounded-2xl overflow-hidden hover:ring-2 hover:ring-orange-300 active:ring-2 active:ring-orange-400 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 active:scale-[0.98] group`}>
            <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-amber-100 grid place-items-center text-3xl sm:text-4xl group-hover:scale-110 group-active:scale-105 transition-transform duration-300">🍽️</div>
            <div className="p-3 sm:p-4">
                <div className="font-semibold text-sm sm:text-base leading-tight line-clamp-1 mb-1">{item.name}</div>
                <div className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2 sm:mb-3 min-h-[2.5rem] sm:min-h-[2.75rem]">{item.desc}</div>
                <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="text-orange-700 font-extrabold text-base sm:text-lg">{(item.price || 0).toLocaleString('vi-VN')}₫</div>
                    <button onClick={onAdd} className={`${tone.primary} px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm inline-flex items-center gap-1 shadow-md hover:shadow-lg active:shadow-sm transform hover:scale-105 active:scale-95 transition-all duration-200`}>
                        <Plus size={16} className="hidden sm:inline" />
                        <span>Thêm</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
