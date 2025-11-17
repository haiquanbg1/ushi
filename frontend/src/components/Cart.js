import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

const Cart = ({ isOpen, onClose, cart, onRemoveItem, onUpdateQuantity }) => {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);

    const promotions = [
        { code: 'GIAM10', discount: 10, type: 'percent', description: 'Giảm 10% tổng đơn' },
        { code: 'GIAM50K', discount: 50000, type: 'fixed', description: 'Giảm 50.000₫' },
        { code: 'FREESHIP', discount: 0, type: 'freeship', description: 'Miễn phí vận chuyển' }
    ];

    const getSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getDiscount = () => {
        if (!appliedPromo) return 0;
        if (appliedPromo.type === 'percent') {
            return (getSubtotal() * appliedPromo.discount) / 100;
        }
        return appliedPromo.discount;
    };

    const getTotal = () => {
        return Math.max(0, getSubtotal() - getDiscount());
    };

    const applyPromo = () => {
        const promo = promotions.find(p => p.code === promoCode.toUpperCase());
        if (promo) {
            setAppliedPromo(promo);
            alert('Áp dụng mã khuyến mãi thành công!');
        } else {
            alert('Mã khuyến mãi không hợp lệ!');
        }
        setPromoCode('');
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setShowConfirm(true);
    };

    const confirmOrder = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.');
            setShowConfirm(false);
            onClose();
            cart.forEach(item => onRemoveItem(item.id));
            setAppliedPromo(null);
        } catch (error) {
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
                <div
                    className="bg-white w-full md:w-[600px] md:max-w-[90vw] h-[85vh] md:h-auto md:max-h-[85vh] md:rounded-t-2xl md:rounded-b-2xl rounded-t-2xl flex flex-col shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 md:rounded-t-2xl rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <ShoppingCart size={28} />
                                Giỏ hàng
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {cart.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center">
                                <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">Giỏ hàng trống</p>
                                <p className="text-gray-400 text-sm mt-2">Hãy thêm món ăn vào giỏ hàng!</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                <div className="space-y-3">
                                    {cart.map(item => (
                                        <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex gap-4 items-center hover:bg-gray-100 transition-all">
                                            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                                                🍽️
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
                                                <p className="text-orange-600 font-semibold">{item.price.toLocaleString('vi-VN')}₫</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-full font-bold transition-all"
                                                >
                                                    -
                                                </button>
                                                <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition-all"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => onRemoveItem(item.id)}
                                                    className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Promo Section */}
                                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">🎁 Mã khuyến mãi</h3>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            placeholder="Nhập mã khuyến mãi"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                        <button
                                            onClick={applyPromo}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        {promotions.map(promo => (
                                            <div key={promo.code} className="flex justify-between">
                                                <span>• <strong>{promo.code}</strong>: {promo.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {appliedPromo && (
                                        <div className="mt-2 bg-green-100 text-green-700 px-3 py-2 rounded flex justify-between items-center">
                                            <span className="font-semibold">✓ {appliedPromo.description}</span>
                                            <button onClick={() => setAppliedPromo(null)} className="text-red-500 hover:text-red-700">✕</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer - Total & Checkout */}
                            <div className="border-t bg-white p-4 md:p-6">
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tạm tính:</span>
                                        <span>{getSubtotal().toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    {appliedPromo && (
                                        <div className="flex justify-between text-green-600 font-semibold">
                                            <span>Giảm giá:</span>
                                            <span>-{getDiscount().toLocaleString('vi-VN')}₫</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                                        <span>Tổng cộng:</span>
                                        <span className="text-orange-600">{getTotal().toLocaleString('vi-VN')}₫</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={loading || cart.length === 0}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Đặt hàng ngay
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Xác nhận đơn hàng</h3>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                                    <span className="text-gray-700">{item.name} x{item.quantity}</span>
                                    <span className="font-semibold text-gray-800">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính:</span>
                                <span>{getSubtotal().toLocaleString('vi-VN')}₫</span>
                            </div>
                            {appliedPromo && (
                                <div className="flex justify-between text-green-600 font-semibold">
                                    <span>Giảm giá ({appliedPromo.code}):</span>
                                    <span>-{getDiscount().toLocaleString('vi-VN')}₫</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t-2">
                                <span>Tổng thanh toán:</span>
                                <span className="text-orange-600">{getTotal().toLocaleString('vi-VN')}₫</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmOrder}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Cart;