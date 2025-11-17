'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

const VN_PHONE_REGEX = /^(0[35789])\d{8}$/;

export default function RegisterPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading, register: registerUser } = useAuth();

    const [username, setUsername] = useState(''); // họ tên
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Customer');
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr('');

        if (!username.trim()) return setErr('Vui lòng nhập họ tên');
        if (!VN_PHONE_REGEX.test(phone)) return setErr('Số điện thoại không đúng định dạng (03/05/07/08/09)');
        if (password.length < 6) return setErr('Mật khẩu phải có ít nhất 6 ký tự');
        if (password !== confirmPassword) return setErr('Mật khẩu xác nhận không khớp');

        setSubmitting(true);
        try {
            await registerUser({ username, phone, password, confirmPassword, role });
            router.push('/login');
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || 'Đăng ký thất bại';
            setErr(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-4">
                <h1 className="text-2xl font-bold text-center">Đăng ký</h1>

                {err && <div className="text-red-600 text-sm">{err}</div>}

                <div>
                    <label className="block text-sm mb-1">Họ tên</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); if (err) setErr(''); }}
                        required
                        placeholder="Hãy nhập họ tên"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Số điện thoại</label>
                    <input
                        type="tel"
                        className="w-full border rounded-lg px-3 py-2"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); if (err) setErr(''); }}
                        required
                        inputMode="numeric"
                        pattern="^(0[35789])\d{8}$"
                        placeholder="Hãy nhập số điện thoại"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Mật khẩu</label>
                    <input
                        type="password"
                        className="w-full border rounded-lg px-3 py-2"
                        value={password}
                        placeholder='Hãy nhập mật khẩu'
                        onChange={(e) => { setPassword(e.target.value); if (err) setErr(''); }}
                        required
                        minLength={6}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Xác nhận mật khẩu</label>
                    <input
                        type="password"
                        className="w-full border rounded-lg px-3 py-2"
                        value={confirmPassword}
                        placeholder='Nhập lại mật khẩu'
                        onChange={(e) => { setConfirmPassword(e.target.value); if (err) setErr(''); }}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Vai trò</label>
                    <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="Customer">Khách hàng</option>
                        <option value="Staff">Nhân viên</option>
                        <option value="Admin">Quản trị viên</option>
                    </select>
                </div>

                <button type="submit" disabled={submitting} className="btn w-full py-2">
                    {submitting ? 'Đang tạo tài khoản…' : 'Đăng ký'}
                </button>

                <div className="text-center text-sm">
                    Đã có tài khoản? <a href="/login" className="underline">Đăng nhập</a>
                </div>
            </form>
        </div>
    );
}
