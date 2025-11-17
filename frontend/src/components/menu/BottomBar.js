import React from 'react';
import { Home, History as HistoryIcon, User as UserIcon, ShoppingCart, Receipt } from 'lucide-react';

const moneyVND = (n) => (n || 0).toLocaleString('vi-VN') + '₫';

export default function BottomBar({ onHome, onCart, onHistory, onUser, onCurrent, totalQty, totalMoney, active }) {
    const buttons = [
        { icon: Home, label: 'Món ăn', onClick: onHome, id: 'menu' },
        { icon: Receipt, label: 'Đơn hiện tại', onClick: onCurrent, id: 'current' },
        { icon: HistoryIcon, label: 'Lịch sử', onClick: onHistory, id: 'history' },
        { icon: UserIcon, label: 'Người dùng', onClick: onUser, id: 'user' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-100 lg:hidden">
            <div className="mx-auto max-w-screen-sm px-3 py-2 grid grid-cols-5 gap-1 text-xs">
                {buttons.map((btn) => {
                    const Icon = btn.icon;
                    const isActive = active === btn.id;
                    return (
                        <button key={btn.id} onClick={btn.onClick} className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-all duration-200 ${isActive ? 'text-orange-600' : 'text-gray-600'}`}>
                            <Icon size={20} />
                            <span className="font-medium text-[10px] leading-tight">{btn.label}</span>
                        </button>
                    );
                })}
                <button onClick={onCart} className="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 bg-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="relative">
                        <ShoppingCart size={20} />
                        {totalQty > 0 && (<span className="absolute -top-2 -right-2 w-5 h-5 text-xs bg-red-500 rounded-full grid place-items-center font-bold">{totalQty}</span>)}
                    </div>
                    <span className="text-[10px] leading-tight">{moneyVND(totalMoney)}</span>
                </button>
            </div>
        </nav>
    );
}
