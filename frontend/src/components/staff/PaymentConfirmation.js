'use client';

import { useState, useEffect } from 'react';
import { staffAPI } from '@/lib/api';

export default function PaymentConfirmation() {
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        paidAmount: '',
        changeAmount: 0,
        paymentMethod: 'cash'
    });

    useEffect(() => {
        fetchPendingPayments();
        const interval = setInterval(fetchPendingPayments, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchPendingPayments = async () => {
        try {
            setLoading(true);
            const payments = await staffAPI.getPaymentsByStatus('pending');
            
            // Fetch order details for each payment
            const paymentsWithOrders = await Promise.all(
                payments.map(async (payment) => {
                    try {
                        const order = await staffAPI.getOrderById(payment.orderId);
                        return {
                            ...payment,
                            order: order
                        };
                    } catch (err) {
                        console.error(`Error fetching order for payment ${payment.id}:`, err);
                        return { ...payment, order: null };
                    }
                })
            );
            
            setPendingPayments(paymentsWithOrders);
        } catch (error) {
            console.error('Error fetching pending payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!selectedPayment) return;

        try {
            const paidAmount = parseFloat(paymentData.paidAmount);
            const amount = parseFloat(selectedPayment.amount);
            const changeAmount = paidAmount - amount;

            if (paidAmount < amount) {
                alert('Số tiền thanh toán không đủ!');
                return;
            }

            await staffAPI.confirmPayment(selectedPayment.id, {
                paidAmount: paidAmount,
                changeAmount: changeAmount,
                paymentMethod: paymentData.paymentMethod
            });

            alert('Xác nhận thanh toán thành công!');
            setShowModal(false);
            setSelectedPayment(null);
            setPaymentData({ paidAmount: '', changeAmount: 0, paymentMethod: 'cash' });
            fetchPendingPayments();
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Có lỗi xảy ra khi xác nhận thanh toán');
        }
    };

    const openConfirmModal = (payment) => {
        setSelectedPayment(payment);
        setPaymentData({
            paidAmount: payment.amount,
            changeAmount: 0,
            paymentMethod: payment.paymentMethod || 'cash'
        });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Xác nhận Thanh toán</h2>
                <button
                    onClick={fetchPendingPayments}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    🔄 Làm mới
                </button>
            </div>

            {pendingPayments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">Không có thanh toán nào đang chờ xác nhận</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingPayments.map((payment) => (
                        <div
                            key={payment.id}
                            className="bg-white rounded-lg shadow-md p-4 border-2 border-yellow-300"
                        >
                            <div className="mb-3">
                                <h3 className="text-lg font-bold text-gray-800">
                                    Đơn hàng #{payment.orderId}
                                </h3>
                                {payment.order?.table && (
                                    <p className="text-sm text-gray-600">
                                        Bàn: {payment.order.table.tableNumber}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500">
                                    {new Date(payment.createdAt).toLocaleString('vi-VN')}
                                </p>
                            </div>

                            <div className="mb-3 space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng tiền:</span>
                                    <span className="font-semibold">
                                        {parseFloat(payment.amount).toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phương thức:</span>
                                    <span className="font-semibold">
                                        {payment.paymentMethod === 'cash' ? 'Tiền mặt' : 
                                         payment.paymentMethod === 'card' ? 'Thẻ' : 
                                         payment.paymentMethod === 'momo' ? 'MoMo' : 
                                         payment.paymentMethod}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => openConfirmModal(payment)}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition"
                            >
                                Xác nhận Thanh toán
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            {showModal && selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Xác nhận Thanh toán</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Đơn hàng #{selectedPayment.orderId}</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {parseFloat(selectedPayment.amount).toLocaleString('vi-VN')}đ
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số tiền nhận (đ)
                                </label>
                                <input
                                    type="number"
                                    value={paymentData.paidAmount}
                                    onChange={(e) => {
                                        const paid = parseFloat(e.target.value) || 0;
                                        const amount = parseFloat(selectedPayment.amount);
                                        setPaymentData({
                                            ...paymentData,
                                            paidAmount: e.target.value,
                                            changeAmount: Math.max(0, paid - amount)
                                        });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập số tiền nhận"
                                />
                            </div>

                            {paymentData.changeAmount > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-gray-600">Tiền thừa:</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {paymentData.changeAmount.toLocaleString('vi-VN')}đ
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phương thức thanh toán
                                </label>
                                <select
                                    value={paymentData.paymentMethod}
                                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="cash">Tiền mặt</option>
                                    <option value="card">Thẻ</option>
                                    <option value="momo">MoMo</option>
                                    <option value="banking">Chuyển khoản</option>
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmPayment}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

