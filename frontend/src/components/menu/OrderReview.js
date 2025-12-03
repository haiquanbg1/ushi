'use client';

import { useState, useEffect } from 'react';
import {
    CheckCircle,
    Clock,
    X,
    RefreshCw,
    Tag,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { orderAPI, orderDetailAPI, customerPromotionAPI } from '@/lib/api';

const GUEST_ORDER_ID_KEY = 'guest-order-id';
const DISCOUNT_STORAGE_KEY = 'applied-discount-code';

const tone = {
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
};

export default function OrderReview({ customerId, tableId, onClose }) {
    const [currentOrder, setCurrentOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Promotion state
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [showCoupons, setShowCoupons] = useState(false);
    const [availablePromotions, setAvailablePromotions] = useState([]);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');

    // Payment popup
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);

    useEffect(() => {
        fetchCurrentOrder();
        const interval = setInterval(fetchCurrentOrder, 5000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId, tableId]);

    const fetchCurrentOrder = async () => {
        const isGuest = !customerId || customerId === 1;

        try {
            setRefreshing(true);
            let order = null;

            if (isGuest) {
                const storedOrderId = typeof window !== 'undefined'
                    ? localStorage.getItem(GUEST_ORDER_ID_KEY)
                    : null;

                if (storedOrderId) {
                    try {
                        const orderRes = await orderAPI.getById(storedOrderId);
                        order = orderRes?.data?.data;

                        if (
                            order &&
                            (order.orderStatus === 'completed' ||
                                order.orderStatus === 'cancelled')
                        ) {
                            order = null;
                            localStorage.removeItem(GUEST_ORDER_ID_KEY);
                        } else if (order) {
                            const payments = order.payments || [];
                            const hasPaidPayment = payments.some(
                                (p) => p.paymentStatus === 'paid'
                            );
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
                const res = await orderAPI.getActiveUnpaid(customerId, tableId);
                order = res?.data?.data || null;
            }

            if (order && order.id) {
                setCurrentOrder(order);
                const detailsRes = await orderDetailAPI.getByOrder(order.id);
                const details = detailsRes?.data?.data || [];
                // console.log(details)
                setOrderItems(details);
            } else {
                setCurrentOrder(null);
                setOrderItems([]);
            }
        } catch (error) {
            console.error('Error fetching current order:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Load discount + promotions khi đã có order
    useEffect(() => {
        if (currentOrder) {
            loadSavedDiscount();
            fetchAvailablePromotions();
        } else {
            setAppliedCoupon(null);
            setAvailablePromotions([]);
            setPromoError('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentOrder, customerId]);

    const loadSavedDiscount = () => {
        try {
            const effectiveCustomerId = customerId || 1;
            const saved = typeof window !== 'undefined'
                ? localStorage.getItem(DISCOUNT_STORAGE_KEY)
                : null;
            if (!saved) return;

            const parsed = JSON.parse(saved);
            if (parsed.customerId === effectiveCustomerId) {
                setAppliedCoupon(parsed.coupon);
            }
        } catch (e) {
            console.error('Error loading saved discount:', e);
        }
    };

    const fetchAvailablePromotions = async () => {
        setPromoLoading(true);
        setPromoError('');
        try {
            const effectiveCustomerId = customerId || 1;
            const res = await customerPromotionAPI.getCustomerPromotions(
                effectiveCustomerId,
                {}
            );

            if (res.data?.data) {
                setAvailablePromotions(res.data.data);
            } else {
                setAvailablePromotions([]);
            }
        } catch (e) {
            console.error('Error fetching promotions:', e);
            setPromoError('Không thể tải danh sách mã giảm giá');
            setAvailablePromotions([]);
        } finally {
            setPromoLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'preparing':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'ready':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'served':
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Chờ làm';
            case 'preparing':
                return 'Đang làm';
            case 'ready':
                return 'Đã xong';
            case 'served':
                return 'Đã phục vụ';
            case 'completed':
                return 'Đã giao';
            default:
                return status;
        }
    };

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => {
            return (
                sum +
                parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0, 10)
            );
        }, 0);
    };

    const getPromotionLabel = (promotion) => {
        if (promotion.type === 'percent') {
            return `Giảm ${promotion.value}%`;
        }
        return `Giảm ${promotion.value.toLocaleString('vi-VN')}đ`;
    };

    const canApplyPromotion = (promotionData) => {
        const promotion = promotionData.promotion || promotionData;
        const subtotal = calculateTotal();

        if (promotion.minOrderAmount && subtotal < promotion.minOrderAmount) {
            return {
                eligible: false,
                reason: `Cần thêm ${(promotion.minOrderAmount - subtotal).toLocaleString(
                    'vi-VN'
                )}đ`,
            };
        }

        if (!promotion.isActive) {
            return { eligible: false, reason: 'Mã đã hết hiệu lực' };
        }

        if (promotion.endDate && new Date(promotion.endDate) < new Date()) {
            return { eligible: false, reason: 'Mã đã hết hạn' };
        }

        if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
            return { eligible: false, reason: 'Mã đã hết lượt sử dụng' };
        }

        return { eligible: true };
    };

    const applyPromotion = async (promotionData) => {
        const checkResult = canApplyPromotion(promotionData);
        if (!checkResult.eligible) {
            setPromoError(checkResult.reason);
            return;
        }

        try {
            const promotion = promotionData.promotion || promotionData;
            const effectiveCustomerId = customerId || 1;
            const subtotal = calculateTotal();

            if (promotion.id) {
                const res = await customerPromotionAPI.checkEligibility(
                    effectiveCustomerId,
                    promotion.id,
                    subtotal
                );
                // console.log(res.data.data)

                if (res.data?.data?.eligible) {
                    setAppliedCoupon(promotionData);
                    localStorage.setItem(
                        DISCOUNT_STORAGE_KEY,
                        JSON.stringify({
                            customerId: effectiveCustomerId,
                            coupon: promotionData,
                        })
                    );
                    setShowCoupons(false);
                    setPromoError('');
                } else {
                    setPromoError(
                        res.data?.data?.reason || 'Không thể áp dụng mã này'
                    );
                }
            } else {
                setAppliedCoupon(promotionData);
                localStorage.setItem(
                    DISCOUNT_STORAGE_KEY,
                    JSON.stringify({
                        customerId: effectiveCustomerId,
                        coupon: promotionData,
                    })
                );
                setShowCoupons(false);
                setPromoError('');
            }
        } catch (e) {
            console.error('Error checking promotion eligibility:', e);
            setPromoError('Có lỗi xảy ra khi kiểm tra mã giảm giá');
        }
    };

    const removePromotion = () => {
        setAppliedCoupon(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(DISCOUNT_STORAGE_KEY);
        }
        setPromoError('');
    };

    const getDiscountAmount = (subtotal) => {
        if (!appliedCoupon) return 0;

        const promotion = appliedCoupon.promotion || appliedCoupon;

        if (promotion.type === 'percent') {
            const percentDiscount = Math.floor((subtotal * promotion.value) / 100);
            if (promotion.maxDiscount) {
                return Math.min(percentDiscount, promotion.maxDiscount);
            }
            return percentDiscount;
        }

        return Math.min(promotion.value, subtotal);
    };

    const handlePayment = async () => {
        if (!currentOrder) return;

        try {
            const effectiveCustomerId = customerId || 1;

            // Cập nhật order với discountAmount & totalAmount
            await orderAPI.update(currentOrder.id, {
                discountAmount: discount,
                totalAmount: total,
            });

            // Nếu có mã giảm giá, đánh dấu là đã sử dụng (optional nhưng nên có)
            if (appliedCoupon) {
                const promotion = appliedCoupon.promotion || appliedCoupon;

                if (promotion.id) {
                    await customerPromotionAPI.applyPromotion(
                        effectiveCustomerId,
                        promotion.id,
                        {
                            orderId: currentOrder.id,
                            orderAmount: subtotal,
                        }
                    );
                }

                // Xoá mã đã lưu ở localStorage sau khi dùng xong
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(DISCOUNT_STORAGE_KEY);
                }
            }

            // Sau khi update thành công, mở popup cảm ơn
            setShowPaymentPopup(true);

            // Nếu muốn sync lại UI từ server:
            // await fetchCurrentOrder();
        } catch (error) {
            console.error('Error when updating order discount/total:', error);
            // TODO: có thể show toast / error UI nếu bạn có hệ thống thông báo
        }
    };

    const subtotal = calculateTotal();
    const discount = getDiscountAmount(subtotal);
    const total = Math.max(0, subtotal - discount);

    if (loading) {
        return (
            <div className={`${tone.card} rounded-2xl p-6`}>
                <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!currentOrder) {
        return (
            <div className={`${tone.card} rounded-2xl p-6`}>
                <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-semibold">
                        Chưa có đơn hàng đang hoạt động
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        Thêm món vào giỏ hàng và đặt món để bắt đầu
                    </p>
                </div>
            </div>
        );
    }

    const processingCount = orderItems.filter(
        (i) => i.status !== 'served' && i.status !== 'completed'
    ).length;

    return (
        <>
            <div className={`${tone.card} rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">
                            Đơn #{currentOrder.id} •{' '}
                            {new Date(currentOrder.createdAt).toLocaleString('vi-VN')}
                        </p>
                        {currentOrder.table && (
                            <p className="text-xs text-gray-400">
                                Bàn {currentOrder.table.tableNumber}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchCurrentOrder}
                            disabled={refreshing}
                            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Làm mới"
                        >
                            <RefreshCw
                                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''
                                    }`}
                            />
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                    {(orderItems && []).map((item) => {
                        // xác định combo hay món thường
                        const isCombo = !!item.comboId || !!item.combo;
                        const name = isCombo
                            ? item.combo?.name || `Combo #${item.comboId}`
                            : item.item?.name || 'Món không xác định';

                        // list thành phần combo
                        const components =
                            item.comboItems ||
                            item.items ||
                            item.combo?.items ||
                            [];

                        const unitPrice = parseFloat(item.unitPrice || 0);
                        const qty = parseInt(item.quantity || 0, 10);
                        const lineTotal = unitPrice * qty;

                        return (
                            <div
                                key={item.id}
                                className="flex items-start justify-between gap-3 border border-orange-100 rounded-xl p-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-800 text-sm">
                                            {name}
                                        </span>

                                        {isCombo && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                                                Combo
                                            </span>
                                        )}

                                        <span
                                            className={`px-2 py-0.5 text-[10px] border rounded-full whitespace-nowrap ${getStatusColor(
                                                item.status || 'pending'
                                            )}`}
                                        >
                                            {getStatusText(item.status || 'pending')}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        {qty}x {unitPrice.toLocaleString('vi-VN')}đ
                                    </div>

                                    {/* Dropdown thành phần combo */}
                                    {isCombo && components && components.length > 0 && (
                                        <details className="mt-1">
                                            <summary className="text-xs text-sky-700 cursor-pointer select-none">
                                                Thành phần combo ({components ? components.length : 0})
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

                                <div className="text-right">
                                    <div className="font-semibold text-gray-800">
                                        {lineTotal.toLocaleString('vi-VN')}đ
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mã giảm giá + tổng tiền + nút thanh toán */}
                <div className="border-t pt-4 space-y-3">
                    {/* Chọn mã giảm giá */}
                    <div className="space-y-2">
                        {!appliedCoupon ? (
                            <button
                                onClick={() => setShowCoupons(!showCoupons)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed ${showCoupons
                                    ? 'border-orange-400 bg-orange-50'
                                    : 'border-orange-200 bg-white'
                                    } hover:border-orange-400 hover:bg-orange-50 transition-all`}
                            >
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-orange-600" />
                                    <span className="font-medium text-sm text-gray-700">
                                        Chọn mã giảm giá
                                    </span>
                                </div>
                                <span className="text-orange-600 text-xs font-medium">
                                    {showCoupons
                                        ? 'Đóng'
                                        : `${availablePromotions.length} mã`}
                                </span>
                            </button>
                        ) : (
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <div>
                                            <div className="text-xs text-emerald-700 font-semibold">
                                                {(
                                                    appliedCoupon.promotion ||
                                                    appliedCoupon
                                                ).name}
                                            </div>
                                            <div className="text-xs text-emerald-600">
                                                {getPromotionLabel(
                                                    appliedCoupon.promotion ||
                                                    appliedCoupon
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={removePromotion}
                                        className="text-emerald-700 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {promoError && (
                            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                                <span className="text-xs text-rose-600">
                                    {promoError}
                                </span>
                            </div>
                        )}

                        {showCoupons && !appliedCoupon && (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {promoLoading ? (
                                    <div className="text-center py-4 text-sm text-gray-600">
                                        Đang tải mã giảm giá...
                                    </div>
                                ) : availablePromotions && availablePromotions.length === 0 ? (
                                    <div className="text-center py-4 text-sm text-gray-600">
                                        Không có mã giảm giá khả dụng
                                    </div>
                                ) : (
                                    availablePromotions.map((promotionData) => {
                                        const promotion =
                                            promotionData.promotion || promotionData;
                                        const checkResult =
                                            canApplyPromotion(promotionData);
                                        const isEligible = checkResult.eligible;

                                        return (
                                            <button
                                                key={
                                                    promotionData.id || promotion.id
                                                }
                                                onClick={() =>
                                                    applyPromotion(promotionData)
                                                }
                                                disabled={!isEligible}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${isEligible
                                                    ? 'border-orange-200 bg-white hover:border-orange-400 hover:bg-orange-50'
                                                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span
                                                                className={`font-semibold ${isEligible
                                                                    ? 'text-orange-600'
                                                                    : 'text-gray-500'
                                                                    }`}
                                                            >
                                                                {promotion.name}
                                                            </span>
                                                            <span
                                                                className={`text-xs px-2 py-0.5 rounded ${isEligible
                                                                    ? 'bg-orange-100 text-orange-700'
                                                                    : 'bg-gray-100 text-gray-600'
                                                                    }`}
                                                            >
                                                                {getPromotionLabel(
                                                                    promotion
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {promotion.description ||
                                                                `Giảm cho đơn từ ${(promotion.minOrderAmount ||
                                                                    0).toLocaleString(
                                                                        'vi-VN'
                                                                    )}đ`}
                                                        </div>
                                                        {!isEligible &&
                                                            checkResult.reason && (
                                                                <div className="text-xs text-rose-600 mt-1">
                                                                    {
                                                                        checkResult.reason
                                                                    }
                                                                </div>
                                                            )}
                                                    </div>
                                                    {isEligible && (
                                                        <span className="text-orange-600 text-xs font-medium mt-0.5">
                                                            Áp dụng
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tổng tiền */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Tạm tính</span>
                            <span className="font-semibold">
                                {subtotal.toLocaleString('vi-VN')}đ
                            </span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-emerald-600">Giảm giá</span>
                                <span className="font-semibold text-emerald-600">
                                    -{discount.toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-lg pt-1 border-t border-orange-100">
                            <span className="text-gray-800 font-semibold">
                                Tổng cộng
                            </span>
                            <span className="font-bold text-orange-700 text-xl">
                                {total.toLocaleString('vi-VN')}đ
                            </span>
                        </div>
                    </div>

                    {/* Trạng thái + nút thanh toán */}
                    <div className="mt-3 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>
                                {processingCount > 0
                                    ? `${processingCount} món đang được xử lý`
                                    : 'Tất cả món đã hoàn thành'}
                            </span>
                        </div>
                        <button
                            onClick={handlePayment}
                            className={`${tone.primary} w-full py-3 rounded-xl font-semibold text-base shadow-md hover:shadow-lg active:scale-[0.98] transition-all`}
                        >
                            Thanh toán
                        </button>
                    </div>
                </div>
            </div>

            {/* Popup thanh toán */}
            {showPaymentPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowPaymentPopup(false)}
                    />
                    <div
                        className={`${tone.card} relative rounded-2xl p-6 max-w-sm w-full shadow-2xl`}
                    >
                        <button
                            onClick={() => setShowPaymentPopup(false)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="text-center">
                            <div className="text-3xl mb-3">🍜</div>
                            <p className="text-gray-800 font-semibold mb-2">
                                Ushi Mania xin cảm ơn quý khách đã sử dụng dịch vụ tại
                                nhà hàng.
                            </p>
                            <p className="text-gray-600 text-sm">
                                Quý khách vui lòng đợi một chút, nhân viên của Ushi
                                Mania sẽ gửi hóa đơn tới quý khách trong ít phút.
                            </p>
                            <button
                                onClick={() => setShowPaymentPopup(false)}
                                className={`${tone.primary} mt-4 w-full py-2.5 rounded-xl font-semibold text-sm`}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
