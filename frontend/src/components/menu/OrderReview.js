'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, X, RefreshCw } from 'lucide-react';
import { orderAPI, orderDetailAPI } from '@/lib/api';

const GUEST_ORDER_ID_KEY = 'guest-order-id';

const tone = {
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
};

export default function OrderReview({ customerId, tableId, onClose }) {
    const [currentOrder, setCurrentOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCurrentOrder();
        // Auto refresh every 5 seconds
        const interval = setInterval(fetchCurrentOrder, 5000);
        return () => clearInterval(interval);
    }, [customerId, tableId]);

    const fetchCurrentOrder = async () => {
        const isGuest = !customerId || customerId === 1;

        try {
            setRefreshing(true);
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
                const res = await orderAPI.getActiveUnpaid(customerId, tableId);
                order = res?.data?.data;
            }

            if (order && order.id) {
                setCurrentOrder(order);

                // Fetch order details
                const detailsRes = await orderDetailAPI.getByOrder(order.id);
                const details = detailsRes?.data?.data || [];
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'preparing':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'ready':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'served':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-300'; // Backward compatibility
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
                return 'Đã giao'; // Backward compatibility
            default:
                return status;
        }
    };

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => {
            return sum + (parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0));
        }, 0);
    };

    if (loading) {
        return (
            <div className={`${tone.card} rounded-2xl p-6`}>
                <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
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
                    <p className="text-gray-600 text-lg font-semibold">Chưa có đơn hàng đang hoạt động</p>
                    <p className="text-gray-500 text-sm mt-2">Thêm món vào giỏ hàng và đặt món để bắt đầu</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${tone.card} rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-500 mb-1">
                        Đơn #{currentOrder.id} • {new Date(currentOrder.createdAt).toLocaleString('vi-VN')}
                    </p>
                    {currentOrder.table && (
                        <p className="text-xs text-gray-400">
                            Bàn {currentOrder.table.tableNumber}
                        </p>
                    )}
                </div>
                <button
                    onClick={fetchCurrentOrder}
                    disabled={refreshing}
                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                    title="Làm mới"
                >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {orderItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Chưa có món nào trong đơn hàng
                    </div>
                ) : (
                    orderItems.map((item, index) => (
                        <div
                            key={item.id || index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 mb-1 flex-wrap">
                                    <span className="font-semibold text-gray-800 break-words">
                                        {item.item?.name || 'Món không xác định'}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full border whitespace-nowrap ${getStatusColor(item.status || 'pending')}`}>
                                        {getStatusText(item.status || 'pending')}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {item.quantity}x {parseFloat(item.unitPrice || 0).toLocaleString('vi-VN')}đ
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-gray-800">
                                    {(parseFloat(item.unitPrice || 0) * parseInt(item.quantity || 0)).toLocaleString('vi-VN')}đ
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-orange-600">
                        {calculateTotal().toLocaleString('vi-VN')}đ
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>
                        {orderItems.filter(i => i.status !== 'served' && i.status !== 'completed').length > 0
                            ? `${orderItems.filter(i => i.status !== 'served' && i.status !== 'completed').length} món đang được xử lý`
                            : 'Tất cả món đã hoàn thành'}
                    </span>
                </div>
            </div>
        </div>
    );
}

