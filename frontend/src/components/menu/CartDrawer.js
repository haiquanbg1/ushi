import React, { useMemo, useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { orderAPI, orderDetailAPI, customerAPI, tableAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const tone = {
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
    ghost: 'bg-white ring-1 ring-orange-200 text-orange-700 hover:bg-orange-50 transition-all duration-200',
};

const GUEST_ORDER_ID_KEY = 'guest-order-id';

export default function CartDrawer({ open, onClose, cart, tableId }) {
    const [placing, setPlacing] = useState(false);
    const auth = useAuth();

    const subtotal = useMemo(
        () => cart.items.reduce((s, i) => s + i.price * i.quantity, 0),
        [cart.items]
    );

    const money = (v) => (Number(v || 0)).toLocaleString('vi-VN') + '₫';

    const handlePlaceOrder = async () => {
        if (cart.items.length === 0) return;

        const order = await orderAPI.getByTableActive(tableId);

        setPlacing(true);
        try {
            const existingOrder = order?.data?.data;
            console.log(existingOrder)
            let newOrder;

            if (existingOrder && existingOrder.id) {
                // Lấy status đúng field
                const status = existingOrder.orderStatus || existingOrder.status;

                // Nếu order đang pending (chưa xử lý/đang chờ thanh toán...)
                if (status === 'confirmed') {
                    alert('Bạn phải thanh toán hóa đơn trước');
                    setPlacing(false);
                    return;
                }

                // Merge items
                const itemsToAdd = cart?.items?.map((i) =>
                    i.type === 'combo'
                        ? {
                            comboId: i.id,
                            quantity: i.quantity,
                            unitPrice: i.price,
                        }
                        : {
                            itemId: i.id,
                            quantity: i.quantity,
                            unitPrice: i.price,
                        }
                );

                // console.log(itemsToAdd)

                const addItemsRes = await orderAPI.addItems(
                    existingOrder.id,
                    itemsToAdd
                );
                const order = addItemsRes?.data?.data;
                if (!order?.id) throw new Error('Không thể thêm món vào đơn hàng');
            } else {
                const createRes = await orderAPI.create({
                    tableId: tableId ?? null,
                    totalAmount: subtotal,
                    orderStatus: 'pending',
                });
                console.log(createRes.data.data.id)
                const order = createRes?.data?.data;
                if (!order?.id) throw new Error('Không tạo được đơn hàng');

                // Tạo chi tiết order lần đầu (item / combo)
                await Promise.all(
                    cart?.items?.map((i) =>
                        orderDetailAPI.create(
                            i.type === 'combo'
                                ? {
                                    orderId: order.id,
                                    comboId: i.id,
                                    quantity: i.quantity,
                                    unitPrice: i.price,
                                }
                                : {
                                    orderId: order.id,
                                    itemId: i.id,
                                    quantity: i.quantity,
                                    unitPrice: i.price,
                                }
                        )
                    )
                );

                newOrder = order;
            }

            cart.clear();
            onClose?.();
            const message = existingOrder
                ? `Đã thêm món vào đơn #${existingOrder.id}. Cảm ơn bạn!`
                : `Đã tạo đơn #${newOrder.id}. Cảm ơn bạn!`;
            alert(message);
        } catch (e) {
            console.error('place order failed', e);
            alert('Đặt món thất bại. Vui lòng thử lại.');
        } finally {
            setPlacing(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="absolute inset-x-0 bottom-0 lg:inset-y-0 lg:right-0 lg:w-[480px] animate-slide-up lg:animate-slide-left">
                <div
                    className={`${tone.card} h-[80vh] lg:h-full rounded-t-3xl lg:rounded-none shadow-2xl flex flex-col`}
                >
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-orange-100">
                        <div className="font-bold text-lg sm:text-xl">
                            Giỏ hàng ({cart.items.length})
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {cart.items.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="py-16 text-center">
                                <div className="text-6xl mb-4">🛒</div>
                                <div className="font-semibold text-gray-600 text-lg">
                                    Giỏ hàng trống
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto -mx-4 px-4 sm:-mx-6 sm:px-6 space-y-3 mb-4">
                                {cart?.items?.map((i, idx) => {
                                    const isCombo = i.type === 'combo';
                                    const components =
                                        i.components ||
                                        i.comboItems ||
                                        i.items ||
                                        [];

                                    return (
                                        <div
                                            key={`${i.type || 'item'}-${i.id}-${idx}`}
                                            className={`${tone.card} rounded-xl sm:rounded-2xl p-3 sm:p-4`}
                                        >
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                {/* IMAGE */}
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-50 overflow-hidden flex-shrink-0 grid place-items-center">
                                                    {i.image ? (
                                                        <img
                                                            src={i.image}
                                                            alt={i.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-xl sm:text-2xl">
                                                            {isCombo ? '🧺' : '🍜'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="text-sm sm:text-base text-gray-800 leading-tight line-clamp-2">
                                                            {i.name}
                                                        </div>
                                                        {isCombo && (
                                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
                                                                Combo
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-xs sm:text-sm text-gray-500">
                                                        {money(i.price)} /{' '}
                                                        {isCombo ? 'combo' : 'món'}
                                                    </div>

                                                    {/* DROPDOWN thành phần combo */}
                                                    {isCombo && components.length > 0 && (
                                                        <details className="mt-1">
                                                            <summary className="text-xs text-sky-700 cursor-pointer select-none">
                                                                Thành phần ({components ? components.length : 0})
                                                            </summary>
                                                            <ul className="mt-1 pl-3 text-xs text-gray-600 max-h-24 overflow-y-auto border-l border-orange-100/70">
                                                                {(components ?? []).map((c, idx) => (
                                                                    <li key={c.id || c.itemId || idx}>
                                                                        • {c.item?.name || c.name}{' '}
                                                                        {c.quantity ? `x${c.quantity}` : ''}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </details>
                                                    )}
                                                </div>

                                                {/* QUANTITY + TOTAL + REMOVE */}
                                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <button
                                                            onClick={() => cart.dec?.(i.id)}
                                                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-orange-50 hover:bg-orange-100 active:scale-95 transition"
                                                        >
                                                            <Minus
                                                                size={14}
                                                                className="sm:w-4 sm:h-4"
                                                            />
                                                        </button>
                                                        <span className="w-8 text-center font-semibold text-sm sm:text-lg">
                                                            {i.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => cart.add?.(i)}
                                                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-orange-50 hover:bg-orange-100 active:scale-95 transition"
                                                        >
                                                            <Plus
                                                                size={14}
                                                                className="sm:w-4 sm:h-4"
                                                            />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-gray-700">
                                                        {(i.price * i.quantity).toLocaleString(
                                                            'vi-VN'
                                                        )}
                                                        ₫
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => cart.remove?.(i.id)}
                                                    className="ml-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex-shrink-0 self-start"
                                                >
                                                    <X className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-3 sm:pt-4 border-t border-orange-100 mt-auto sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-4 px-4 sm:-mx-6 sm:px-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">
                                        Tạm tính
                                    </span>
                                    <span className="text-lg font-bold text-orange-700">
                                        {subtotal.toLocaleString('vi-VN')}₫
                                    </span>
                                </div>

                                <div className="flex gap-3 mt-3">
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={placing || cart.items.length === 0}
                                        className={`${tone.primary} flex-1 py-3 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        {placing ? 'Đang tạo đơn...' : 'Tiến hành đặt món'}
                                    </button>
                                    <button
                                        onClick={() => cart.clear?.()}
                                        className={`${tone.ghost} px-4 py-3 rounded-xl font-semibold text-sm sm:text-base active:scale-[0.98] transition-all`}
                                    >
                                        Xoá giỏ
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
