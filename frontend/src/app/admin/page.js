'use client';

import { useState, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardSection from '@/components/admin/Dashboard';
import UserSection from '@/components/admin/UserSection';
import MenuSection from '@/components/admin/MenuSection';
import PromotionSection from '@/components/admin/PromotionSection';
import TableSection from '@/components/admin/TableSection';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    Users,
    UtensilsCrossed,
    Package,
    Gift,
    Table2,
    LogOut,
    Settings,
    Plus,
    Pencil,
    Trash2,
    ChevronRight,
} from 'lucide-react';

const NAV = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { key: 'promotions', label: 'Promos', icon: Gift },
    { key: 'tables', label: 'Tables', icon: Table2 },
];

export default function AdminPage() {
    const [active, setActive] = useState('dashboard');
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute requiredRole="Admin">
            <div className="min-h-screen bg-black text-slate-100">
                {/* Header */}
                <header className="sticky top-0 z-40 border-b border-slate-800 bg-black/80 backdrop-blur">
                    <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-xl bg-slate-900 grid place-items-center text-slate-300">🍣</div>
                            <h1 className="text-lg font-semibold tracking-tight">Admin Console</h1>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="hidden sm:block text-slate-400">Hello, <span className="text-slate-200 font-medium">{user?.username || 'Admin'}</span></span>
                            <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 hover:bg-slate-800 active:scale-[.99]">
                                <LogOut className="size-4" />
                                <span className="hidden sm:inline">Log out</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main layout */}
                <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[240px_1fr] gap-0">
                    {/* Sidebar (md+) */}
                    <aside className="hidden md:block border-r border-slate-800">
                        <nav className="p-3 space-y-1">
                            {NAV.map((n) => (
                                <button
                                    key={n.key}
                                    onClick={() => setActive(n.key)}
                                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${active === n.key
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-300 hover:bg-slate-900'
                                        }`}
                                >
                                    <n.icon className="size-4" />
                                    <span>{n.label}</span>
                                    {active === n.key && <ChevronRight className="ml-auto size-4 text-slate-400" />}
                                </button>
                            ))}
                        </nav>
                        <div className="p-3">
                            <button className="w-full flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900">
                                <Settings className="size-4" /> Settings
                            </button>
                        </div>
                    </aside>

                    {/* Content */}
                    <main className="min-h-[72vh] p-4 md:p-6">
                        {active === 'dashboard' && <DashboardSection />}
                        {active === 'users' && <UserSection />}
                        {active === 'menu' && <MenuSection />}
                        {active === 'promotions' && <PromotionSection />}
                        {active === 'tables' && <TableSection />}
                    </main>
                </div>

                {/* Bottom nav (mobile) */}
                <MobileNav active={active} onChange={setActive} />
            </div>
        </ProtectedRoute>
    );
}

function MobileNav({ active, onChange }) {
    return (
        <nav className="md:hidden sticky bottom-0 z-40 border-t border-slate-800 bg-black/90 backdrop-blur">
            <div className="grid grid-cols-5">
                {NAV.map((n) => {
                    const Icon = n.icon;
                    const isActive = active === n.key;
                    return (
                        <button
                            key={n.key}
                            onClick={() => onChange(n.key)}
                            className={`flex flex-col items-center gap-1 py-2 text-[11px] ${isActive ? 'text-white' : 'text-slate-400'
                                }`}
                        >
                            <Icon className={`size-5 ${isActive ? 'opacity-100' : 'opacity-75'}`} />
                            {n.label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
