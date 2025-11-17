import React from 'react';
import { Home, History as HistoryIcon, User as UserIcon, Receipt } from 'lucide-react';

export default function Sidebar({ active, onNavigate }) {
    const navItems = [
        { id: 'menu', icon: Home, label: 'Thực đơn' },
        { id: 'current', icon: Receipt, label: 'Đơn hiện tại' },
        { id: 'history', icon: HistoryIcon, label: 'Lịch sử' },
        { id: 'user', icon: UserIcon, label: 'Tài khoản' },
    ];

    return (
        <aside className="hidden lg:block w-64 bg-white border-r border-orange-100 h-[calc(100vh-4rem)] sticky top-16">
            <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    return (
                        <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-gray-700 hover:bg-orange-50'}`}>
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
