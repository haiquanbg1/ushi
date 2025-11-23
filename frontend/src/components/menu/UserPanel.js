import React, { useEffect, useState } from 'react';
import { userAPI, customerAPI } from '@/lib/api';

const tone = { card: 'bg-white/90 backdrop-blur-sm ring-1 ring-orange-100 shadow-sm', primary: 'bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200' };

export default function UserPanel({ auth, addToast }) {
    if (!auth.user) return null;

    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState(null);
    const [form, setForm] = useState({
        fullName: auth.user.username || '',
        phone: auth.user.phone || '',
        email: auth.user.email || '',
    });

    useEffect(() => {
        let mounted = true;
        const boot = async () => {
            try {
                setLoading(true);
                // Fetch user details
                const userRes = await userAPI.getById(auth.user.id);
                const user = userRes?.data?.data;

                // Fetch customer details
                let customerData = null;
                try {
                    const customerRes = await customerAPI.getByUser(auth.user.id);
                    customerData = customerRes?.data?.data;
                    if (mounted) {
                        setCustomer(customerData);
                    }
                } catch (e) {
                    console.error('fetch customer failed', e);
                }

                if (mounted && user) {
                    setForm({
                        fullName: customerData?.fullName || user.username || '',
                        phone: user.phone || '',
                        email: user.email || '',
                    });
                }
            } catch (e) {
                console.error('fetch user failed', e);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };
        boot();
        return () => { mounted = false; };
    }, [auth.user?.id]);

    const save = async () => {
        try {
            // Update user table first
            await userAPI.update(auth.user.id, {
                email: form.email,
                phone: form.phone,
            });

            // Update customer table if customer exists
            if (customer?.id) {
                await customerAPI.update(customer.id, {
                    fullName: form.fullName,
                });
            } else {
                // Create customer record if it doesn't exist
                try {
                    const customerRes = await customerAPI.create({
                        userId: auth.user.id,
                        fullName: form.fullName,
                        customerType: 'member',
                        loyaltyPoints: 0,
                        totalSpent: 0,
                    });
                    if (customerRes?.data?.data) {
                        setCustomer(customerRes.data.data);
                    }
                } catch (e) {
                    console.error('create customer failed', e);
                }
            }

            addToast?.({ type: 'success', message: 'Cập nhật thông tin thành công!' });
        } catch (e) {
            console.error('update profile failed', e);
            addToast?.({ type: 'error', message: 'Không thể lưu thay đổi. Vui lòng thử lại.' });
        }
    };

    return (
        <section className="space-y-4 animate-fade-in max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold">Thông tin tài khoản</h2>
            <div className={`${tone.card} rounded-2xl p-6 space-y-4`}>
                {loading ? (
                    <div className="text-gray-600">Đang tải thông tin…</div>
                ) : (
                    <>
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Họ và tên</label>
                            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full p-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Số điện thoại</label>
                            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full p-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Email</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (tuỳ chọn)" className="w-full p-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={save} className={`${tone.primary} flex-1 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]`}>Lưu thay đổi</button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
