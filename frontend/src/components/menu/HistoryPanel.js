import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, History as HistoryIcon } from 'lucide-react';
import { orderAPI, orderDetailAPI, customerAPI } from '@/lib/api';

const tone = { card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm' };

export default function HistoryPanel({ onOpenDetail, auth, customerId }) {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // trạng thái khi đang mở 1 order (để show spinner/disable nút)
    const [openingId, setOpeningId] = useState(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            customerId = auth.user?.customerId || customerId;
            try {
                setLoading(true);
                setError(null);
                const res = await orderAPI.getByCustomer(customerId);
                console.log(customerId, res.data.data)
                const list = (res?.data?.data || []).map((o) => ({
                    ...o,
                    at: o.createdAt || o.created_at || o.at,
                    total: Number(o.totalAmount ?? o.total ?? 0),
                    status: o.orderStatus || o.status, // Map orderStatus to status for compatibility
                }));
                if (mounted) setOrders(list);
            } catch (e) {
                console.error('fetch orders failed', e);
                if (mounted) setError('Không thể tải lịch sử đơn hàng');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [customerId]);

    if (!auth.user) return null;

    const fmtDate = (value) => {
        if (!value) return '-';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '-';
        return {
            date: d.toLocaleDateString('vi-VN'),
            time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
    };

    const fmtMoney = (v) => {
        const n = Number(v ?? 0);
        if (Number.isNaN(n)) return '0₫';
        return n.toLocaleString('vi-VN') + '₫';
    };

    const statusCfg = (s) => {
        const status = s || 'unknown';
        return {
            completed: { text: 'Hoàn thành', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle },
            pending: { text: 'Đang xử lý', cls: 'bg-amber-50 text-amber-700 ring-amber-200', icon: Clock },
            confirmed: { text: 'Đã xác nhận', cls: 'bg-blue-50 text-blue-700 ring-blue-200', icon: Clock },
            cancelled: { text: 'Đã huỷ', cls: 'bg-rose-50 text-rose-700 ring-rose-200', icon: XCircle },
        }[status] || { text: 'Không rõ', cls: 'bg-slate-50 text-slate-700 ring-slate-200', icon: HistoryIcon };
    };

    const handleOpen = async (order) => {
        try {
            setOpeningId(order.id);
            // fetch chi tiết khi người dùng bấm
            const d = await orderDetailAPI.getByOrder(order.id);
            const details = d?.data?.data || [];
            const itemsCount = details.reduce((s, it) => s + Number(it.quantity || 0), 0);
            const totalFromDetails = details.reduce(
                (s, it) => s + Number(it.unitPrice ?? it.price ?? 0) * Number(it.quantity ?? 1),
                0
            );

            // gọi modal, đính kèm _details
            onOpenDetail?.({
                ...order,
                items: itemsCount,
                total: Number(order.totalAmount ?? order.total ?? totalFromDetails),
                _details: details,
            });
        } catch (e) {
            console.error('open order failed', e);
            alert('Không thể tải chi tiết đơn hàng, vui lòng thử lại.');
        } finally {
            setOpeningId(null);
        }
    };

    return (
        <section className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold">Lịch sử đặt món</h2>

            {loading ? (
                <div className="text-gray-600">Đang tải lịch sử…</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {orders.length === 0 ? (
                        <div className="text-gray-600 col-span-2">Chưa có đơn hàng</div>
                    ) : (
                        orders.map((o, idx) => {
                            const cfg = statusCfg(o.status);
                            const Icon = cfg.icon;
                            const dt = fmtDate(o.at);

                            return (
                                <button
                                    key={o.id}
                                    onClick={() => handleOpen(o)}
                                    disabled={openingId === o.id}
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                    className={`${tone.card} w-full text-left rounded-2xl p-5 flex items-center justify-between ring-1 ring-transparent hover:ring-2 hover:ring-orange-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in disabled:opacity-60 disabled:cursor-wait`}
                                >
                                    <div>
                                        <div className="font-bold text-lg mb-2">Đơn #{o.id}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-3 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} /> {dt.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} /> {dt.time}
                                            </span>
                                            {/* số món sẽ được tính khi mở modal; nếu backend đã có thì render ở đây */}
                                            {typeof o.items === 'number' && (
                                                <span className="flex items-center gap-1">• {o.items} món</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-orange-700 text-xl mb-2">
                                            {fmtMoney(o.total)}
                                        </div>
                                        <span className={`text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full ring-1 ${cfg.cls}`}>
                                            <Icon size={14} />
                                            {openingId === o.id ? 'Đang mở…' : cfg.text}
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </section>
    );
}
