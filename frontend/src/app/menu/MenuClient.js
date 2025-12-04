'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Search, XCircle, MapPin } from 'lucide-react';

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
import {
    itemAPI,
    categoryAPI,
    orderAPI,
    orderDetailAPI,
    customerAPI,
    comboAPI,
    tableAPI
} from '@/lib/api';

// =================== Cart Store ===================
// Cart chỉ nằm ở localStorage, không sync từ server
const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            setAll: (items) => set({ items }),
            add: (item) => {
                const exists = get().items.find((i) => i.id === item.id && i.type === item.type);
                if (exists) {
                    set({
                        items: get().items.map((i) =>
                            i.id === item.id && i.type === item.type
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...get().items, { ...item, quantity: 1 }] });
                }
            },
            dec: (id) =>
                set({
                    items: get()
                        .items.map((i) =>
                            i.id === id ? { ...i, quantity: i.quantity - 1 } : i
                        )
                        .filter((i) => i.quantity > 0),
                }),
            remove: (id) =>
                set({
                    items: get().items.filter((i) => i.id !== id),
                }),
            clear: () => set({ items: [] }),
        }),
        { name: 'order-cart-v1' }
    )
);

// =================== Table Store ===================
// Chỉ giữ thông tin bàn + customerId thực nếu đã login.
// Guest = customerId === null
const useTableStore = create(
    persist(
        (set) => ({
            tableId: null,
            tableNumber: null,
            customerId: null,
            setTable: (table) =>
                set({ tableId: table.id, tableNumber: table.tableNumber }),
            setCustomer: (customerId) => set({ customerId }),
            clear: () => set({ tableId: null, tableNumber: null, customerId: null }),
        }),
        { name: 'table-session-v1' }
    )
);

const GUEST_ORDER_ID_KEY = 'guest-order-id';

// Hàm này vẫn có thể giữ lại nếu sau này muốn sync từ server,
// hiện tại ta KHÔNG gọi nó nữa để cart chỉ lấy từ localStorage.
const fillCartFromServer = async (tableId, cartStore) => {
    try {
        if (!tableId) return;

        const orderResponse = await orderAPI.getByTableActive(tableId);
        const order = orderResponse?.data?.data;
        if (!order || !order.id) return;

        const d = await orderDetailAPI.getByOrder(order.id);
        const details = d?.data?.data || [];

        const items = details
            .map((it) => ({
                id: it.itemId || it.item?.id,
                name: it.itemName || it.item?.name || 'Món',
                price: Number(it.unitPrice ?? it.price ?? 0),
                quantity: Number(it.quantity ?? 1),
                category: it.item?.categoryId || it.item?.category?.id,
                image: it.item?.imageUrl || null,
                desc: it.item?.description || '',
                type: 'item',
            }))
            .filter((x) => x.id);

        if (items.length) cartStore.setAll(items);
    } catch (e) {
        console.error('fillCartFromServer error', e);
    }
};

// Khi user login (hoặc tạo customer mới), nếu bàn đang có order guest
// thì update order đó gán customerId (attach guest order -> member)
const transferGuestOrdersToUser = async (newCustomerId, tableId) => {
    try {
        if (!tableId || !newCustomerId) return;

        const orderRes = await orderAPI.getByTableActive(tableId);
        const order = orderRes?.data?.data;

        if (order?.id) {
            await orderAPI.update(order.id, {
                customerId: newCustomerId,
            });
        }
    } catch (e) {
        console.error('transferGuestOrdersToUser error', e);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(GUEST_ORDER_ID_KEY);
        }
    }
};

// =================== Theme & Helpers ===================
const tone = {
    grad: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50',
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary:
        'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
    ghost:
        'bg-white ring-1 ring-orange-200 text-orange-700 hover:bg-orange-50 transition-all duration-200',
};

