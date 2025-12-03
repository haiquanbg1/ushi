import React, { useState, useMemo } from 'react';
import { X, Plus, ChevronDown } from 'lucide-react';

const tone = {
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
};

export default function ComboModal({ combo, open, onClose, onAdd }) {
    const [openDetails, setOpenDetails] = useState(true);

    // Chuẩn hoá list thành phần: tuỳ backend trả về
    const components = useMemo(() => {
        if (!combo) return [];
        const raw =
            combo.items ||
            combo.comboItems ||
            combo.components ||
            [];
        return raw?.map((c, idx) => ({
            _key: c.id || c.itemId || idx,           // key an toàn
            id: c.id || c.itemId,
            name: c.item?.name || c.name,
            quantity: c.quantity || 1,
            isRequired: !!c.isRequired,
            isDefault: !!c.isDefault,
        }));
    }, [combo]);

    // ❗ Hook luôn gọi xong rồi mới return null
    if (!open || !combo) return null;

    const hasImage = !!combo.image;

    const handleAdd = () => {
        onAdd?.({
            id: combo.id,
            name: combo.name,
            price: combo.price,
            image: combo.image,
            desc: combo.description,
            type: 'combo',
            components, // để cart / order review show dropdown
        });
        onClose?.();
    };

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />
            <div
                className={`${tone.card} relative rounded-3xl p-6 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto animate-scale-in`}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="space-y-5">
                    <h3 className="text-2xl font-bold pr-8">{combo.name}</h3>

                    <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
                        {hasImage ? (
                            <img
                                src={combo.image}
                                alt={combo.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full grid place-items-center text-5xl">
                                🍱
                            </div>
                        )}
                    </div>

                    {combo.description && (
                        <p className="text-gray-600 leading-relaxed">
                            {combo.description}
                        </p>
                    )}

                    {/* Dropdown thành phần combo */}
                    <div className="border border-orange-100 rounded-2xl overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setOpenDetails((v) => !v)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-orange-50/70 hover:bg-orange-50 text-sm font-medium text-orange-800"
                        >
                            <span>Thành phần combo</span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${openDetails ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {openDetails && (
                            <div className="max-h-52 overflow-y-auto divide-y divide-orange-50 bg-white">
                                {components && components.length === 0 ? (
                                    <div className="px-4 py-3 text-xs text-gray-500">
                                        Chưa có dữ liệu thành phần
                                    </div>
                                ) : (
                                    components.map((c) => (
                                        <div
                                            key={c._key}
                                            className="px-4 py-3 flex items-start justify-between gap-3 text-sm"
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">
                                                    {c.name}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    x{c.quantity}{' '}
                                                    {c.isRequired && '• Bắt buộc'}{' '}
                                                    {c.isDefault && '• Mặc định'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-orange-100">
                        <div className="text-2xl font-extrabold text-orange-700">
                            {(combo.price || 0).toLocaleString('vi-VN')}₫
                        </div>
                        <button
                            onClick={handleAdd}
                            className={`${tone.primary} px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105`}
                        >
                            <Plus size={20} /> Thêm combo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
