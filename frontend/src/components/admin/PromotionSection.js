'use client';
import { useEffect, useState } from 'react';
import { Pencil, Trash2, Users, TrendingUp } from 'lucide-react';
import Modal from '../utils/Modal';
import { promotionAPI, customerPromotionAPI } from '@/lib/api';

function PromotionsSection() {
    const [promotions, setPromotions] = useState([]);
    const [open, setOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [assignmentOptions, setAssignmentOptions] = useState({
        onlyRegistered: false,
        customerType: ''
    });
    const [promotionStats, setPromotionStats] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const [form, setForm] = useState({
        name: '',
        type: 'percent',
        value: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        minOrderAmount: '',
        maxDiscount: '',
        description: '',
        isActive: true,
    });

    const load = async () => {
        try {
            setLoading(true);
            const res = await promotionAPI.getAll();
            setPromotions(res.data?.data || []);
        } catch (error) {
            console.error('Error loading promotions:', error);
            alert('Không thể tải danh sách khuyến mãi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // ==================== CRUD HANDLERS ====================
    const validateForm = () => {
        const errors = {};
        if (!form.name?.trim()) errors.name = 'Tên khuyến mãi là bắt buộc';
        if (!form.value || parseFloat(form.value) <= 0) errors.value = 'Giá trị phải lớn hơn 0';
        if (form.type === 'percent' && parseFloat(form.value) > 100) errors.value = 'Phần trăm không được vượt quá 100';
        if (!form.startDate) errors.startDate = 'Ngày bắt đầu là bắt buộc';
        if (!form.endDate) errors.endDate = 'Ngày kết thúc là bắt buộc';
        if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
            errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openModal = (promotion = null) => {
        setFormErrors({});
        if (promotion) {
            setEditingPromotion(promotion);
            setForm({
                name: promotion.name,
                type: promotion.type,
                value: promotion.value,
                startDate: promotion.startDate ? promotion.startDate.split('T')[0] : '',
                endDate: promotion.endDate ? promotion.endDate.split('T')[0] : '',
                usageLimit: promotion.usageLimit || '',
                minOrderAmount: promotion.minOrderAmount || '',
                maxDiscount: promotion.maxDiscount || '',
                description: promotion.description || '',
                isActive: promotion.isActive ?? true,
            });
        } else {
            setEditingPromotion(null);
            setForm({
                name: '',
                type: 'percent',
                value: '',
                startDate: '',
                endDate: '',
                usageLimit: '',
                minOrderAmount: '',
                maxDiscount: '',
                description: '',
                isActive: true,
            });
        }
        setOpen(true);
    };

    const savePromotion = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const data = {
                name: form.name.trim(),
                type: form.type,
                value: parseFloat(form.value),
                startDate: form.startDate,
                endDate: form.endDate,
                minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
                maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
                usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
                description: form.description.trim(),
                isActive: form.isActive,
            };

            if (editingPromotion) {
                await promotionAPI.update(editingPromotion.id, data);
            } else {
                await promotionAPI.create(data);
            }

            setOpen(false);
            setEditingPromotion(null);
            await load();
        } catch (error) {
            console.error('Error saving promotion:', error);
            alert(error.response?.data?.message || 'Không thể lưu khuyến mãi.');
        }
    };

    const deletePromotion = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa khuyến mãi này?')) return;
        try {
            await promotionAPI.delete(id);
            await load();
        } catch (error) {
            console.error('Error deleting promotion:', error);
            alert(error.response?.data?.message || 'Không thể xóa khuyến mãi.');
        }
    };

    // ==================== ASSIGNMENT HANDLERS ====================
    const openAssignModal = (promotion) => {
        setSelectedPromotion(promotion);
        setAssignmentOptions({
            onlyRegistered: false,
            customerType: ''
        });
        setAssignModalOpen(true);
    };

    const handleAssignPromotion = async () => {
        if (!selectedPromotion) return;

        try {
            setLoading(true);
            const res = await customerPromotionAPI.assignToCustomers(
                selectedPromotion.id,
                assignmentOptions
            );

            const data = res.data?.data || res.data;
            alert(data?.message || 'Đã gán khuyến mãi thành công!');

            setAssignModalOpen(false);
            setSelectedPromotion(null);
        } catch (error) {
            console.error('Error assigning promotion:', error);
            alert(error.response?.data?.message || 'Không thể gán khuyến mãi.');
        } finally {
            setLoading(false);
        }
    };

    // ==================== STATS HANDLERS ====================
    const openStatsModal = async (promotion) => {
        try {
            setSelectedPromotion(promotion);
            setLoading(true);

            const res = await promotionAPI.getStats(promotion.id);
            const data = res.data?.data || res.data;
            setPromotionStats(data);
            setStatsModalOpen(true);
        } catch (error) {
            console.error('Error fetching stats:', error);
            alert('Không thể tải thống kê.');
        } finally {
            setLoading(false);
        }
    };

    // ==================== UTILS ====================
    const formatDate = (dateString) => {
        if (!dateString) return '–';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const money = (v) => (Number(v || 0)).toLocaleString('vi-VN') + ' đ';

    if (loading && promotions.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-400">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Khuyến mãi</h2>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    + Thêm khuyến mãi
                </button>
            </div>

            {/* ====== MOBILE: Cards ====== */}
            <div className="grid gap-3 sm:hidden">
                {promotions.map((p) => (
                    <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-slate-200">{p.name}</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {p.type === 'percent' ? `${p.value}%` : money(p.value)}
                                    {p.minOrderAmount && ` • Tối thiểu ${money(p.minOrderAmount)}`}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {formatDate(p.startDate)} → {formatDate(p.endDate)}
                                </div>
                                <div className="mt-2">
                                    <span className={`text-xs px-2 py-0.5 rounded ${p.isActive
                                            ? 'bg-emerald-900/30 text-emerald-400'
                                            : 'bg-slate-800 text-slate-400'
                                        }`}>
                                        {p.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                    </span>
                                    {p.usageLimit && (
                                        <span className="text-xs text-slate-500 ml-2">
                                            {p.usedCount || 0}/{p.usageLimit} lượt
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <button
                                    onClick={() => openStatsModal(p)}
                                    className="p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-400 transition-colors"
                                    title="Thống kê"
                                >
                                    <TrendingUp className="size-4" />
                                </button>
                                <button
                                    onClick={() => openAssignModal(p)}
                                    className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 transition-colors"
                                    title="Gán khách hàng"
                                >
                                    <Users className="size-4" />
                                </button>
                                <button
                                    onClick={() => openModal(p)}
                                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                    title="Sửa"
                                >
                                    <Pencil className="size-4" />
                                </button>
                                <button
                                    onClick={() => deletePromotion(p.id)}
                                    className="p-2 rounded-lg bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 transition-colors"
                                    title="Xóa"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {promotions.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        Chưa có khuyến mãi nào. Nhấn "Thêm khuyến mãi" để bắt đầu.
                    </div>
                )}
            </div>

            {/* ====== DESKTOP: Table ====== */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-900/50 text-slate-400">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">#</th>
                            <th className="px-4 py-3 text-left font-medium">Tên</th>
                            <th className="px-4 py-3 text-left font-medium">Loại</th>
                            <th className="px-4 py-3 text-left font-medium">Giá trị</th>
                            <th className="px-4 py-3 text-left font-medium">Thời gian</th>
                            <th className="px-4 py-3 text-left font-medium">Sử dụng</th>
                            <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                            <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {promotions.map((p, i) => (
                            <tr key={p.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                                <td className="px-4 py-3 text-slate-200 font-medium">{p.name}</td>
                                <td className="px-4 py-3 text-slate-300">
                                    {p.type === 'percent' ? 'Phần trăm' : 'Số tiền'}
                                </td>
                                <td className="px-4 py-3 text-emerald-400">
                                    {p.type === 'percent' ? `${p.value}%` : money(p.value)}
                                </td>
                                <td className="px-4 py-3 text-slate-300 text-xs">
                                    {formatDate(p.startDate)}
                                    <br />
                                    {formatDate(p.endDate)}
                                </td>
                                <td className="px-4 py-3 text-slate-300">
                                    {p.usageLimit ? `${p.usedCount || 0}/${p.usageLimit}` : '∞'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${p.isActive
                                            ? 'bg-emerald-900/30 text-emerald-400'
                                            : 'bg-slate-800 text-slate-400'
                                        }`}>
                                        {p.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openStatsModal(p)}
                                            className="p-2 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-400 transition-colors"
                                            title="Thống kê"
                                        >
                                            <TrendingUp className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => openAssignModal(p)}
                                            className="p-2 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 transition-colors"
                                            title="Gán khách hàng"
                                        >
                                            <Users className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => openModal(p)}
                                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                            title="Sửa"
                                        >
                                            <Pencil className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => deletePromotion(p.id)}
                                            className="p-2 rounded-lg bg-rose-900/30 hover:bg-rose-900/50 text-rose-400 transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {promotions.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                                    Chưa có khuyến mãi nào. Nhấn "Thêm khuyến mãi" để bắt đầu.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ==================== MODAL: Tạo/Sửa khuyến mãi ==================== */}
            <Modal
                open={open}
                title={editingPromotion ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}
                onClose={() => {
                    setOpen(false);
                    setEditingPromotion(null);
                    setFormErrors({});
                }}
            >
                <form onSubmit={savePromotion} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                            Tên khuyến mãi <span className="text-rose-400">*</span>
                        </label>
                        <input
                            className={`w-full rounded-lg bg-slate-900 border px-3 py-2 text-sm ${formErrors.name ? 'border-rose-500' : 'border-slate-700'
                                }`}
                            placeholder="VD: Giảm 20% cuối tuần"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        />
                        {formErrors.name && <p className="text-xs text-rose-400 mt-1">{formErrors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                Loại <span className="text-rose-400">*</span>
                            </label>
                            <select
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                                value={form.type}
                                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                            >
                                <option value="percent">Phần trăm (%)</option>
                                <option value="amount">Số tiền (đ)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                Giá trị <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                max={form.type === 'percent' ? '100' : undefined}
                                className={`w-full rounded-lg bg-slate-900 border px-3 py-2 text-sm ${formErrors.value ? 'border-rose-500' : 'border-slate-700'
                                    }`}
                                placeholder={form.type === 'percent' ? '20' : '50000'}
                                value={form.value}
                                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                            />
                            {formErrors.value && <p className="text-xs text-rose-400 mt-1">{formErrors.value}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                Ngày bắt đầu <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="date"
                                className={`w-full rounded-lg bg-slate-900 border px-3 py-2 text-sm ${formErrors.startDate ? 'border-rose-500' : 'border-slate-700'
                                    }`}
                                value={form.startDate}
                                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                            />
                            {formErrors.startDate && <p className="text-xs text-rose-400 mt-1">{formErrors.startDate}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                Ngày kết thúc <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="date"
                                className={`w-full rounded-lg bg-slate-900 border px-3 py-2 text-sm ${formErrors.endDate ? 'border-rose-500' : 'border-slate-700'
                                    }`}
                                value={form.endDate}
                                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                            />
                            {formErrors.endDate && <p className="text-xs text-rose-400 mt-1">{formErrors.endDate}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Mô tả</label>
                        <textarea
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                            placeholder="Mô tả về khuyến mãi..."
                            rows="2"
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Đơn tối thiểu</label>
                            <input
                                type="number"
                                step="1000"
                                min="0"
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                                placeholder="100000"
                                value={form.minOrderAmount}
                                onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Giảm tối đa</label>
                            <input
                                type="number"
                                step="1000"
                                min="0"
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                                placeholder="50000"
                                value={form.maxDiscount}
                                onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Giới hạn sử dụng</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                            placeholder="100 lần"
                            value={form.usageLimit}
                            onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={form.isActive}
                            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                            className="rounded"
                        />
                        <label htmlFor="isActive" className="text-sm text-slate-300">
                            Kích hoạt khuyến mãi
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-emerald-600 py-2.5 font-medium hover:bg-emerald-700 transition-colors"
                    >
                        {editingPromotion ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi'}
                    </button>
                </form>
            </Modal>

            {/* ==================== MODAL: Gán khách hàng ==================== */}
            <Modal
                open={assignModalOpen}
                title={`Gán khuyến mãi: ${selectedPromotion?.name || ''}`}
                onClose={() => {
                    setAssignModalOpen(false);
                    setSelectedPromotion(null);
                }}
            >
                <div className="space-y-4">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-300">Chọn đối tượng khách hàng:</label>

                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                                <input
                                    type="radio"
                                    name="assignment"
                                    checked={!assignmentOptions.onlyRegistered}
                                    onChange={() => setAssignmentOptions(o => ({ ...o, onlyRegistered: false }))}
                                    className="rounded-full"
                                />
                                <div>
                                    <p className="font-medium text-slate-200">Tất cả khách hàng</p>
                                    <p className="text-xs text-slate-400">Bao gồm cả khách chưa đăng ký</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                                <input
                                    type="radio"
                                    name="assignment"
                                    checked={assignmentOptions.onlyRegistered}
                                    onChange={() => setAssignmentOptions(o => ({ ...o, onlyRegistered: true }))}
                                    className="rounded-full"
                                />
                                <div>
                                    <p className="font-medium text-slate-200">Chỉ khách đã đăng ký</p>
                                    <p className="text-xs text-slate-400">Khách hàng có tài khoản</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {assignmentOptions.onlyRegistered && (
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Loại khách hàng (tùy chọn)</label>
                            <select
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                                value={assignmentOptions.customerType}
                                onChange={(e) => setAssignmentOptions(o => ({ ...o, customerType: e.target.value }))}
                            >
                                <option value="">Tất cả loại</option>
                                <option value="regular">Regular</option>
                                <option value="vip">VIP</option>
                                <option value="member">Member</option>
                            </select>
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <button
                            onClick={() => setAssignModalOpen(false)}
                            className="flex-1 rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleAssignPromotion}
                            disabled={loading}
                            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Đang gán...' : 'Gán ngay'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ==================== MODAL: Thống kê ==================== */}
            <Modal
                open={statsModalOpen}
                title={`Thống kê: ${selectedPromotion?.name || ''}`}
                onClose={() => {
                    setStatsModalOpen(false);
                    setSelectedPromotion(null);
                    setPromotionStats(null);
                }}
            >
                {promotionStats ? (
                    <div className="space-y-4">
                        {/* Thông tin promotion */}
                        <div className="p-3 bg-slate-800 rounded-lg">
                            <p className="text-xs text-slate-400 mb-1">Khuyến mãi</p>
                            <p className="font-medium text-slate-200">{promotionStats.promotion?.name}</p>
                            <div className="flex gap-4 mt-2 text-xs text-slate-400">
                                <span>Loại: {promotionStats.promotion?.type === 'percent' ? 'Phần trăm' : 'Số tiền'}</span>
                                {promotionStats.promotion?.usageLimit && (
                                    <span>Giới hạn: {promotionStats.promotion?.usageLimit}</span>
                                )}
                            </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <p className="text-xs text-slate-400">Tổng đã gán</p>
                                <p className="text-2xl font-bold text-slate-200 mt-1">
                                    {promotionStats.stats?.totalAssigned || 0}
                                </p>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <p className="text-xs text-slate-400">Còn khả dụng</p>
                                <p className="text-2xl font-bold text-blue-400 mt-1">
                                    {promotionStats.stats?.availableCount || 0}
                                </p>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <p className="text-xs text-slate-400">Đã sử dụng</p>
                                <p className="text-2xl font-bold text-emerald-400 mt-1">
                                    {promotionStats.stats?.usedCount || 0}
                                </p>
                            </div>

                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <p className="text-xs text-slate-400">Còn lại</p>
                                <p className="text-2xl font-bold text-slate-300 mt-1">
                                    {promotionStats.stats?.remainingUsages === null
                                        ? '∞'
                                        : promotionStats.stats?.remainingUsages || 0}
                                </p>
                            </div>
                        </div>

                        {/* Total discount */}
                        <div className="p-4 bg-gradient-to-br from-rose-900/20 to-purple-900/20 rounded-lg border border-rose-800/30">
                            <p className="text-xs text-slate-400 mb-1">Tổng tiền đã giảm</p>
                            <p className="text-3xl font-bold text-rose-400">
                                {money(promotionStats.stats?.totalDiscount || 0)}
                            </p>
                        </div>

                        {/* Status breakdown */}
                        {promotionStats.stats?.statusBreakdown && (
                            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                                <p className="text-xs font-medium text-slate-400 mb-2">Chi tiết theo trạng thái:</p>
                                <div className="space-y-1 text-xs">
                                    {Object.entries(promotionStats.stats.statusBreakdown).map(([status, count]) => (
                                        <div key={status} className="flex justify-between">
                                            <span className="text-slate-400 capitalize">{status}:</span>
                                            <span className="text-slate-200 font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        Đang tải thống kê...
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default PromotionsSection;