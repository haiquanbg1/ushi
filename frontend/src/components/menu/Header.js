import React from 'react';
import { ShoppingCart, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const tone = {
    ghost: 'bg-white ring-1 ring-orange-200 text-orange-700 hover:bg-orange-50 transition-all duration-200',
};

export default function Header({ onCart, totalQty, onMenuClick, onLogout }) {
    const auth = useAuth();
    return (
        <header className="sticky top-0 z-40 shadow-sm">
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">Ushi Mania</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onCart}
                                className="relative px-4 py-2 rounded-lg bg-white text-orange-700 font-semibold hover:bg-orange-50 transition-all duration-200 flex items-center gap-2 hidden sm:inline-flex"
                            >
                                <ShoppingCart size={20} />
                                <span className="hidden sm:inline">Giỏ hàng</span>
                                {totalQty > 0 && (
                                    <span className="absolute -top-2 -right-2 w-6 h-6 text-xs bg-red-500 text-white rounded-full grid place-items-center font-bold animate-pulse">{totalQty}</span>
                                )}
                            </button>
                            {auth?.user && (
                                <button
                                    onClick={() => {
                                        try {
                                            if (typeof onLogout === 'function') return onLogout();
                                            if (typeof auth?.logout === 'function') return auth.logout();
                                        } catch (e) {
                                            console.error('logout failed', e);
                                        }
                                    }}
                                    className={`${tone.ghost} px-4 py-2 rounded-xl font-semibold`}
                                >
                                    <LogOut size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
