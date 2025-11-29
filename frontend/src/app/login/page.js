'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

const VN_PHONE_REGEX = /^(0[35789])\d{8}$/;

export default function LoginPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading, login, logout } = useAuth();

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
                    setErr('Sai tài khoản hoặc mật khẩu.');
                    logout();
                    break;
            }
        }
    }, [loading, isAuthenticated, user, router]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr('');

        setSubmitting(true);

        const response = await login({ phone, password });
        const data = response;
        console.log(response);

        if (!data?.success) {
            const msg =
                data?.message ||
                data?.error ||
                'Đăng nhập thất bại';
            setErr(msg);
        }

        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-orange-50">
                <div className="text-lg text-gray-700">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col">
            {/* HEADER TRÊN CÙNG */}
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                            >
                                Ushi Mania
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* PHẦN NỘI DUNG: FORM Ở GIỮA */}
            <main className="flex-1 flex items-center justify-center p-6">
                <form
                    onSubmit={onSubmit}
                    noValidate
                    className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-orange-100 p-8 space-y-5"
                >
                    <h1 className="text-2xl font-bold text-center text-gray-900">
                        Đăng nhập
                    </h1>
                    <p className="text-center text-sm text-gray-500 mb-2">
                        Hãy đăng nhập để tiếp tục trải nghiệm Ushi Mania
                    </p>

                    {err && (
                        <div className="mb-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
                            {err}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            className="w-full rounded-xl border border-orange-200 bg-orange-50/40 px-3 py-2 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); if (err) setErr(''); }}
                            required
                            inputMode="numeric"
                            pattern="^(0[35789])\d{8}$"
                            placeholder="Hãy nhập số điện thoại"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            className="w-full rounded-xl border border-orange-200 bg-orange-50/40 px-3 py-2 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                            value={password}
                            placeholder="Hãy nhập mật khẩu"
                            onChange={(e) => { setPassword(e.target.value); if (err) setErr(''); }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-full bg-orange-500 text-white font-semibold shadow-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
                    </button>

                    <div className="text-center text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <a href="/register" className="font-medium text-orange-500 hover:text-orange-600">
                            Đăng ký
                        </a>
                    </div>
                </form>
            </main>
        </div>
    );
}
