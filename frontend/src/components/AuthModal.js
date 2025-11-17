'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

const DEFAULT_FORM = {
    phone: '',
    password: '',
    confirmPassword: '',
    username: '',
    role: 'Customer',
};

const VN_PHONE_REGEX = /^(0[35789])\d{8}$/;

export default function AuthModal({
    isOpen,
    onClose,
    initialMode = 'login',
    onSuccess, // optional: (payload) => void
}) {
    const [mode, setMode] = useState(initialMode); // 'login' | 'register'
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    // Đồng bộ mode theo initialMode mỗi khi mở modal
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setFormData(DEFAULT_FORM);
            setError('');
        }
    }, [isOpen, initialMode]);

    // Đóng modal an toàn
    const handleClose = useCallback(() => {
        setFormData(DEFAULT_FORM);
        setError('');
        onClose?.();
    }, [onClose]);

    // ESC để đóng
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, handleClose]);

    const handleInputChange = (e) => {
        setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.phone.trim()) {
            setError('Vui lòng nhập số điện thoại');
            return false;
        }
        if (!VN_PHONE_REGEX.test(formData.phone)) {
            setError('Số điện thoại không đúng định dạng (VD: 09xxxxxxxx, 03/05/07/08/09)');
            return false;
        }
        if (!formData.password) {
            setError('Vui lòng nhập mật khẩu');
            return false;
        }
        if (mode === 'register') {
            if (!formData.username.trim()) {
                setError('Vui lòng nhập họ tên');
                return false;
            }
            if (formData.password.length < 6) {
                setError('Mật khẩu phải có ít nhất 6 ký tự');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Mật khẩu xác nhận không khớp');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');
        try {
            let result;
            if (mode === 'login') {
                result = await login({
                    phone: formData.phone,
                    password: formData.password,
                });
            } else {
                // gửi cả username để giữ tương thích backend cũ
                result = await register({
                    username: formData.username,
                    phone: formData.phone,
                    password: formData.password,
                    role: formData.role,
                });
            }

            // Một số hook trả {success, data, error}; một số throw error — cả hai đều handle
            if (result?.success === false) {
                setError(result?.error || 'Có lỗi xảy ra');
                return;
            }

            onSuccess?.(result?.data || result);
            handleClose();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Có lỗi xảy ra. Vui lòng thử lại.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode((m) => (m === 'login' ? 'register' : 'login'));
        setFormData(DEFAULT_FORM);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-lg p-8 w-full max-w-md mx-4 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ tên:
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập họ tên của bạn"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại:
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Hãy nhập số điện thoại"
                            pattern="^(0[35789])\d{8}$"
                            required
                            inputMode="numeric"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu:
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập mật khẩu"
                            minLength={6}
                            required
                        />
                    </div>

                    {mode === 'register' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Xác nhận mật khẩu:
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vai trò:
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Customer">Khách hàng</option>
                                    <option value="Staff">Nhân viên</option>
                                    <option value="Admin">Quản trị viên</option>
                                </select>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                    </button>
                </form>

                <p className="text-center mt-4 text-sm text-gray-600">
                    {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
                    <span
                        onClick={toggleMode}
                        className="text-blue-500 hover:text-blue-600 cursor-pointer underline font-medium"
                    >
                        {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
                    </span>
                </p>

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    aria-label="Đóng"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