export default function MenuClient() {
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

    // customerId thực (member), guest -> null
    const [, setLoggedInCustomerId] = useState(null);

    const totalQty = useMemo(
        () => cart.items.reduce((s, i) => s + i.quantity, 0),
        [cart.items]
    );
    const totalMoney = useMemo(
        () => cart.items.reduce((s, i) => s + i.price * i.quantity, 0),
        [cart.items]
    );

    // =================== AUTH INIT ===================
    useEffect(() => {
        const checkAuth = async () => {
            if (auth.loading) return;
            if (sessionChecked) return;

            if (auth.user) {
                try {
                    const response = await customerAPI.getByUser(auth.user.id);
                    const customer = response.data?.data;

                    if (customer) {
                        // Nếu trước đó có guest-order-id -> attach order đó cho customer
                        const hasGuestOrder =
                            typeof window !== 'undefined' &&
                            localStorage.getItem(GUEST_ORDER_ID_KEY);

                        if (hasGuestOrder) {
                            await transferGuestOrdersToUser(
                                customer.id,
                                tableStore.tableId
                            );
                        }

                        tableStore.setCustomer(customer.id);
                        setLoggedInCustomerId(customer.id);
                    } else {
                        // user login nhưng chưa có customer record
                        tableStore.setCustomer(null);
                        setLoggedInCustomerId(null);
                    }
                } catch (err) {
                    console.error('Error getting customer:', err);
                    tableStore.setCustomer(null);
                    setLoggedInCustomerId(null);
                }
            } else {
                // Guest
                tableStore.setCustomer(null);
                setLoggedInCustomerId(null);
                setShowAuthModal(true);
            }

            setAuthInitialized(true);
            setSessionChecked(true);
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.loading, auth.user, sessionChecked]);

    // =================== INIT TABLE FROM URL ===================
    const tableParam = searchParams.get('table');

    useEffect(() => {
        const initTableFromUrl = async () => {
            if (!tableParam || tableStore.tableId) return;

            try {
                const response = await tableAPI.getById(tableParam);
                const table = response?.data?.data;

                if (table) {
                    tableStore.setTable(table);
                }
            } catch (err) {
                console.error('Error fetching table from URL param:', err);
            }
        };

        initTableFromUrl();
    }, [tableParam, tableStore.tableId, tableStore]);

    // Show Auth Modal khi truy cập chức năng cần login
    useEffect(() => {
        if (!sessionChecked) return;
        if (!auth.user && (active === 'history' || active === 'user')) {
            setShowAuthModal(true);
        }
    }, [active, auth.user, sessionChecked]);

    const onLogout = async () => {
        try {
            if (cart.items.length > 0) {
                const ok = window.confirm(
                    'Đồ ăn đang chọn sẽ bị xoá khỏi giỏ. Bạn có chắc muốn đăng xuất?'
                );
                if (!ok) return;
            }
            await auth.logout?.();
            setLoggedInCustomerId(null);

            if (typeof window !== 'undefined') {
                localStorage.removeItem('applied-discount-code');
                localStorage.removeItem(GUEST_ORDER_ID_KEY);
            }

            tableStore.setCustomer(null);
            cart.clear();
            setAuthInitialized(false);
            setSessionChecked(false);
        } catch (e) {
            console.error('logout failed', e);
        }
    };

    const pushToast = (t) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((arr) => [
            ...arr,
            { id, duration: 2200, type: 'success', ...t },
        ]);
    };

    const createCustomerForNewUser = async (userData) => {
        try {
            const customerData = {
                userId: userData.id,
                fullName: userData.fullName || userData.username,
                customerType: 'member',
                loyaltyPoints: 0,
                totalSpent: 0,
            };

            const response = await customerAPI.create(customerData);

            if (response.data?.success && response.data?.data) {
                const customerId = response.data.data.id;

                await transferGuestOrdersToUser(
                    customerId,
                    tableStore.tableId
                );

                tableStore.setCustomer(customerId);
                setLoggedInCustomerId(customerId);
                setAuthInitialized(true);

                pushToast({
                    message: 'Tài khoản đã được tạo thành công!',
                    type: 'success',
                });
            } else {
                throw new Error('Failed to create customer');
            }
        } catch (err) {
            console.error('Error creating customer:', err);
            tableStore.setCustomer(null);
            setLoggedInCustomerId(null);
            setAuthInitialized(true);
            pushToast({
                message: 'Có lỗi xảy ra, đang sử dụng tài khoản khách',
                type: 'error',
            });
        }
    };

    const handleAuthModalClose = async (action, userData) => {
        setShowAuthModal(false);

        if (action === 'skip') {
            tableStore.setCustomer(null);
            setAuthInitialized(true);
            pushToast({ message: 'Đang sử dụng tài khoản khách' });
        } else if (action === 'login' && userData) {
            try {
                const response = await customerAPI.getByUser(userData.id);
                const customer = response.data?.data;

                if (customer) {
                    await transferGuestOrdersToUser(
                        customer.id,
                        tableStore.tableId
                    );

                    tableStore.setCustomer(customer.id);
                    setLoggedInCustomerId(customer.id);
                    setAuthInitialized(true);

                    pushToast({
                        message: `Xin chào, ${userData.fullName || userData.username
                            }!`,
                    });
                }
            } catch (err) {
                console.error('Error getting customer after login:', err);
                tableStore.setCustomer(null);
                setLoggedInCustomerId(null);
                setAuthInitialized(true);
            }
        }
    };

    // =================== FETCH MENU DATA ===================
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [categoriesResponse, itemsResponse, combosResponse] =
                    await Promise.all([
                        categoryAPI.getActive(),
                        itemAPI.getAll(),
                        comboAPI.getAll(),
                    ]);

                const categoriesData = categoriesResponse?.data?.data || [];
                const itemsData = itemsResponse?.data?.data || [];
                const combosData = combosResponse?.data?.data || [];

                const mappedCategories = [
                    {
                        id: 'all',
                        name: 'Tất cả',
                        sortOrder: 0,
                        isActive: true,
                    },
                    {
                        id: '1000',
                        name: 'Combo',
                        sortOrder: 1000,
                        isActive: true,
                    },
                    ...categoriesData.map((cat) => ({
                        id: cat.id,
                        name: cat.categoryName,
                        sortOrder: cat.sortOrder ?? 0,
                        isActive: cat.isActive,
                    })),
                ].sort(
                    (a, b) =>
                        Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
                );
                setCategories(mappedCategories);

                const transformedItems = itemsData.map((item) => ({
                    id: item.id,
                    type: 'item',
                    name: item.name,
                    price: item.price,
                    category: item.categoryId || item.category?.id,
                    image: item.imageUrl || item.image || null,
                    desc: item.description || '',
                    isAvailable: item.isActive !== false,
                    sortOrder: item.sortOrder ?? 0,
                }));

                const transformedCombos = combosData.map((combo) => ({
                    id: combo.id,
                    type: 'combo',
                    name: combo.name,
                    price: combo.price,
                    category: {
                        id: '1000',
                        name: 'Combo',
                        sortOrder: 1000,
                        isActive: true,
                    },
                    image: combo.image || combo.imageUrl || null,
                    desc: combo.description || '',
                    isAvailable: combo.isActive !== false,
                    components: combo.comboItems || [],
                }));

                const merged = [...transformedItems, ...transformedCombos].sort(
                    (a, b) =>
                        Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
                );
                setMenuItems(merged);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
                setMenuItems([]);
                setCategories([{ id: 'all', name: 'Tất cả' }]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filtered = useMemo(() => {
        return menuItems
            .filter((m) => {
                const matchesQuery = m.name
                    .toLowerCase()
                    .includes(query.toLowerCase());

                let matchesCategory = false;

                if (category === 'all') {
                    matchesCategory = true;
                } else if (category === '1000') {
                    matchesCategory = m.type === 'combo';
                } else {
                    matchesCategory =
                        m.type === 'item' && m.category === category;
                }

                const isAvailable = m.isAvailable !== false;

                return matchesQuery && matchesCategory && isAvailable;
            })
            .sort(
                (a, b) =>
                    Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
            );
    }, [query, category, menuItems]);

    // Handle Modal Overflow
    useEffect(() => {
        const modalOpen =
            active === 'cart' ||
            !!selectedItem ||
            !!selectedCombo ||
            !!selectedOrder ||
            showAuthModal;
        if (typeof document !== 'undefined') {
            document.body.style.overflow = modalOpen ? 'hidden' : '';
        }
    }, [active, selectedItem, selectedCombo, selectedOrder, showAuthModal]);

    const handleAddToCart = (item) => {
        cart.add({
            ...item,
            components:
                item.components || item.items || item.comboItems || [],
        });
        pushToast({ message: `Đã thêm ${item.name} vào giỏ hàng` });
    };

    return (
        <div className={`min-h-screen ${tone.grad} text-gray-900`}>
            <Header
                onCart={() => setActive('cart')}
                totalQty={totalQty}
                onMenuClick={() =>
                    setActive(active === 'menu' ? 'user' : 'menu')
                }
                tableNumber={tableStore.tableNumber}
                onLogout={onLogout}
                onLoginClick={() => setShowAuthModal(true)}
            />

            <div className="lg:flex">
                <Sidebar active={active} onNavigate={setActive} />

                <main className="flex-1 lg:px-8 lg:py-6">
                    {active === 'menu' && (
                        <section className="px-4 lg:px-0 pt-4 pb-4 lg:mb-6 animate-fade-in">
                            <div className="max-w-6xl mx-auto">
                                {tableStore.tableNumber && (
                                    <div
                                        className={`${tone.card} rounded-2xl p-4 mb-4 flex items-center gap-3`}
                                    >
                                        <MapPin
                                            size={20}
                                            className="text-orange-600"
                                        />
                                        <div>
                                            <div className="font-semibold text-orange-700">
                                                Bàn số {tableStore.tableNumber}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {auth.user
                                                    ? 'Thành viên'
                                                    : 'Khách'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div
                                    className={`${tone.card} rounded-2xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3`}
                                >
                                    <Search
                                        size={20}
                                        className="text-orange-500"
                                    />
                                    <input
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                        placeholder="Tìm kiếm món ăn..."
                                        className="flex-1 bg-transparent outline-none"
                                    />
                                </div>

                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {categories.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() =>
                                                setCategory(c.id)
                                            }
                                            className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 ring-1 ${category === c.id
                                                ? 'bg-orange-600 text-white ring-orange-600 shadow-lg shadow-orange-200 scale-105'
                                                : 'bg-white text-orange-700 ring-orange-200 hover:bg-orange-50 hover:ring-orange-300'
                                                }`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="px-4 lg:px-0 pb-28 lg:pb-8">
                        <div className="max-w-6xl mx-auto">
                            {active === 'menu' && (
                                <>
                                    {loading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <div className="text-center">
                                                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
                                                <p className="text-gray-600">
                                                    Đang tải menu...
                                                </p>
                                            </div>
                                        </div>
                                    ) : error ? (
                                        <div
                                            className={`${tone.card} rounded-2xl p-8 text-center`}
                                        >
                                            <XCircle
                                                size={48}
                                                className="text-red-500 mx-auto mb-4"
                                            />
                                            <p className="text-gray-700 mb-4">
                                                {error}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    window.location.reload()
                                                }
                                                className={`px-6 py-2 rounded-lg ${tone.primary}`}
                                            >
                                                Thử lại
                                            </button>
                                        </div>
                                    ) : filtered.length === 0 ? (
                                        <EmptyState
                                            title="Không tìm thấy món phù hợp"
                                            emoji="🍽️"
                                        />
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                            {filtered.map((m, idx) => (
                                                <div
                                                    key={`${m.type}-${m.id}`}
                                                    style={{
                                                        animationDelay: `${idx * 50}ms`,
                                                    }}
                                                    className="animate-fade-in"
                                                >
                                                    <MenuCard
                                                        item={m}
                                                        onAdd={() =>
                                                            handleAddToCart(m)
                                                        }
                                                        onOpen={() =>
                                                            m.type ===
                                                                'combo'
                                                                ? setSelectedCombo(
                                                                    m
                                                                )
                                                                : setSelectedItem(
                                                                    m
                                                                )
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {active === 'current' && (
                                <section className="space-y-4 animate-fade-in">
                                    <h2 className="text-2xl font-bold">
                                        Đơn hàng hiện tại
                                    </h2>
                                    <OrderReview
                                        tableId={tableStore.tableId}
                                        // Nếu bạn vẫn cần customerId thật ở OrderReview
                                        customerId={tableStore.customerId}
                                    />
                                </section>
                            )}

                            {active === 'history' &&
                                (auth.user ? (
                                    <HistoryPanel
                                        onOpenDetail={setSelectedOrder}
                                        auth={auth}
                                    />
                                ) : (
                                    <EmptyState
                                        title="Vui lòng đăng nhập để xem lịch sử"
                                        emoji="🔒"
                                    />
                                ))}

                            {active === 'user' &&
                                (auth.user ? (
                                    <UserPanel
                                        auth={auth}
                                        addToast={pushToast}
                                    />
                                ) : (
                                    <EmptyState
                                        title="Vui lòng đăng nhập"
                                        emoji="👤"
                                    />
                                ))}
                        </div>
                    </div>
                </main>
            </div>

            <BottomBar
                onHome={() => setActive('menu')}
                onCart={() => setActive('cart')}
                onCurrent={() => setActive('current')}
                onHistory={() => setActive('history')}
                onUser={() => setActive('user')}
                totalQty={totalQty}
                totalMoney={totalMoney}
                active={active}
            />

            {/* CartDrawer chỉ dùng cart ở localStorage + tableId */}
            <CartDrawer
                open={active === 'cart'}
                onClose={() => setActive('menu')}
                cart={cart}
                tableId={tableStore.tableId}
                customerId={tableStore.customerId}
                setCustomerId={setLoggedInCustomerId}
            />

            <ItemModal
                item={selectedItem}
                open={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                onAdd={handleAddToCart}
            />
            <ComboModal
                combo={selectedCombo}
                open={!!selectedCombo}
                onClose={() => setSelectedCombo(null)}
                onAdd={handleAddToCart}
            />
            <OrderDetailModal
                order={selectedOrder}
                open={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
            <AuthGateModal
                open={showAuthModal}
                onClose={handleAuthModalClose}
                tableNumber={tableStore.tableNumber}
                setCustomerId={setLoggedInCustomerId}
            />

            <ToastHost toasts={toasts} setToasts={setToasts} />

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slide-left {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
                .animate-slide-left {
                    animation: slide-left 0.3s ease-out;
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
                .animate-shake {
                    animation: shake 0.3s ease-out;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
