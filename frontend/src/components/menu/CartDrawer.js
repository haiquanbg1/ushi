import React, { useMemo, useState, useEffect } from 'react';
import { X, Minus, Plus, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { promotionAPI, customerPromotionAPI, orderAPI, orderDetailAPI } from '@/lib/api';

const tone = {
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
    ghost: 'bg-white ring-1 ring-orange-200 text-orange-700 hover:bg-orange-50 transition-all duration-200',
};

const DISCOUNT_STORAGE_KEY = 'applied-discount-code';
const GUEST_ORDER_ID_KEY = 'guest-order-id';

export default function CartDrawer({ open, onClose, cart, customerId, tableId }) {
    const [placing, setPlacing] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [showCoupons, setShowCoupons] = useState(false);
    const [availablePromotions, setAvailablePromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load saved discount code on mount
    useEffect(() => {
        if (open) {
            const effectiveCustomerId = customerId || 1;
            const savedDiscount = localStorage.getItem(DISCOUNT_STORAGE_KEY);
            if (savedDiscount) {
                try {
                    const discountData = JSON.parse(savedDiscount);
                    // Only restore if it's for the same customer
                    if (discountData.customerId === effectiveCustomerId) {
                        setAppliedCoupon(discountData.coupon);
                    }
                } catch (e) {
                    console.error('Error loading saved discount:', e);
                }
            }
            fetchAvailablePromotions();
        }
    }, [open, customerId]);

    const subtotal = useMemo(() =>
        cart.items.reduce((s, i) => s + i.price * i.quantity, 0),
        [cart.items]
    );

    // Fetch promotions khi mở drawer
    useEffect(() => {
        if (open) {
            fetchAvailablePromotions();
        }
    }, [open, customerId]);

    const handlePlaceOrder = async () => {
        if (cart.items.length === 0) return;

        // Default to customer ID 1 (guest) if not provided
        const effectiveCustomerId = customerId || 1;
        const isGuest = !customerId || customerId === 1;

        setPlacing(true);
        try {
            let order;
            let existingOrder = null;

            // For guest users, check localStorage for existing order ID
            if (isGuest) {
                const storedOrderId = localStorage.getItem(GUEST_ORDER_ID_KEY);
                if (storedOrderId) {
                    try {
                        const orderRes = await orderAPI.getById(storedOrderId);
                        existingOrder = orderRes?.data?.data;
                        // Verify the order is still active and unpaid
                        if (existingOrder &&
                            existingOrder.orderStatus !== 'completed' &&
                            existingOrder.orderStatus !== 'cancelled') {
                            // Check if order has paid payments
                            const payments = existingOrder.payments || [];
                            const hasPaidPayment = payments.some(p => p.paymentStatus === 'paid');
                            if (hasPaidPayment) {
                                existingOrder = null; // Order is paid, create new one
                                localStorage.removeItem(GUEST_ORDER_ID_KEY);
                            }
                        } else {
                            existingOrder = null; // Order is completed/cancelled, create new one
                            localStorage.removeItem(GUEST_ORDER_ID_KEY);
                        }
                    } catch (e) {
                        console.error('Error fetching stored order:', e);
                        existingOrder = null;
                        localStorage.removeItem(GUEST_ORDER_ID_KEY);
                    }
                }
            } else {
                // For logged-in users, check for existing unpaid order
                const existingOrderRes = await orderAPI.getActiveUnpaid(effectiveCustomerId, tableId);
                existingOrder = existingOrderRes?.data?.data;
            }

            if (existingOrder && existingOrder.id) {
                // Merge items into existing order
                const itemsToAdd = cart.items.map(i => ({
                    itemId: i.id,
                    quantity: i.quantity,
                    unitPrice: i.price
                }));

                const addItemsRes = await orderAPI.addItems(existingOrder.id, itemsToAdd);
                order = addItemsRes?.data?.data;
                if (!order?.id) throw new Error('Không thể thêm món vào đơn hàng');
            } else {
                // Create new order
                const createRes = await orderAPI.create({
                    customerId: effectiveCustomerId,
                    tableId: tableId ?? null,
                    totalAmount: total,
                    orderStatus: 'pending'
                });
                order = createRes?.data?.data;
                if (!order?.id) throw new Error('Không tạo được đơn hàng');

                // Store order ID in localStorage for guest users
                if (isGuest) {
                    localStorage.setItem(GUEST_ORDER_ID_KEY, order.id.toString());
                }

                // 2) Create order details
                await Promise.all(
                    cart.items.map(i =>
                        orderDetailAPI.create({
                            orderId: order.id,
                            itemId: i.id,
                            quantity: i.quantity,
                            unitPrice: i.price
                        })
                    )
                );
            }

            // (Optional) apply promotion server-side ở đây nếu cần

            // 3) Done
            cart.clear();
            // Keep discount code saved for next order
            onClose?.();
            const message = existingOrder
                ? `Đã thêm món vào đơn #${order.id}. Cảm ơn bạn!`
                : `Đã tạo đơn #${order.id}. Cảm ơn bạn!`;
            alert(message);
        } catch (e) {
            console.error('place order failed', e);
            alert('Đặt món thất bại. Vui lòng thử lại.');
        } finally {
            setPlacing(false);
        }
    };

    const fetchAvailablePromotions = async () => {
        setLoading(true);
        setError('');
        try {
            // Default to customer ID 1 (guest) if not provided
            const effectiveCustomerId = customerId || 1;
            // Lấy các promotion của customer
            const response = await customerPromotionAPI.getCustomerPromotions(effectiveCustomerId, {
                status: 'available'
            });

            if (response.data?.success && response.data?.data) {
                setAvailablePromotions(response.data.data);
            } else {
                setAvailablePromotions([]);
            }
        } catch (err) {
            console.error('Error fetching promotions:', err);
            setError('Không thể tải danh sách mã giảm giá');
            setAvailablePromotions([]);
        } finally {
            setLoading(false);
        }
    };

    // Tính discount dựa trên promotion
    const discount = useMemo(() => {
        if (!appliedCoupon) return 0;

        const promotion = appliedCoupon.promotion || appliedCoupon;

        if (promotion.type === 'percent') {
            const percentDiscount = Math.floor(subtotal * promotion.value / 100);
            // Áp dụng maxDiscount nếu có
            if (promotion.maxDiscount) {
                return Math.min(percentDiscount, promotion.maxDiscount);
            }
            return percentDiscount;
        }

        // Type = 'amount'
        return Math.min(promotion.value, subtotal);
    }, [appliedCoupon, subtotal]);

    const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

    // Kiểm tra promotion có thể áp dụng không
    const canApplyPromotion = (promotionData) => {
        const promotion = promotionData.promotion || promotionData;

        // Kiểm tra minOrderAmount
        if (promotion.minOrderAmount && subtotal < promotion.minOrderAmount) {
            return {
                eligible: false,
                reason: `Cần thêm ${(promotion.minOrderAmount - subtotal).toLocaleString('vi-VN')}₫`
            };
        }

        // Kiểm tra promotion còn active
        if (!promotion.isActive) {
            return {
                eligible: false,
                reason: 'Mã đã hết hiệu lực'
            };
        }

        // Kiểm tra ngày hết hạn
        if (promotion.endDate && new Date(promotion.endDate) < new Date()) {
            return {
                eligible: false,
                reason: 'Mã đã hết hạn'
            };
        }

        // Kiểm tra usage limit
        if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
            return {
                eligible: false,
                reason: 'Mã đã hết lượt sử dụng'
            };
        }

        return { eligible: true };
    };

    // Áp dụng promotion
    const applyPromotion = async (promotionData) => {
        const checkResult = canApplyPromotion(promotionData);

        if (!checkResult.eligible) {
            setError(checkResult.reason);
            return;
        }

        try {
            // Có thể thêm API check eligibility ở đây nếu cần
            const promotion = promotionData.promotion || promotionData;

            const effectiveCustomerId = customerId || 1;

            if (promotion.id) {
                const eligibilityResponse = await customerPromotionAPI.checkEligibility(
                    effectiveCustomerId,
                    promotion.id,
                    subtotal
                );

                if (eligibilityResponse.data?.success && eligibilityResponse.data?.data?.eligible) {
                    setAppliedCoupon(promotionData);
                    // Save to localStorage
                    localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify({
                        customerId: effectiveCustomerId,
                        coupon: promotionData
                    }));
                    setShowCoupons(false);
                    setError('');
                } else {
                    setError(eligibilityResponse.data?.data?.reason || 'Không thể áp dụng mã này');
                }
            } else {
                // Fallback nếu không có promotion.id
                setAppliedCoupon(promotionData);
                localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify({
                    customerId: effectiveCustomerId,
                    coupon: promotionData
                }));
                setShowCoupons(false);
                setError('');
            }
        } catch (err) {
            console.error('Error checking promotion eligibility:', err);
            setError('Có lỗi xảy ra khi kiểm tra mã giảm giá');
        }
    };

    const removePromotion = () => {
        setAppliedCoupon(null);
        localStorage.removeItem(DISCOUNT_STORAGE_KEY);
        setError('');
    };

    // Format promotion label
    const getPromotionLabel = (promotion) => {
        if (promotion.type === 'percent') {
            return `Giảm ${promotion.value}%`;
        }
        return `Giảm ${promotion.value.toLocaleString('vi-VN')}₫`;
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="absolute inset-x-0 bottom-0 lg:inset-y-0 lg:right-0 lg:w-[480px] animate-slide-up lg:animate-slide-left">
                <div className={`${tone.card} rounded-t-3xl lg:rounded-l-3xl lg:rounded-none p-4 sm:p-6 h-[90vh] sm:h-[85vh] lg:h-full flex flex-col shadow-2xl`}>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-orange-100 flex-shrink-0">
                        <div className="font-bold text-lg sm:text-xl">Giỏ hàng ({cart.items.length})</div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={22} />
                        </button>
                    </div>

                    {cart.items.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="py-16 text-center">
                                <div className="text-6xl mb-4">🛒</div>
                                <div className="font-semibold text-gray-600 text-lg">Giỏ hàng trống</div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto -mx-4 px-4 sm:-mx-6 sm:px-6 space-y-3 mb-4">
                                {cart.items.map((i) => (
                                    <div key={i.id} className={`${tone.card} rounded-xl sm:rounded-2xl p-3 sm:p-4`}>
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 grid place-items-center text-xl sm:text-2xl flex-shrink-0">🍜</div>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="font-semibold text-sm sm:text-base text-gray-800 leading-tight line-clamp-2 mb-1">
                                                    {i.name}
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-500">
                                                    {i.price.toLocaleString('vi-VN')}₫ / món
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <button onClick={() => cart.dec(i.id)} className={`${tone.ghost} w-7 h-7 sm:w-9 sm:h-9 grid place-items-center rounded-lg hover:scale-110 transition-transform`}>
                                                        <Minus size={14} className="sm:w-4 sm:h-4" />
                                                    </button>
                                                    <span className="min-w-6 sm:min-w-8 text-center font-semibold text-sm sm:text-lg">{i.quantity}</span>
                                                    <button onClick={() => cart.add(i)} className={`${tone.primary} w-7 h-7 sm:w-9 sm:h-9 grid place-items-center rounded-lg hover:scale-110 transition-transform`}>
                                                        <Plus size={14} className="sm:w-4 sm:h-4" />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-sm sm:text-base text-orange-700">
                                                        {(i.price * i.quantity).toLocaleString('vi-VN')}₫
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => cart.remove(i.id)} className="text-rose-600 hover:bg-rose-50 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 self-start">
                                                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 sm:pt-4 border-t-2 border-orange-100 space-y-3 flex-shrink-0 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-white/95 backdrop-blur-sm">
                                {/* Phần chọn mã giảm giá */}
                                <div className="space-y-2">
                                    {!appliedCoupon ? (
                                        <button
                                            onClick={() => setShowCoupons(!showCoupons)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed ${showCoupons ? 'border-orange-400 bg-orange-50' : 'border-orange-200 bg-white'
                                                } hover:border-orange-400 hover:bg-orange-50 transition-all`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Tag size={18} className="text-orange-600" />
                                                <span className="font-medium text-sm sm:text-base text-gray-700">
                                                    Chọn mã giảm giá
                                                </span>
                                            </div>
                                            <span className="text-orange-600 text-sm font-medium">
                                                {showCoupons ? 'Đóng' : `${availablePromotions.length} mã`}
                                            </span>
                                        </button>
                                    ) : (
                                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                                                    <div>
                                                        <div className="text-xs sm:text-sm text-emerald-700 font-semibold">
                                                            {(appliedCoupon.promotion || appliedCoupon).name}
                                                        </div>
                                                        <div className="text-xs text-emerald-600">
                                                            {getPromotionLabel(appliedCoupon.promotion || appliedCoupon)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={removePromotion}
                                                    className="text-emerald-700 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error message */}
                                    {error && (
                                        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                                            <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm text-rose-600">{error}</span>
                                        </div>
                                    )}

                                    {/* Danh sách mã giảm giá */}
                                    {showCoupons && !appliedCoupon && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {loading ? (
                                                <div className="text-center py-8">
                                                    <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                                                    <div className="text-sm text-gray-600 mt-2">Đang tải...</div>
                                                </div>
                                            ) : availablePromotions.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <Tag size={32} className="text-gray-400 mx-auto mb-2" />
                                                    <div className="text-sm text-gray-600">Không có mã giảm giá</div>
                                                </div>
                                            ) : (
                                                availablePromotions.map((promotionData) => {
                                                    const promotion = promotionData.promotion || promotionData;
                                                    const checkResult = canApplyPromotion(promotionData);
                                                    const isEligible = checkResult.eligible;

                                                    return (
                                                        <button
                                                            key={promotionData.id || promotion.id}
                                                            onClick={() => applyPromotion(promotionData)}
                                                            disabled={!isEligible}
                                                            className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-all ${isEligible
                                                                ? 'border-orange-200 bg-white hover:border-orange-400 hover:bg-orange-50 cursor-pointer'
                                                                : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className={`font-bold text-xs sm:text-sm ${isEligible ? 'text-orange-600' : 'text-gray-500'
                                                                            }`}>
                                                                            {promotion.name}
                                                                        </span>
                                                                        <span className={`text-xs px-2 py-0.5 rounded ${isEligible
                                                                            ? 'bg-orange-100 text-orange-700'
                                                                            : 'bg-gray-100 text-gray-600'
                                                                            }`}>
                                                                            {getPromotionLabel(promotion)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-xs text-gray-600">
                                                                        {promotion.description ||
                                                                            `Giảm giá cho đơn từ ${(promotion.minOrderAmount || 0).toLocaleString('vi-VN')}₫`}
                                                                    </div>
                                                                    {!isEligible && checkResult.reason && (
                                                                        <div className="text-xs text-rose-600 mt-1">
                                                                            {checkResult.reason}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {isEligible && (
                                                                    <div className="text-orange-600 text-xs font-medium mt-0.5">
                                                                        Áp dụng
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Tính toán tổng tiền */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm sm:text-base">
                                        <span className="text-gray-600">Tạm tính</span>
                                        <span className="font-semibold">{subtotal.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between items-center text-sm sm:text-base">
                                            <span className="text-emerald-600">Giảm giá</span>
                                            <span className="font-semibold text-emerald-600">-{discount.toLocaleString('vi-VN')}₫</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-base sm:text-lg pt-2 border-t border-orange-100">
                                        <span className="text-gray-800 font-semibold">Tổng cộng</span>
                                        <span className="font-bold text-orange-700 text-lg sm:text-xl">{total.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={placing || cart.items.length === 0}
                                    className={`${tone.primary} w-full py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                    {placing ? 'Đang tạo đơn...' : 'Tiến hành đặt món'}
                                </button>
                                <button onClick={() => cart.clear()} className={`${tone.ghost} w-full py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base active:scale-[0.98] transition-all duration-200`}>
                                    Xoá giỏ hàng
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}