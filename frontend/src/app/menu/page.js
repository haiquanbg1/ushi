'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

// =================== Cart Store ===================
const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            setAll: (items) => set({ items }),
            add: (item) => {
                const exists = get().items.find((i) => i.id === item.id);
                if (exists) {
                    set({
                        items: get().items.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    });
                } else {
                    set({ items: [...get().items, { ...item, quantity: 1 }] });
                }
            },
            dec: (id) =>
                set({
                    items: get()
                        .items.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
                        .filter((i) => i.quantity > 0),
                }),
            remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
            clear: () => set({ items: [] }),
        }),
        { name: 'order-cart-v1' }
    )
);

// =================== Table Store ===================
const useTableStore = create(
    persist(
        (set) => ({
            tableId: null,
            customerId: 1,
            setTable: (tableId) => set({ tableId }),
            setCustomer: (customerId) => set({ customerId }),
            clear: () => set({ tableId: null, customerId: null }),
        }),
        { name: 'table-session-v1' }
    )
);

const GUEST_ORDER_ID_KEY = 'guest-order-id';

const fillCartFromServer = async (cid, cartStore, isGuest = false) => {
    try {
        let order = null;

        if (isGuest) {
            // For guest users, use order ID from localStorage
            const storedOrderId = localStorage.getItem(GUEST_ORDER_ID_KEY);
            if (storedOrderId) {
                try {
                    const orderRes = await orderAPI.getById(storedOrderId);
                    order = orderRes?.data?.data;
                    // Verify order is still active
                    if (order &&
                        (order.orderStatus === 'completed' ||
                            order.orderStatus === 'cancelled')) {
                        order = null;
                        localStorage.removeItem(GUEST_ORDER_ID_KEY);
                    } else if (order) {
                        // Check if order has paid payments
                        const payments = order.payments || [];
                        const hasPaidPayment = payments.some(p => p.paymentStatus === 'paid');
                        if (hasPaidPayment) {
                            order = null;
                            localStorage.removeItem(GUEST_ORDER_ID_KEY);
                        }
                    }
                } catch (e) {
                    console.error('Error fetching stored order:', e);
                    localStorage.removeItem(GUEST_ORDER_ID_KEY);
                }
            }
        } else {
            // For logged-in users, get active unpaid order by customer ID
            const res = await orderAPI.getActiveUnpaid(cid, null);
            order = res?.data?.data;
        }

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
            }))
            .filter((x) => x.id);

        if (items.length) cartStore.setAll(items);
    } catch (e) {
        console.error('fillCartFromServer error', e);
    }
};

const transferGuestOrdersToUser = async (newCustomerId, cartStore, tableId) => {
    try {
        // Get guest order ID from localStorage
        const storedOrderId = localStorage.getItem(GUEST_ORDER_ID_KEY);

        if (!storedOrderId) {
            return; // No guest order to transfer
        }

        let guestOrder = null;
        try {
            const guestOrderRes = await orderAPI.getById(storedOrderId);
            guestOrder = guestOrderRes?.data?.data;

            // Verify order is still active
            if (!guestOrder ||
                guestOrder.orderStatus === 'completed' ||
                guestOrder.orderStatus === 'cancelled') {
                localStorage.removeItem(GUEST_ORDER_ID_KEY);
                return;
            }

            // Check if order has paid payments
            const payments = guestOrder.payments || [];
            const hasPaidPayment = payments.some(p => p.paymentStatus === 'paid');
            if (hasPaidPayment) {
                localStorage.removeItem(GUEST_ORDER_ID_KEY);
                return;
            }
        } catch (e) {
            console.error('Error fetching guest order:', e);
            localStorage.removeItem(GUEST_ORDER_ID_KEY);
            return;
        }

        // Get user's active unpaid order
        const userOrderRes = await orderAPI.getActiveUnpaid(newCustomerId, tableId);
        const userOrder = userOrderRes?.data?.data;

        if (userOrder && userOrder.id) {
            // User has an existing order - merge guest order items into it
            const guestDetailsRes = await orderDetailAPI.getByOrder(guestOrder.id);
            const guestDetails = guestDetailsRes?.data?.data || [];

            if (guestDetails.length > 0) {
                const itemsToAdd = guestDetails.map(detail => ({
                    itemId: detail.itemId || detail.item?.id,
                    quantity: detail.quantity,
                    unitPrice: detail.unitPrice
                }));

                await orderAPI.addItems(userOrder.id, itemsToAdd);
            }

            // Delete the guest order after merging
            await orderAPI.delete(guestOrder.id);
            localStorage.removeItem(GUEST_ORDER_ID_KEY);
        } else {
            // User has no existing order - transfer the guest order to user
            await orderAPI.update(guestOrder.id, {
                customerId: newCustomerId
            });
            localStorage.removeItem(GUEST_ORDER_ID_KEY);
        }

        // Refresh cart from server with new customer ID
        await fillCartFromServer(newCustomerId, cartStore, false);
    } catch (e) {
        console.error('transferGuestOrdersToUser error', e);
        localStorage.removeItem(GUEST_ORDER_ID_KEY);
    }
};

