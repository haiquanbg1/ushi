'use client';

import { useState, useEffect, useMemo } from 'react';
import { staffAPI } from '@/lib/api'; // Import staffAPI

export default function OrderTracking() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('orders'); // 'orders' | 'items'

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Auto refresh mỗi 30s
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            setError(null);
            // Lấy orders hôm nay
            const ordersData = await staffAPI.getTodayOrders();

            // Với mỗi order, lấy thêm order details (items)
            const ordersWithItems = await Promise.all(
                ordersData.map(async (order) => {
                    try {
                        const items = await staffAPI.getOrderItems(order.id);
                        return {
                            ...order,
                            items: items || []
                        };
                    } catch (err) {
                        console.error(`Error fetching items for order ${order.id}:`, err);
                        return {
                            ...order,
                            items: []
                        };
                    }
                })
            );
            console.log(ordersWithItems)
            setOrders(ordersWithItems);
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
            setError('Không thể tải đơn hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const updateItemStatus = async (orderId, itemId, newStatus) => {
        try {
            await staffAPI.updateOrderItemStatus(itemId, newStatus);

            // Cập nhật state local
            setOrders(prev =>
                prev.map(order =>
                    order.id === orderId
                        ? {
                            ...order,
                            items: order.items.map(i =>
                                i.id === itemId ? { ...i, status: newStatus } : i
                            )
                        }
                        : order
                )
            );

            // Kiểm tra nếu tất cả items đã served thì cập nhật order status
            const order = orders.find(o => o.id === orderId);
            if (order) {
                const allItemsServed = order.items.every(
                    item => item.id === itemId ? (newStatus === 'served' || newStatus === 'completed') : (item.status === 'served' || item.status === 'completed')
                );

                if (allItemsServed && (newStatus === 'served' || newStatus === 'completed')) {
                    // Update order status to confirmed (ready for payment)
                    await staffAPI.updateOrderStatus(orderId, 'confirmed');
                }
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
            alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
        }
    };

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            pending: 'preparing',
            preparing: 'ready',
            ready: 'served',  // Changed from 'completed' to match model enum
            served: 'served'  // served is the final status
        };
        return statusFlow[currentStatus] || currentStatus;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            preparing: 'bg-blue-100 text-blue-800 border-blue-300',
            ready: 'bg-green-100 text-green-800 border-green-300',
            served: 'bg-gray-100 text-gray-800 border-gray-300',
            completed: 'bg-gray-100 text-gray-800 border-gray-300', // Keep for backward compatibility
            cancelled: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const statusText = {
            pending: 'Chờ làm',
            preparing: 'Đang làm',
            ready: 'Đã xong',
            served: 'Đã phục vụ',
            completed: 'Hoàn thành', // Keep for backward compatibility
            cancelled: 'Đã hủy',
        };
        return statusText[status] || status;
    };

    // Sắp xếp orders theo thời gian tạo
    const ordersSorted = useMemo(
        () => [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
        [orders]
    );

    // Lọc orders theo trạng thái món
    const filteredOrders = useMemo(() => {
        return ordersSorted.filter(order => {
            if (filter === 'all') return order.items?.some(i => i.status !== 'served' && i.status !== 'completed');
            return order.items?.some(i => i.status === filter);
        });
    }, [ordersSorted, filter]);

    // Tạo danh sách tất cả items
    const allItemsSorted = useMemo(() => {
        const items = ordersSorted.flatMap(order =>
            (order.items || []).map(item => ({
                ...item,
                orderId: order.id,
                tableNumber: order.table.tableNumber,
                customerNotes: order.customerNotes,
                orderCreatedAt: order.createdAt
            }))
        );
        return items.sort((a, b) => new Date(a.orderCreatedAt) - new Date(b.orderCreatedAt));
    }, [ordersSorted]);

    const filteredItems = useMemo(() => {
        if (filter === 'all') return allItemsSorted.filter(i => i.status !== 'served' && i.status !== 'completed');
        return allItemsSorted.filter(i => i.status === filter);
    }, [allItemsSorted, filter]);

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
                        onClick={fetchOrders}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* View mode toggle */}
            <div className="flex space-x-2">
                <button
                    onClick={() => setViewMode('orders')}
                    className={`px-4 py-2 rounded-lg font-semibold ${viewMode === 'orders'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Xem theo Đơn hàng
                </button>
                <button
                    onClick={() => setViewMode('items')}
                    className={`px-4 py-2 rounded-lg font-semibold ${viewMode === 'items'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Xem theo Món ăn
                </button>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg ${filter === 'all'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Tất cả
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg ${filter === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                >
                    Chờ làm
                </button>
                <button
                    onClick={() => setFilter('preparing')}
                    className={`px-4 py-2 rounded-lg ${filter === 'preparing'
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                >
                    Đang làm
                </button>
                <button
                    onClick={() => setFilter('ready')}
                    className={`px-4 py-2 rounded-lg ${filter === 'ready'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                >
                    Đã xong
                </button>
            </div>

            {/* Hiển thị theo Đơn hàng */}
            {viewMode === 'orders' && (
                <>
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 text-lg">Không có đơn hàng nào</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">
                                                Bàn {order.table.tableNumber || 'N/A'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>

                                    {order.customerNotes && (
                                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                            <p className="text-sm text-yellow-800">
                                                <span className="font-semibold">Yêu cầu:</span> {order.customerNotes}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mb-3 max-h-48 overflow-y-auto">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Món ăn:</h4>
                                        <ul className="space-y-2">
                                            {(order.items || []).map((item) => (
                                                <li key={item.item.id} className="text-sm border-b pb-2">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-medium">
                                                            {item.quantity}x {item.item.name}
                                                        </span>

                                                        {item.status !== 'served' && item.status !== 'completed' ? (
                                                            <button
                                                                onClick={() =>
                                                                    updateItemStatus(order.id, item.item.id, getNextStatus(item.status || null))
                                                                }
                                                                className={`px-2 py-1 rounded-lg text-xs font-semibold text-white transition ${item.status === 'pending'
                                                                    ? 'bg-blue-500 hover:bg-blue-600'
                                                                    : item.status === 'preparing'
                                                                        ? 'bg-green-500 hover:bg-green-600'
                                                                        : 'bg-gray-500 hover:bg-gray-600'
                                                                    }`}
                                                            >
                                                                {item.status === 'pending' && '▶ Bắt đầu'}
                                                                {item.status === 'preparing' && '✓ Xong món'}
                                                                {item.status === 'ready' && '✓ Đã phục vụ'}
                                                            </button>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-300">
                                                                Đã phục vụ
                                                            </span>
                                                        )}
                                                    </div>

                                                    {item.specialInstructions && (
                                                        <p className="text-xs text-gray-600 italic">Ghi chú: {item.specialInstructions}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500">
                                                        {item.unitPrice?.toLocaleString('vi-VN')}đ
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="border-t pt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-700">Tổng cộng:</span>
                                            <span className="text-lg font-bold text-blue-600">
                                                {order.totalPrice?.toLocaleString('vi-VN')}đ
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Hiển thị theo Món ăn */}
            {viewMode === 'items' && (
                <>
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 text-lg">Không có món ăn nào</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                            {filteredItems.map((item) => (
                                <div
                                    key={`${item.orderId}-${item.item.id}`}
                                    className={`rounded-lg shadow-md p-4 border-2 ${getStatusColor(item.status)} flex flex-col h-full`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800">{item.item.name}</h3>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">x{item.quantity}</p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                                item.status
                                            )}`}
                                        >
                                            {getStatusText(item.status)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm">
                                            <span className="font-semibold text-gray-700 mr-2">Bàn:</span>
                                            <span className="text-lg font-bold text-blue-600">{item.tableNumber}</span>
                                        </div>

                                        <div className="text-sm text-gray-600">
                                            <span className="font-semibold">Thời gian:</span>{' '}
                                            {new Date(item.orderCreatedAt).toLocaleTimeString('vi-VN')}
                                        </div>

                                        {item.note && (
                                            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                <p className="text-sm text-yellow-800">
                                                    <span className="font-semibold">Yêu cầu:</span> {item.specialInstructions}
                                                </p>
                                            </div>
                                        )}

                                        {item.customerNotes && (
                                            <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                                                <p className="text-sm text-orange-800">
                                                    <span className="font-semibold">Ghi chú đơn:</span> {item.customerNotes}
                                                </p>
                                            </div>
                                        )}

                                        <div className="text-sm font-semibold text-gray-700">
                                            Giá: {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ
                                        </div>
                                    </div>

                                    {item.status !== 'served' && item.status !== 'completed' && (
                                        <button
                                            onClick={() => updateItemStatus(item.orderId, item.item.id, getNextStatus(item.status))}
                                            className={`mt-auto w-full px-4 py-2 rounded-lg font-semibold text-white transition ${item.status === 'pending'
                                                ? 'bg-blue-500 hover:bg-blue-600'
                                                : item.status === 'preparing'
                                                    ? 'bg-green-500 hover:bg-green-600'
                                                    : 'bg-gray-500 hover:bg-gray-600'
                                                }`}
                                        >
                                            {item.status === 'pending' && '▶ Bắt đầu làm'}
                                            {item.status === 'preparing' && '✓ Đánh dấu xong'}
                                            {item.status === 'ready' && '✓ Đã phục vụ'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}