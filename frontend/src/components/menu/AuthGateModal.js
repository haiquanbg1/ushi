import React, { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const tone = {
    card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm',
    primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200',
    ghost: 'bg-white ring-1 ring-orange-200 text-orange-700 hover:bg-orange-50 transition-all duration-200',
};

export default function AuthGateModal({ open, onClose }) {
    const auth = useAuth();
    const [tab, setTab] = useState('login');

    const [loginForm, setLoginForm] = useState({
        phone: '',
        password: '',
    });

    const [registerForm, setRegisterForm] = useState({
        username: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');

    const handleLoginChange = (key) => (e) => {
        setLoginForm((s) => ({ ...s, [key]: e.target.value }));
    };

    const handleRegisterChange = (key) => (e) => {
        setRegisterForm((s) => ({ ...s, [key]: e.target.value }));
    };

    const switchTab = (nextTab) => {
        setTab(nextTab);
        setErr('');
        setMsg('');
    };

    const submit = async () => {
        setErr('');
        setMsg('');

        if (tab === 'login') {
            const phone = loginForm.phone.trim();
            if (!/^\+?\d{9,15}$/.test(phone)) return setErr('Số điện thoại không hợp lệ.');

            const r = await auth.login({
                phone,
                password: loginForm.password,
            });

            if (!r?.success) setErr(r?.error || 'Đăng nhập thất bại');
            else onClose();
            return;
        }

        // register
        const phone = registerForm.phone.trim();
        if (!/^\+?\d{9,15}$/.test(phone)) return setErr('Số điện thoại không hợp lệ.');
        if (!registerForm.username.trim()) return setErr('Vui lòng nhập họ tên.');
        if (registerForm.password.length < 6) return setErr('Mật khẩu tối thiểu 6 ký tự.');
        if (registerForm.password !== registerForm.confirmPassword)
            return setErr('Mật khẩu nhập lại không khớp.');

        const r = await auth.register({
            username: registerForm.username.trim(),
            phone,
            password: registerForm.password,
            confirmPassword: registerForm.confirmPassword,
            role: 'Customer',
        });

        if (!r?.success) return setErr(r?.error || 'Đăng ký thất bại');

        // chuyển sang login sau khi đăng ký thành công
        setTab('login');
        setErr('');
        setMsg('Đăng ký thành công, hãy đăng nhập.');

        setLoginForm({
            phone: registerForm.phone,
            password: '',
        });

        setRegisterForm({
            username: '',
            phone: '',
            password: '',
            confirmPassword: '',
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            <div className={`${tone.card} relative rounded-3xl p-8 shadow-2xl w-full max-w-md animate-scale-in`}>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6 text-center">
                    <div className="text-3xl mb-3">🍜</div>
                    <div className="text-2xl font-bold mb-2">Chào mừng bạn đến Ushi Mania</div>
                    <div className="text-gray-600">Hãy đăng nhập hoặc tạo tài khoản để tiếp tục</div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                    <button
                        onClick={() => switchTab('login')}
                        className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${tab === 'login' ? tone.primary + ' shadow-lg' : tone.ghost
                            }`}
                    >
                        <LogIn size={18} /> Đăng nhập
                    </button>

                    <button
                        onClick={() => switchTab('register')}
                        className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${tab === 'register' ? tone.primary + ' shadow-lg' : tone.ghost
                            }`}
                    >
                        <UserPlus size={18} /> Đăng ký
                    </button>
                </div>

                {!!err && (
                    <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg mb-4 animate-shake">
                        {err}
                    </div>
                )}

                {!!msg && (
                    <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg mb-4">
                        {msg}
                    </div>
                )}

                {tab === 'login' ? (
                    <div className="space-y-4">
                        <input
                            type="tel"
                            inputMode="tel"
                            value={loginForm.phone}
                            onChange={handleLoginChange('phone')}
                            placeholder="Số điện thoại"
                            className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all"
                        />

                        <input
                            type="password"
                            value={loginForm.password}
                            onChange={handleLoginChange('password')}
                            placeholder="Mật khẩu"
                            className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all"
                        />

                        <button
                            onClick={submit}
                            className={`${tone.primary} w-full py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]`}
                        >
                            Đăng nhập
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input
                            value={registerForm.username}
                            onChange={handleRegisterChange('username')}
                            placeholder="Họ và tên"
                            className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all"
                        />

                        <input
                            type="tel"
                            inputMode="tel"
                            value={registerForm.phone}
                            onChange={handleRegisterChange('phone')}
                            placeholder="Số điện thoại"
                            className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all"
                        />

                        <input
                            type="password"
                            value={registerForm.password}
                            onChange={handleRegisterChange('password')}
                            placeholder="Mật khẩu"
                            className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all"
                        />

                        <input
                            type="password"
                            value={registerForm.confirmPassword}
                            onChange={handleRegisterChange('confirmPassword')}
                            placeholder="Nhập lại mật khẩu"
                            className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all"
                        />

                        <button
                            onClick={submit}
                            className={`${tone.primary} w-full py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]`}
                        >
                            Tạo tài khoản
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
