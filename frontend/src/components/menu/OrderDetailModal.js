// OrderDetailModal.js
import React, { useMemo } from 'react';
import { X, Calendar, Package, UtensilsCrossed, StickyNote, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const tone = {
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
};

function money(v) {
    const n = Number(v ?? 0);
    return (Number.isNaN(n) ? 0 : n).toLocaleString('vi-VN') + '₫';
}

function StatusPill({ s }) {
    const map = {
        completed: { text: 'Hoàn thành', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', Icon: CheckCircle2 },
        pending: { text: 'Đang xử lý', cls: 'bg-amber-50 text-amber-700 ring-amber-200', Icon: Clock },
        confirmed: { text: 'Đã xác nhận', cls: 'bg-sky-50 text-sky-700 ring-sky-200', Icon: CheckCircle2 },
        preparing: { text: 'Đang làm', cls: 'bg-indigo-50 text-indigo-700 ring-indigo-200', Icon: Clock },
        ready: { text: 'Sẵn sàng', cls: 'bg-teal-50 text-teal-700 ring-teal-200', Icon: CheckCircle2 },
        served: { text: 'Đã phục vụ', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', Icon: CheckCircle2 },
        cancelled: { text: 'Đã huỷ', cls: 'bg-rose-50 text-rose-700 ring-rose-200', Icon: AlertCircle },
    };
    const cfg = map[s] || { text: 'Không rõ', cls: 'bg-slate-50 text-slate-700 ring-slate-200', Icon: AlertCircle };
    const I = cfg.Icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ring-1 ${cfg.cls}`}>
            <I size={14} /> {cfg.text}
        </span>
    );
}

export default function OrderDetailModal({ order, open, onClose }) {

    const details = order._details && Array.isArray(order._details) ? order._details : [];
    const when = order.at ? new Date(order.at) : null;

    const lineItems = useMemo(() => {
        if (!details || !Array.isArray(details)) return [];
        return details.map((d) => {
            const isCombo = !!d.comboId || !!d.combo;
            const name =
                (isCombo ? d?.combo?.name : d?.item?.name) ||
                (isCombo ? `Combo #${d.comboId}` : `Món #${d.itemId}`);
            const qty = Number(d.quantity ?? 1);
            const unit = Number(
                d.unitPrice ??
                (d.totalPrice && qty
                    ? Number(d.totalPrice) / qty
                    : 0),
            );
            const total = unit * qty;

            return {
                id:
                    d.id ??
                    `${isCombo ? 'c' : 'i'}-${d.itemId || d.comboId}-${Math.random() * 1e6
                    }`,
                isCombo,
                name,
                qty,
                unit,
                total,
                note: d.specialInstructions,
                status: d.status,
                components:
                    d.comboItems || d.items || d.combo?.items || [],
            };
        });
    }, [details]);

    if (!open || !order) return null;

    const sumFromLines = lineItems.reduce((s, it) => s + it.total, 0);
    const grandTotal = Number(order.totalAmount ?? order.total ?? sumFromLines);

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className={`${tone.card} relative rounded-3xl p-5 sm:p-6 shadow-2xl w-full max-w-md animate-scale-in`}>
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 sm:right-4 sm:top-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Đóng"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold">Chi tiết đơn #{order.id}</h3>
                    {when && (
                        <div className="text-gray-600 flex items-center gap-2 text-sm">
                            <Calendar size={16} /> {when.toLocaleString('vi-VN')}
                        </div>
                    )}
                </div>

                {/* Lines */}
                <div className="mt-4 max-h-[55vh] overflow-y-auto pr-1 -mr-1">
                    {lineItems.length === 0 ? (
                        <div className="text-sm text-gray-600">Không có chi tiết đơn hàng.</div>
                    ) : (
                        <ul className="space-y-3">
                            {lineItems.map((it) => (
                                <li
                                    key={it.id}
                                    className="rounded-2xl border border-orange-100/70 bg-white p-3 sm:p-4 shadow-[0_1px_0_rgba(253,186,116,.25)]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] ring-1 ${it.isCombo
                                                        ? 'bg-sky-50 text-sky-700 ring-sky-200'
                                                        : 'bg-amber-50 text-amber-700 ring-amber-200'
                                                        }`}
                                                >
                                                    {it.isCombo ? <Package size={14} /> : <UtensilsCrossed size={14} />}
                                                    {it.isCombo ? 'Combo' : 'Món'}
                                                </span>
                                                <span className="font-medium truncate">{it.name}</span>
                                            </div>

                                            {it.isCombo && it.components.length > 0 && (
                                                <details className="mt-1 text-xs text-gray-600">
                                                    <summary className="cursor-pointer select-none">
                                                        Thành phần combo ({it.components.length})
                                                    </summary>
                                                    <ul className="mt-1 pl-3 border-l border-orange-100/70 max-h-28 overflow-y-auto">
                                                        {it.components.map((c) => (
                                                            <li key={c.id || c.itemId}>
                                                                • {c.item?.name || c.name}{' '}
                                                                {c.quantity ? `x${c.quantity}` : ''}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </details>
                                            )}

                                            <div className="mt-1 text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-2">
                                                <span>Số lượng: <b>{it.qty}</b></span>
                                                <span>×</span>
                                                <span>Đơn giá: <b>{money(it.unit)}</b></span>
                                                <span className="hidden xs:inline">=</span>
                                                <span className="xs:hidden w-full"></span>
                                                <span className="font-semibold text-orange-700">{money(it.total)}</span>
                                            </div>

                                            {it.note && (
                                                <div className="mt-2 text-xs text-gray-600 flex items-start gap-1.5">
                                                    <StickyNote size={14} className="mt-0.5 shrink-0" />
                                                    <span className="whitespace-pre-wrap">{it.note}</span>
                                                </div>
                                            )}
                                        </div>

                                        {it.status && (
                                            <div className="shrink-0">
                                                <StatusPill s={it.status} />
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer total */}
                <div className="mt-4 sm:mt-5">
                    <div className={`${tone.card} rounded-xl p-3 sm:p-4 flex items-center justify-between`}>
                        <span className="text-gray-600">Tổng tiền</span>
                        <span className="font-bold text-orange-700 text-lg sm:text-xl">{money(grandTotal)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-3 sm:mt-4">
                    <button
                        className={`${tone.primary} w-full py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]`}
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
