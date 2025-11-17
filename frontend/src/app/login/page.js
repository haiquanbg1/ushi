'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

const VN_PHONE_REGEX = /^(0[35789])\d{8}$/;

export default function LoginPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading, login } = useAuth();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState('');

    useEffect(() => {
        console.log(loading, isAuthenticated, user);
        if (!loading && isAuthenticated && user) {
            switch (user.role.roleName) {
                case 'Admin':
                    router.push('/admin'); break;
                case 'Staff':
                    router.push('/staff'); break;
                default:
                    router.push('/menu');
            }
        }
    }, [loading, isAuthenticated, user, router]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr('');

        if (!VN_PHONE_REGEX.test(phone)) {
            setErr('Số điện thoại không đúng định dạng (03/05/07/08/09)');
            return;
        }
        if (!password) {
            setErr('Vui lòng nhập mật khẩu');
            return;
        }

        setSubmitting(true);
        try {
            await login({ phone, password });
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || 'Đăng nhập thất bại';
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
                <h1 className="text-2xl font-bold text-center">Đăng nhập</h1>

                {err && <div className="text-red-600 text-sm">{err}</div>}

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
                    />
                </div>

                <button type="submit" disabled={submitting} className="btn w-full py-2">
                    {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
                </button>

                <div className="text-center text-sm">
                    Chưa có tài khoản? <a href="/register" className="underline">Đăng ký</a>
                </div>
            </form>
        </div>
    );
}
