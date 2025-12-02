'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    ShoppingCart, History as HistoryIcon, User as UserIcon, Home,
    Search, Plus, Minus, ChevronLeft, X, LogIn, UserPlus, LogOut,
    Calendar, Clock, CheckCircle, XCircle, Menu, Bell, MapPin
} from 'lucide-react';
import Header from '@/components/menu/Header';
import Sidebar from '@/components/menu/Sidebar';
import MenuCard from '@/components/menu/MenuCard';
import CartDrawer from '@/components/menu/CartDrawer';
import HistoryPanel from '@/components/menu/HistoryPanel';
import UserPanel from '@/components/menu/UserPanel';
import ItemModal from '@/components/menu/ItemModal';
import ComboModal from '@/components/menu/ComboModal';
import OrderDetailModal from '@/components/menu/OrderDetailModal';
import AuthGateModal from '@/components/menu/AuthGateModal';
import EmptyState from '@/components/menu/EmptyState';
import ToastHost from '@/components/menu/ToastHost';
import BottomBar from '@/components/menu/BottomBar';
import OrderReview from '@/components/menu/OrderReview';
import { useAuth } from '@/hooks/useAuth';
import { itemAPI, categoryAPI, orderAPI, orderDetailAPI, customerAPI, comboAPI } from '@/lib/api';

/* ... giữ nguyên toàn bộ phần store + helper + hàm
   GUEST_ORDER_ID_KEY, fillCartFromServer, transferGuestOrdersToUser, tone ...
   KHÔNG cần sửa gì ở phía trên
*/

// =================== MAIN APP (inner) ===================
function MenuPageInner() {
    const searchParams = useSearchParams();
    const auth = useAuth();
    const cart = useCartStore();
    const tableStore = useTableStore();

    const [active, setActive] = useState('menu');
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCombo, setSelectedCombo] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);

    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loggedInCustomerId, setLoggedInCustomerId] = useState(null);

    const totalQty = useMemo(
        () => cart.items.reduce((s, i) => s + i.quantity, 0),
        [cart.items]
    );
    const totalMoney = useMemo(
        () => cart.items.reduce((s, i) => s + i.price * i.quantity, 0),
        [cart.items]
    );

    // --- các useEffect, hàm onLogout, pushToast, createCustomerForNewUser,
    // handleAuthModalClose, fetchData, filtered, handleAddToCart, v.v.
    // GIỮ NGUYÊN TOÀN BỘ, chỉ đặt chúng bên trong MenuPageInner như cũ ---

    useEffect(() => {
        console.log('🔍 Debug State:', {
            'auth.loading': auth.loading,
            'auth.user': auth.user?.username || null,
            sessionChecked,
            showAuthModal,
            customerId: tableStore.customerId,
            authInitialized,
        });

        const demo = async () => {
            if (auth.user && tableStore.customerId == 1) {
                const customer = await customerAPI.getByUser(auth.user.id);
                tableStore.setCustomer(customer?.data?.data?.id || 1);
                setLoggedInCustomerId(customer?.data?.data?.id || null);
            }
        };

        demo();
    }, [auth.loading, auth.user, sessionChecked, showAuthModal, tableStore.customerId, authInitialized]);

    useEffect(() => {
        const checkAuth = async () => {
            if (auth.loading) return;
            if (sessionChecked) return;

            // ... (giữ nguyên toàn bộ logic checkAuth, fillCartFromServer, v.v.)
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.loading, auth.user, sessionChecked]);

    useEffect(() => {
        const tableParam = searchParams.get('table');
        if (tableParam && !tableStore.tableId) {
            tableStore.setTable(tableParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // ... giữ nguyên TẤT CẢ các effect, memo, handlers phía dưới ...

    const handleAddToCart = (item) => {
        cart.add({
            ...item,
            components: item.components || item.items || item.comboItems || [],
        });
        pushToast({ message: `Đã thêm ${item.name} vào giỏ hàng` });
    };

    return (
        <div className={`min-h-screen ${tone.grad} text-gray-900`}>
            {/* Toàn bộ JSX cũ trong return của Page giữ nguyên ở đây */}
            {/* Header, Sidebar, main, BottomBar, CartDrawer, Modals, ToastHost, <style>... */}
        </div>
    );
}

// =================== Suspense Wrapper ===================
export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
                        <p className="text-sm text-gray-600">Đang tải menu...</p>
                    </div>
                </div>
            }
        >
            <MenuPageInner />
        </Suspense>
    );
}
