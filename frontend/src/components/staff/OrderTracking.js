'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { staffAPI, comboItemAPI } from '@/lib/api';

export default function OrderTracking() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('orders'); // 'orders' | 'items'
    const [detailTarget, setDetailTarget] = useState(null); // { item, orderInfo }

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Auto refresh mỗi 30s
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchOrders = async () => {
        try {
            setError(null);
            setLoading(true);

            // Lấy orders hôm nay
            const ordersData = await staffAPI.getTodayOrders();

            // Với mỗi order, lấy thêm order details (items)
            const ordersWithItems = await Promise.all(
                ordersData?.map(async (order) => {
                    try {
                        const items = await staffAPI.getOrderItems(order.id);
                        return {
                            ...order,
                            items: items || [],
                        };
                    } catch (err) {
                        console.error(`Error fetching items for order ${order.id}:`, err);
                        return {
                            ...order,
                            items: [],
                        };
                    }
                })
            );

            setOrders(ordersWithItems);
        } catch (err) {
            console.error('Lỗi khi tải đơn hàng:', err);
            setError('Không thể tải đơn hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const updateItemStatus = async (orderId, orderDetailId, newStatus, isCombo = false) => {
        try {
            if (isCombo) {
                await staffAPI.updateOrderComboStatus(orderDetailId, newStatus);
            } else {
                await staffAPI.updateOrderItemStatus(orderDetailId, newStatus);
            }

            // Cập nhật local state
            setOrders((prev) => {
                const updated = prev?.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            items: order?.items?.map((i) =>
                                i.id === orderDetailId ? { ...i, status: newStatus } : i
                            ),
                        }
                        : order
                );

                // Kiểm tra nếu tất cả items đã served/completed thì cập nhật order status (gửi API)
                const updatedOrder = updated.find((o) => o.id === orderId);
                if (updatedOrder) {
                    const allItemsServed = updatedOrder.items.every((item) => {
                        const effectiveStatus =
                            item.id === orderDetailId ? newStatus : item.status;
                        return effectiveStatus === 'served' || effectiveStatus === 'completed';
                    });

                    if (allItemsServed && (newStatus === 'served' || newStatus === 'completed')) {
                        // không await ở đây để tránh block UI quá nhiều
                        staffAPI.updateOrderStatus(orderId, 'confirmed').catch((e) =>
                            console.error('Error updating order status:', e)
                        );
                    }
                }

                return updated;
            });
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
            alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
        }
    };

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            pending: 'preparing',
            preparing: 'ready',
            ready: 'served', // served là trạng thái cuối
            served: 'served',
        };
        return statusFlow[currentStatus] || currentStatus;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            preparing: 'bg-blue-100 text-blue-800 border-blue-300',
            ready: 'bg-green-100 text-green-800 border-green-300',
            served: 'bg-gray-100 text-gray-800 border-gray-300',
            completed: 'bg-gray-100 text-gray-800 border-gray-300',
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
            completed: 'Hoàn thành',
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
        return ordersSorted.filter((order) => {
            if (!order.items || order.items.length === 0) return false;
            if (filter === 'all') {
                return order.items.some(
                    (i) => i.status !== 'served' && i.status !== 'completed'
                );
            }
            return order.items.some((i) => i.status === filter);
        });
    }, [ordersSorted, filter]);

    // Tạo danh sách tất cả items
    const allItemsSorted = useMemo(() => {
        const items = ordersSorted.flatMap((order) =>
            (order.items || []).map((item) => ({
                ...item,
                orderId: order.id,
                tableNumber: order.table?.tableNumber,
                customerNotes: order.customerNotes,
                orderCreatedAt: order.createdAt,
            }))
        );
        return items.sort(
            (a, b) => new Date(a.orderCreatedAt) - new Date(b.orderCreatedAt)
        );
    }, [ordersSorted]);

    const filteredItems = useMemo(() => {
        if (filter === 'all') {
            return allItemsSorted.filter(
                (i) => i.status !== 'served' && i.status !== 'completed'
            );
        }
        return allItemsSorted.filter((i) => i.status === filter);
    }, [allItemsSorted, filter]);

    // ====== RENDER ======

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
            <div className="flex flex-wrap gap-2">
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

            {/* Hiển thị theo ĐƠN HÀNG */}
            {viewMode === 'orders' && (
                <>
                    {filteredOrders && filteredOrders.length === 0 ? (
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
                                                Bàn {order.table?.tableNumber || 'N/A'}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleString(
                                                    'vi-VN'
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {order.customerNotes && (
                                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                            <p className="text-sm text-yellow-800">
                                                <span className="font-semibold">Yêu cầu:</span>{' '}
                                                {order.customerNotes}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mb-3 max-h-48 overflow-y-auto">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                            Món ăn:
                                        </h4>
                                        <ul className="space-y-2">
                                            {(order.items || []).map((item) => {
                                                const isCombo =
                                                    !!item.comboId ||
                                                    !!item.combo ||
                                                    item.itemType === 'combo';
                                                const itemName = isCombo
                                                    ? item.combo?.name ||
                                                    `Combo #${item.comboId}`
                                                    : item.item?.name ||
                                                    `Item #${item.itemId}`;

                                                return (
                                                    <li
                                                        key={item.id}
                                                        className="text-sm border-b pb-2"
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            {/* Tên món – click để xem detail */}
                                                            <button
                                                                type="button"
                                                                className="text-left font-medium hover:text-purple-600"
                                                                onClick={() =>
                                                                    setDetailTarget({
                                                                        item,
                                                                        orderInfo: {
                                                                            orderId: order.id,
                                                                            tableNumber:
                                                                                order.table
                                                                                    ?.tableNumber,
                                                                            createdAt:
                                                                                order.createdAt,
                                                                            customerNotes:
                                                                                order.customerNotes,
                                                                        },
                                                                    })
                                                                }
                                                            >
                                                                {item.quantity}x {itemName}
                                                                {isCombo && (
                                                                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
                                                                        Combo
                                                                    </span>
                                                                )}
                                                            </button>

                                                            {/* Nút update status */}
                                                            {item.status !== 'served' &&
                                                                item.status !== 'completed' ? (
                                                                <button
                                                                    onClick={() =>
                                                                        updateItemStatus(
                                                                            order.id,
                                                                            item.id,
                                                                            getNextStatus(
                                                                                item.status ||
                                                                                'pending'
                                                                            ),
                                                                            isCombo
                                                                        )
                                                                    }
                                                                    className={`px-2 py-1 rounded-lg text-xs font-semibold text-white transition ${item.status ===
                                                                        'pending'
                                                                        ? 'bg-blue-500 hover:bg-blue-600'
                                                                        : item.status ===
                                                                            'preparing'
                                                                            ? 'bg-green-500 hover:bg-green-600'
                                                                            : 'bg-gray-500 hover:bg-gray-600'
                                                                        }`}
                                                                >
                                                                    {item.status ===
                                                                        'pending' &&
                                                                        '▶ Bắt đầu'}
                                                                    {item.status ===
                                                                        'preparing' &&
                                                                        '✓ Xong món'}
                                                                    {item.status === 'ready' &&
                                                                        '✓ Đã phục vụ'}
                                                                </button>
                                                            ) : (
                                                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-300">
                                                                    Đã phục vụ
                                                                </span>
                                                            )}
                                                        </div>

                                                        {item.specialInstructions && (
                                                            <p className="text-xs text-gray-600 italic">
                                                                Ghi chú:{' '}
                                                                {item.specialInstructions}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-500">
                                                            {item.unitPrice?.toLocaleString(
                                                                'vi-VN'
                                                            )}
                                                            đ
                                                        </p>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Hiển thị theo MÓN ĂN */}
            {viewMode === 'items' && (
                <>
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

                    {filteredItems && filteredItems.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 text-lg">Không có món ăn nào</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                            {filteredItems.map((item) => {
                                const isCombo =
                                    !!item.comboId ||
                                    !!item.combo ||
                                    item.itemType === 'combo';
                                const itemName = isCombo
                                    ? item.combo?.name || `Combo #${item.comboId}`
                                    : item.item?.name || `Item #${item.itemId}`;

                                return (
                                    <div
                                        key={`${item.orderId}-${item.id}`}
                                        className={`rounded-lg shadow-md p-4 border-2 ${getStatusColor(
                                            item.status
                                        )} flex flex-col h-full`}
                                    >
                                        {/* Header: click mở detail */}
                                        <button
                                            type="button"
                                            className="flex justify-between items-start mb-3 text-left w-full"
                                            onClick={() =>
                                                setDetailTarget({
                                                    item,
                                                    orderInfo: {
                                                        orderId: item.orderId,
                                                        tableNumber: item.tableNumber,
                                                        createdAt: item.orderCreatedAt,
                                                        customerNotes: item.customerNotes,
                                                    },
                                                })
                                            }
                                        >
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800">
                                                    {itemName}
                                                    {isCombo && (
                                                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
                                                            Combo
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                                    x{item.quantity}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                                    item.status
                                                )}`}
                                            >
                                                {getStatusText(item.status)}
                                            </span>
                                        </button>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm">
                                                <span className="font-semibold text-gray-700 mr-2">
                                                    Bàn:
                                                </span>
                                                <span className="text-lg font-bold text-blue-600">
                                                    {item.tableNumber}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                <span className="font-semibold">
                                                    Thời gian:
                                                </span>{' '}
                                                {new Date(
                                                    item.orderCreatedAt
                                                ).toLocaleTimeString('vi-VN')}
                                            </div>

                                            {item.specialInstructions && (
                                                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                                                    <p className="text-sm text-yellow-800">
                                                        <span className="font-semibold">
                                                            Yêu cầu:
                                                        </span>{' '}
                                                        {item.specialInstructions}
                                                    </p>
                                                </div>
                                            )}

                                            {item.customerNotes && (
                                                <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                                                    <p className="text-sm text-orange-800">
                                                        <span className="font-semibold">
                                                            Ghi chú đơn:
                                                        </span>{' '}
                                                        {item.customerNotes}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="text-sm font-semibold text-gray-700">
                                                Giá:{' '}
                                                {(item.unitPrice * item.quantity).toLocaleString(
                                                    'vi-VN'
                                                )}
                                                đ
                                            </div>
                                        </div>

                                        {item.status !== 'served' &&
                                            item.status !== 'completed' && (
                                                <button
                                                    onClick={() =>
                                                        updateItemStatus(
                                                            item.orderId,
                                                            item.id,
                                                            getNextStatus(item.status),
                                                            isCombo
                                                        )
                                                    }
                                                    className={`mt-auto w-full px-4 py-2 rounded-lg font-semibold text-white transition ${item.status === 'pending'
                                                        ? 'bg-blue-500 hover:bg-blue-600'
                                                        : item.status === 'preparing'
                                                            ? 'bg-green-500 hover:bg-green-600'
                                                            : 'bg-gray-500 hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {item.status === 'pending' &&
                                                        '▶ Bắt đầu'}
                                                    {item.status === 'preparing' &&
                                                        '✓ Xong món'}
                                                    {item.status === 'ready' &&
                                                        '✓ Đã phục vụ'}
                                                </button>
                                            )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* MODAL xem chi tiết món / combo */}
            {detailTarget && (
                <ItemDetailModal
                    data={detailTarget}
                    onClose={() => setDetailTarget(null)}
                />
            )}
        </div>
    );
}

// ====== MODAL CHI TIẾT ITEM / COMBO ======

function ItemDetailModal({ data, onClose }) {
    const { item, orderInfo } = data;
    const isCombo =
        !!item.comboId || !!item.combo || item.itemType === 'combo';

    const itemName = isCombo
        ? item.combo?.name || `Combo #${item.comboId}`
        : item.item?.name || `Item #${item.itemId}`;

    const imageUrl = isCombo ? item.combo?.image : item.item?.image;

    const unitPrice = Number(item.unitPrice || 0);
    const quantity = Number(item.quantity || 0);
    const lineTotal = unitPrice * quantity;

    // console.log(item)
    const components =
        item.combo?.comboItems ||
        [];

    const statusTextMap = {
        pending: 'Chờ làm',
        preparing: 'Đang làm',
        ready: 'Đã xong',
        served: 'Đã phục vụ',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
    };
    const statusText = statusTextMap[item.status] || item.status;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto p-5">
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="space-y-4">
                    {/* Header */}
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-xl font-bold text-gray-900">
                                {itemName}
                                {isCombo && (
                                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 uppercase tracking-wide">
                                        Combo
                                    </span>
                                )}
                            </h2>
                            {item.status && (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                    {statusText}
                                </span>
                            )}
                        </div>
                        {orderInfo?.tableNumber && (
                            <p className="text-sm text-gray-500 mt-1">
                                Bàn{' '}
                                <span className="font-semibold text-blue-600">
                                    {orderInfo.tableNumber}
                                </span>{' '}
                                •
                                <span className="ml-1">
                                    {new Date(orderInfo.createdAt).toLocaleString(
                                        'vi-VN'
                                    )}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Image */}
                    <div className="aspect-[4/3] rounded-xl bg-gray-100 overflow-hidden">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={itemName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full grid place-items-center text-4xl">
                                {isCombo ? '🍱' : '🍜'}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        {item.specialInstructions && (
                            <div className="p-2.5 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                                <span className="font-semibold">Ghi chú món: </span>
                                {item.specialInstructions}
                            </div>
                        )}
                        {orderInfo?.customerNotes && (
                            <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-800">
                                <span className="font-semibold">Ghi chú đơn: </span>
                                {orderInfo.customerNotes}
                            </div>
                        )}
                    </div>

                    {/* Thành phần combo */}
                    {isCombo && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700">
                                Thành phần combo ({components.length})
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 bg-white">
                                {components && components.length === 0 ? (
                                    <div className="px-3 py-3 text-xs text-gray-500">
                                        Chưa có dữ liệu thành phần combo
                                    </div>
                                ) : (
                                    components.map((c, idx) => (
                                        <div
                                            key={c.id || c.itemId || idx}
                                            className="px-3 py-2 text-sm flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="text-gray-800">
                                                    {c.item?.name || c.name}
                                                </div>
                                                <div className="text-[11px] text-gray-500">
                                                    {c.isRequired && 'Bắt buộc '}
                                                    {c.isDefault && '• Mặc định'}
                                                </div>
                                            </div>
                                            <div className="text-xs font-semibold text-gray-700">
                                                x{c.quantity || 1}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between border-top pt-3 mt-2 border-t">
                        <div className="text-sm text-gray-600">
                            Đơn giá:{' '}
                            <span className="font-semibold">
                                {unitPrice.toLocaleString('vi-VN')}đ
                            </span>{' '}
                            • Số lượng:{' '}
                            <span className="font-semibold">{quantity}</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {lineTotal.toLocaleString('vi-VN')}đ
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
