import React, { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const tone = { card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm', primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200', ghost: 'bg-white ring-1 ring-orange-200 text-orange-700 hover:bg-orange-50 transition-all duration-200' };

export default function AuthGateModal({ open, onClose }) {
    const auth = useAuth();
    const [tab, setTab] = useState('login');
    const [form, setForm] = useState({ username: '', phone: '', password: '', confirmPassword: '' });
    const [err, setErr] = useState('');

    const handle = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

    const submit = async () => {
        setErr('');
        const phone = form.phone.trim();
        if (!/^\+?\d{9,15}$/.test(phone)) return setErr('Số điện thoại không hợp lệ.');
        if (tab === 'login') {
            const r = await auth.login({ phone, password: form.password });
            if (!r?.success) setErr(r?.error || 'Đăng nhập thất bại');
            else onClose();
            return;
        }
        if (!form.username.trim()) return setErr('Vui lòng nhập họ tên.');
        if (form.password.length < 6) return setErr('Mật khẩu tối thiểu 6 ký tự.');
        if (form.password !== form.confirmPassword) return setErr('Mật khẩu nhập lại không khớp.');
        const r = await auth.register({ username: form.username.trim(), phone, password: form.password, confirmPassword: form.confirmPassword, role: "Customer" });
        if (!r?.success) return setErr(r?.error || 'Đăng ký thất bại');
        // Switch to login tab after successful registration
        setTab('login');
        setForm({ username: '', phone: form.phone, password: '', confirmPassword: '' }); // Clear form but keep phone
        setErr(''); // Clear any errors
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className={`${tone.card} relative rounded-3xl p-8 shadow-2xl w-full max-w-md animate-scale-in`}>
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
                <div className="mb-6 text-center">
                    <div className="text-3xl mb-3">🍜</div>
                    <div className="text-2xl font-bold mb-2">Chào mừng bạn đến Ushi Mania</div>
                    <div className="text-gray-600">Hãy đăng nhập hoặc tạo tài khoản để tiếp tục</div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                    <button onClick={() => setTab('login')} className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${tab === 'login' ? tone.primary + ' shadow-lg' : tone.ghost}`}><LogIn size={18} /> Đăng nhập</button>
                    <button onClick={() => setTab('register')} className={`py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${tab === 'register' ? tone.primary + ' shadow-lg' : tone.ghost}`}><UserPlus size={18} /> Đăng ký</button>
                </div>

                {!!err && (<div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg mb-4 animate-shake">{err}</div>)}

                {tab === 'login' ? (
                    <div className="space-y-4">
                        <input type="tel" inputMode="tel" value={form.phone} onChange={handle('phone')} placeholder="Số điện thoại" className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all" />
                        <input type="password" value={form.password} onChange={handle('password')} placeholder="Mật khẩu" className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all" />
                        <button onClick={submit} className={`${tone.primary} w-full py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]`}>Đăng nhập</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input value={form.username} onChange={handle('username')} placeholder="Họ và tên" className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all" />
                        <input type="tel" inputMode="tel" value={form.phone} onChange={handle('phone')} placeholder="Số điện thoại" className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all" />
                        <input type="password" value={form.password} onChange={handle('password')} placeholder="Mật khẩu" className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all" />
                        <input type="password" value={form.confirmPassword} onChange={handle('confirmPassword')} placeholder="Nhập lại mật khẩu" className="w-full p-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all" />
                        <button onClick={submit} className={`${tone.primary} w-full py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]`}>Tạo tài khoản</button>
                    </div>
                )}
            </div>
        </div>
    );
}
