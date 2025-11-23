'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { staffAPI } from '@/lib/api'; // Import staffAPI

const TableManagement = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [showQRModal, setShowQRModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [pendingPayment, setPendingPayment] = useState(null);
    const [paymentData, setPaymentData] = useState({
        paidAmount: '',
        changeAmount: 0,
        paymentMethod: 'cash'
    });

    useEffect(() => {
        fetchTables();
        // Auto refresh mỗi 30 giây
        const interval = setInterval(fetchTables, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchTables = async () => {
        try {
            setError(null);
            const tablesData = await staffAPI.getAllTables();
            setTables(tablesData);
        } catch (error) {
            console.error('Error fetching tables:', error);
            setError('Không thể tải danh sách bàn. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleTableClick = async (table) => {
        if (table.status === 'available') {
            // Tạo QR code cho bàn trống
            await generateQRCode(table.tableNumber);
        } else if (table.status === 'occupied') {
            // Hiển thị chi tiết đơn hàng cho bàn có khách
            await fetchTableDetails(table);
        }
    };

    const generateQRCode = async (tableNumber) => {
        try {
            const baseUrl = window.location.origin;
            const menuUrl = `${baseUrl}/menu?table=${tableNumber}`;
            const qrDataUrl = await QRCode.toDataURL(menuUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQrCodeUrl(qrDataUrl);
            setShowQRModal(true);
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Không thể tạo mã QR');
        }
    };

    const fetchTableDetails = async (table) => {
        try {
            // Find active order for this table
            const activeOrder = await staffAPI.getActiveOrderByTable(table.id);

            if (!activeOrder) {
                alert('Bàn này chưa có đơn hàng đang hoạt động');
                return;
            }

            const orderItems = await staffAPI.getOrderItems(activeOrder.id);

            // Check if there's an invoice for this order
            let invoice = null;
            try {
                invoice = await staffAPI.getInvoiceByOrderId(activeOrder.id);
            } catch (error) {
                // Invoice doesn't exist yet, which is fine
                console.log('No invoice found for order:', activeOrder.id);
            }

            // If invoice exists, show order details (already paid)
            if (invoice) {
                setSelectedTable({
                    ...table,
                    orderId: activeOrder.id,
                    orderDetails: {
                        ...activeOrder,
                        items: orderItems,
                        totalPrice: activeOrder.totalAmount
                    },
                    invoice: invoice
                });
                setShowModal(true);
                return;
            }

            // Check for pending payments
            const payments = await staffAPI.getPaymentsByOrder(activeOrder.id);
            let pendingPayment = payments?.find(p => p.paymentStatus === 'pending');

            // If no pending payment exists, create one automatically
            if (!pendingPayment) {
                try {
                    const totalAmount = activeOrder.totalAmount || orderItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
                    const newPaymentResponse = await staffAPI.createPayment({
                        orderId: activeOrder.id,
                        amount: totalAmount,
                        paymentMethod: 'cash',
                        paymentStatus: 'pending'
                    });
                    // Handle different response structures
                    pendingPayment = newPaymentResponse?.data?.data || newPaymentResponse?.data || newPaymentResponse;
                } catch (error) {
                    console.error('Error creating payment:', error);
                    alert('Có lỗi xảy ra khi tạo yêu cầu thanh toán');
                    return;
                }
            }

            // Show payment confirmation modal directly
            setPendingPayment({
                ...pendingPayment,
                order: activeOrder
            });
            setPaymentData({
                paidAmount: pendingPayment.amount || activeOrder.totalAmount,
                changeAmount: 0,
                paymentMethod: pendingPayment.paymentMethod || 'cash'
            });
            setShowPaymentModal(true);
        } catch (error) {
            console.error('Error fetching table details:', error);
            alert('Không thể tải chi tiết đơn hàng');
        }
    };

    const updateTableStatus = async (tableId, newStatus) => {
        try {
            await staffAPI.updateTableStatus(tableId, newStatus);

            // Cập nhật state local
            setTables(tables.map(table =>
                table.id === tableId ? { ...table, status: newStatus } : table
            ));
        } catch (error) {
            console.error('Error updating table status:', error);
            alert('Không thể cập nhật trạng thái bàn');
        }
    };

    const handlePrintBill = async () => {
        if (!selectedTable?.orderDetails || !selectedTable.orderId) return;

        try {
            // First check if payment exists
            const payments = await staffAPI.getPaymentsByOrder(selectedTable.orderId);

            if (!payments || payments.length === 0 || payments.every(p => p.paymentStatus !== 'paid')) {
                alert('Vui lòng xác nhận thanh toán trước khi xuất hóa đơn!');
                return;
            }

            await staffAPI.createInvoice({ orderId: selectedTable.orderId });
            alert('Hóa đơn đã được xuất thành công!');

            // Table status will be updated automatically by the invoice service
            setShowModal(false);
            fetchTables();
        } catch (error) {
            console.error('Error printing bill:', error);
            alert('Đã có lỗi xảy ra khi xuất hóa đơn');
        }
    };

    const handleConfirmPayment = async () => {
        if (!pendingPayment) return;

        try {
            const paidAmount = parseFloat(paymentData.paidAmount);
            const amount = parseFloat(pendingPayment.amount);
            const changeAmount = paidAmount - amount;

            if (paidAmount < amount) {
                alert('Số tiền thanh toán không đủ!');
                return;
            }

            await staffAPI.confirmPayment(pendingPayment.id, {
                paidAmount: paidAmount,
                changeAmount: changeAmount,
                paymentMethod: paymentData.paymentMethod
            });

            alert('Xác nhận thanh toán thành công!');
            setShowPaymentModal(false);
            setPendingPayment(null);
            setPaymentData({ paidAmount: '', changeAmount: 0, paymentMethod: 'cash' });
            fetchTables(); // Refresh tables to update status
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Có lỗi xảy ra khi xác nhận thanh toán');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 border-green-300 hover:bg-green-200';
            case 'occupied':
                return 'bg-red-100 border-red-300 hover:bg-red-200';
            case 'reserved':
                return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
            case 'cleaning':
                return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
            default:
                return 'bg-gray-100 border-gray-300';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'available': return 'Trống';
            case 'occupied': return 'Có khách';
            case 'reserved': return 'Đã đặt';
            case 'cleaning': return 'Dọn dẹp';
            default: return status;
        }
    };

    const getItemStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'preparing': return 'bg-blue-100 text-blue-800';
            case 'ready': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getItemStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Chờ làm';
            case 'preparing': return 'Đang làm';
            case 'ready': return 'Đã xong';
            case 'completed': return 'Đã giao';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <p className="text-red-600 text-xl mb-4">{error}</p>
                    <button
                        onClick={fetchTables}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Quản lý Bàn</h2>
                <button
                    onClick={fetchTables}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    🔄 Làm mới
                </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 border-2 border-green-300 rounded"></div>
                    <span className="text-sm">Trống</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-200 border-2 border-red-300 rounded"></div>
                    <span className="text-sm">Có khách</span>
                </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {tables.map(table => (
                    <div
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        className={`${getStatusColor(table.status)} border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-md`}
                    >
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-2">Bàn {table.tableNumber}</h3>
                            <p className="text-sm text-gray-600 mb-2">{table.capacity} chỗ ngồi</p>
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white">
                                {getStatusText(table.status)}
                            </span>
                        </div>

                        <div className="mt-4">
                            <select
                                value={table.status}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    updateTableStatus(table.id, e.target.value);
                                }}
                                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <option value="available">Trống</option>
                                <option value="occupied">Có khách</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal chi tiết đơn hàng */}
            {showModal && selectedTable && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                Chi tiết Bàn {selectedTable.tableNumber}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="px-6 py-4">
                            {/* Invoice Header - Show if invoice exists */}
                            {selectedTable.invoice && (
                                <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-lg font-bold text-green-800">Hóa Đơn</h4>
                                        <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold">
                                            Đã thanh toán
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700 space-y-1">
                                        <p><span className="font-semibold">Mã hóa đơn:</span> {selectedTable.invoice.invoiceNumber}</p>
                                        <p><span className="font-semibold">Ngày xuất:</span> {new Date(selectedTable.invoice.createdAt).toLocaleString('vi-VN')}</p>
                                        {selectedTable.invoice.totalAmount && (
                                            <p><span className="font-semibold">Tổng tiền:</span> {selectedTable.invoice.totalAmount.toLocaleString('vi-VN')}đ</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mb-4 text-sm text-gray-600">
                                <p>Thời gian: {new Date(selectedTable.orderDetails?.createdAt).toLocaleString('vi-VN')}</p>
                                <p>Số chỗ: {selectedTable.capacity} người</p>
                            </div>

                            <h4 className="font-semibold mb-3">Món ăn đã gọi:</h4>
                            <div className="space-y-3 mb-4">
                                {selectedTable.orderDetails?.items?.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center border-b pb-2">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.item.name}</p>
                                            <p className="text-sm text-gray-600">
                                                Số lượng: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ
                                            </p>
                                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getItemStatusColor(item.status)}`}>
                                                {getItemStatusText(item.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Tổng cộng:</span>
                                    <span className="text-blue-600">
                                        {selectedTable.orderDetails?.totalPrice?.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-center py-4">
                                    <p className="text-gray-600 mb-2">Hóa đơn đã được xuất và thanh toán hoàn tất.</p>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            fetchTables();
                                        }}
                                        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal QR Code */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Mã QR Đặt Món</h3>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="mb-4 text-gray-600">
                                Quét mã QR để xem thực đơn và đặt món
                            </p>
                            <img
                                src={qrCodeUrl}
                                alt="QR Code"
                                className="mx-auto border-4 border-gray-200 rounded-lg"
                            />
                            <button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    const table = tables.find(t => t.status === 'available');
                                    link.download = `qr-ban-${table?.tableNumber || 'unknown'}.png`;
                                    link.href = qrCodeUrl;
                                    link.click();
                                }}
                                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                            >
                                Tải xuống QR Code
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Confirmation Modal */}
            {showPaymentModal && pendingPayment && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Xác nhận Thanh toán</h3>
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setPendingPayment(null);
                                    setPaymentData({ paidAmount: '', changeAmount: 0, paymentMethod: 'cash' });
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Đơn hàng #{pendingPayment.orderId}</p>
                                {pendingPayment.order?.table && (
                                    <p className="text-sm text-gray-600">Bàn: {pendingPayment.order.table.tableNumber}</p>
                                )}
                                <p className="text-2xl font-bold text-gray-800">
                                    {parseFloat(pendingPayment.amount).toLocaleString('vi-VN')}đ
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
                                        const amount = parseFloat(pendingPayment.amount);
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
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setPendingPayment(null);
                                        setPaymentData({ paidAmount: '', changeAmount: 0, paymentMethod: 'cash' });
                                    }}
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
};

export default TableManagement;