// =================== Theme & Helpers ===================
const tone = {
    grad: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50',
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
    ghost: 'bg-white ring-1 ring-orange-200 text-orange-700 hover:bg-orange-50 transition-all duration-200',
};

// =================== MAIN APP ===================
export default function Page() {
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

    // Debug
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
        }

        demo()
    }, [auth.loading, auth.user, sessionChecked, showAuthModal, tableStore.customerId, authInitialized]);

    // Initialize Auth
    useEffect(() => {
        const checkAuth = async () => {
            if (auth.loading) return;
            if (sessionChecked) return;

            console.log('Auth Check:', {
                user: auth.user,
                loading: auth.loading,
                customerId: tableStore.customerId,
            });

            if (auth.user) {
                try {
                    const response = await customerAPI.getByUser(auth.user.id);
                    const customer = response.data?.data;

                    if (customer) {
                        // Check if there's a guest order in localStorage to transfer
                        const hasGuestOrder = localStorage.getItem(GUEST_ORDER_ID_KEY);
                        if (hasGuestOrder) {
                            await transferGuestOrdersToUser(customer.id, cart, tableStore.tableId);
                        }

                        tableStore.setCustomer(customer.id);
                        setLoggedInCustomerId(customer.id); // Store for history panel
                        setAuthInitialized(true);
                        await fillCartFromServer(customer.id, cart, false);
                    } else {
                        // User exists but no customer record, default to guest
                        tableStore.setCustomer(1);
                        setLoggedInCustomerId(null);
                        setAuthInitialized(true);
                    }
                } catch (err) {
                    console.error('Error getting customer:', err);
                    // Default to guest customer on error
                    tableStore.setCustomer(1);
                    setLoggedInCustomerId(null);
                    setAuthInitialized(true);
                }
            } else {
                // Not logged in - use guest mode (no customer ID needed)
                tableStore.setCustomer(1);
                setLoggedInCustomerId(null);
                setAuthInitialized(true);
                // Load cart from stored order ID if available
                await fillCartFromServer(1, cart, true);

                setShowAuthModal(true);
            }

            setSessionChecked(true);
        };

        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.loading, auth.user, sessionChecked]);

    // Initialize Table from URL
    useEffect(() => {
        const tableParam = searchParams.get('table');
        if (tableParam && !tableStore.tableId) {
            tableStore.setTable(tableParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Show Auth Modal when navigating to features that require login
    useEffect(() => {
        if (!sessionChecked) return;
        // Only show auth modal for history and user profile, not for ordering
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
            setLoggedInCustomerId(null); // Clear logged-in customer ID on logout

            // Clear discount codes and guest order ID from localStorage
            localStorage.removeItem('applied-discount-code');
            localStorage.removeItem(GUEST_ORDER_ID_KEY);

            // Reset to guest customer
            tableStore.setCustomer(1);
            cart.clear();
            setAuthInitialized(false);
            setSessionChecked(false);
        } catch (e) {
            console.error('logout failed', e);
        }
    };

    const pushToast = (t) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((arr) => [...arr, { id, duration: 2200, type: 'success', ...t }]);
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

                // Transfer any guest orders to the new user
                await transferGuestOrdersToUser(customerId, cart, tableStore.tableId);

                tableStore.setCustomer(customerId);
                setLoggedInCustomerId(customerId); // Store for history panel
                setAuthInitialized(true);
                await fillCartFromServer(customerId, cart, false);
                pushToast({
                    message: 'Tài khoản đã được tạo thành công!',
                    type: 'success',
                });
            } else {
                throw new Error('Failed to create customer');
            }
        } catch (err) {
            console.error('Error creating customer:', err);
            tableStore.setCustomer(1);
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

        console.log(action)

        if (action === 'skip') {
            tableStore.setCustomer(1);
            setAuthInitialized(true);
            pushToast({ message: 'Đang sử dụng tài khoản khách' });
        } else if (action === 'login' && userData) {
            try {
                console.log('User logged in:', userData);
                const response = await customerAPI.getByUser(userData.id);
                const customer = response.data?.data;

                if (customer) {
                    // Transfer any guest orders to the logged-in user
                    await transferGuestOrdersToUser(customer.id, cart, tableStore.tableId);

                    tableStore.setCustomer(customer.id);
                    setLoggedInCustomerId(customer.id); // Store for history panel
                    setAuthInitialized(true);
                    await fillCartFromServer(customer.id, cart, false);
                    pushToast({
                        message: `Xin chào, ${userData.fullName || userData.username}!`,
                    });
                }
            } catch (err) {
                console.error('Error getting customer after login:', err);
                tableStore.setCustomer(1);
                setLoggedInCustomerId(null);
                setAuthInitialized(true);
            }
        }
    };

    // Fetch Data
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

                // categories
                const mappedCategories = [
                    { id: 'all', name: 'Tất cả', sortOrder: 0, isActive: true },
                    { id: '1000', name: 'Combo', sortOrder: 1000, isActive: true },
                    ...categoriesData.map((cat) => ({
                        id: cat.id,
                        name: cat.categoryName,
                        sortOrder: cat.sortOrder ?? 0,
                        isActive: cat.isActive,
                    })),
                ].sort(
                    (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
                );
                setCategories(mappedCategories);

                // items thường
                const transformedItems = itemsData.map((item) => ({
                    id: item.id,
                    type: 'item',
                    name: item.name,
                    price: item.price,
                    category: item.categoryId || item.category?.id,
                    image:
                        item.imageUrl ||
                        item.image || // ⬅️ fallback nếu backend trả về image
                        null,
                    desc: item.description || '',
                    isAvailable: item.isActive !== false,
                    sortOrder: item.sortOrder ?? 0,
                }));

                // combos
                const transformedCombos = combosData.map((combo) => ({
                    id: combo.id,
                    type: 'combo',
                    name: combo.name,
                    price: combo.price,
                    category: { id: '1000', name: 'Combo', sortOrder: 1000, isActive: true },
                    image:
                        combo.image ||
                        combo.imageUrl ||
                        null,
                    desc: combo.description || '',
                    isAvailable: combo.isActive !== false,
                    components:
                        combo.comboItems ||
                        [],
                }));

                const merged = [...transformedItems, ...transformedCombos].sort(
                    (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
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
                // Filter theo query (tìm kiếm)
                const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase());

                // Filter theo category
                let matchesCategory = false;

                if (category === 'all') {
                    // Hiển thị tất cả
                    matchesCategory = true;
                } else if (category === '1000') {
                    // Chỉ hiển thị combo
                    matchesCategory = m.type === 'combo';
                } else {
                    // Hiển thị items thuộc category cụ thể (không bao gồm combo)
                    matchesCategory = m.type === 'item' && m.category === category;
                }

                // Filter theo availability
                const isAvailable = m.isAvailable !== false;

                return matchesQuery && matchesCategory && isAvailable;
            })
            .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
    }, [query, category, menuItems]);

    // Handle Modal Overflow
    useEffect(() => {
        const modalOpen =
            active === 'cart' || !!selectedItem || !!selectedCombo || !!selectedOrder || showAuthModal;
        document.body.style.overflow = modalOpen ? 'hidden' : '';
    }, [active, selectedItem, selectedOrder, showAuthModal]);

    const handleAddToCart = (item) => {
        cart.add({
            ...item,
            components: item.components || item.items || item.comboItems || [],
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
                tableNumber={tableStore.tableId}
                onLogout={onLogout}
                onLoginClick={() => setShowAuthModal(true)}
            />

            <div className="lg:flex">
                <Sidebar active={active} onNavigate={setActive} />

                <main className="flex-1 lg:px-8 lg:py-6">
                    {/* Search + Categories */}
                    {active === 'menu' && (
                        <section className="px-4 lg:px-0 pt-4 pb-4 lg:mb-6 animate-fade-in">
                            <div className="max-w-6xl mx-auto">
                                {/* Table Info Banner */}
                                {tableStore.tableId && (
                                    <div
                                        className={`${tone.card} rounded-2xl p-4 mb-4 flex items-center gap-3`}
                                    >
                                        <MapPin
                                            size={20}
                                            className="text-orange-600"
                                        />
                                        <div>
                                            <div className="font-semibold text-orange-700">
                                                Bàn số {tableStore.tableId}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {tableStore.customerId === 1
                                                    ? 'Khách'
                                                    : 'Thành viên'}
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
                                            onClick={() => setCategory(c.id)}
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

                    {/* Content Area */}
                    <div className="px-4 lg:px-0 pb-28 lg:pb-8">
                        <div className="max-w-6xl mx-auto">
                            {active === 'menu' && (
                                <>
                                    {loading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <div className="text-center">
                                                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
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
                                                            m.type === 'combo'
                                                                ? setSelectedCombo(m)
                                                                : setSelectedItem(m)
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
                                    <h2 className="text-2xl font-bold">Đơn hàng hiện tại</h2>
                                    <OrderReview
                                        customerId={tableStore.customerId || 1}
                                        tableId={tableStore.tableId}
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

            <CartDrawer
                open={active === 'cart'}
                onClose={() => setActive('menu')}
                cart={cart}
                customerId={tableStore.customerId}
                tableId={tableStore.tableId}
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
                tableNumber={tableStore.tableId}
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
