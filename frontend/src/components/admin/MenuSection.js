'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import Modal from '../utils/Modal';
import { itemAPI, comboAPI, categoryAPI, comboItemAPI } from '@/lib/api';
import { useToast } from '@/components/utils/ToaskProvider';

function MenuSection() {
    const [tab, setTab] = useState('items');
    const [items, setItems] = useState([]);
    const [combos, setCombos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [openItem, setOpenItem] = useState(false);
    const [openCombo, setOpenCombo] = useState(false);
    const [openCategory, setOpenCategory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingCombo, setEditingCombo] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    // dropdown & modal combo items
    const [selectedCombo, setSelectedCombo] = useState(null);
    const [comboItemsList, setComboItemsList] = useState([]);
    const [newComboItem, setNewComboItem] = useState({
        itemId: '',
        quantity: 1,
        isRequired: false,
        isDefault: false
    });

    const [formErrors, setFormErrors] = useState({});

    const toast = useToast();

    // === FORM STATES ===
    const [itemForm, setItemForm] = useState({
        name: '',
        price: '',
        categoryId: '',
        description: '',
        imageFile: null,
        isAvailable: true,
        isActive: true,
        sortOrder: 0
    });

    const [comboForm, setComboForm] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        isActive: true
    });

    const [categoryForm, setCategoryForm] = useState({
        categoryName: '',
        description: '',
        image: '',
        sortOrder: 0,
        isActive: true
    });

    const load = async () => {
        try {
            setLoading(true);
            const [itemsData, combosData, categoriesData] = await Promise.all([
                itemAPI.getAll(),
                comboAPI.getAll(),
                categoryAPI.getAll()
            ]);
            setItems(itemsData.data.data);
            setCombos(combosData.data.data);
            setCategories(categoriesData.data.data);
        } catch (error) {
            console.error('Error loading menu data:', error);
            toast.error('Không thể tải dữ liệu. Vui lòng thử lại.', { title: 'Lỗi' });
        } finally {
            setLoading(false);
        }
    };

    const loadComboItems = async (comboId) => {
        try {
            const data = await comboAPI.getItems(comboId);
            setComboItemsList(data.data.data);
        } catch (error) {
            console.error('Error loading combo items:', error);
            toast.error('Không thể tải danh sách món trong combo.', { title: 'Lỗi' });
        }
    };

    useEffect(() => {
        load();
    }, []);

    // ==================== ITEM HANDLERS ====================
    const validateItemForm = () => {
        const errors = {};
        if (!itemForm.name?.trim()) errors.name = 'Tên món là bắt buộc';
        if (!itemForm.price || parseFloat(itemForm.price) <= 0) errors.price = 'Giá phải lớn hơn 0';
        if (!itemForm.categoryId) errors.categoryId = 'Danh mục là bắt buộc';
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error('Vui lòng kiểm tra lại các trường bắt buộc.', { title: 'Thiếu thông tin' });
        }

        return Object.keys(errors).length === 0;
    };

    const openItemModal = (item = null) => {
        setFormErrors({});
        if (item) {
            setEditingItem(item);
            setItemForm({
                name: item.name,
                price: item.price,
                categoryId: item.categoryId,
                description: item.description || '',
                imageFile: item.image || null,
                isAvailable: item.isAvailable,
                isActive: item.isActive,
                sortOrder: item.sortOrder || 0
            });
        } else {
            setEditingItem(null);
            setItemForm({
                name: '',
                price: '',
                categoryId: '',
                description: '',
                imageFile: null,
                isAvailable: true,
                isActive: true,
                sortOrder: 0
            });
        }
        setOpenItem(true);
    };

    const saveItem = async (e) => {
        e.preventDefault();
        if (!validateItemForm()) return;

        try {
            const formData = new FormData();
            formData.append('name', itemForm.name.trim());
            formData.append('price', String(parseFloat(itemForm.price)));
            formData.append('categoryId', String(parseInt(itemForm.categoryId)));
            formData.append('description', itemForm.description.trim());
            formData.append('isAvailable', String(itemForm.isAvailable));
            formData.append('isActive', String(itemForm.isActive));
            formData.append('sortOrder', String(parseInt(String(itemForm.sortOrder)) || 0));

            if (itemForm.imageFile) {
                formData.append('image', itemForm.imageFile);
            }

            if (editingItem) {
                await itemAPI.update(editingItem.id, formData);
                toast.success('Cập nhật món ăn thành công.', { title: 'Thành công' });
            } else {
                await itemAPI.create(formData);
                toast.success('Tạo món ăn mới thành công.', { title: 'Thành công' });
            }

            setOpenItem(false);
            setEditingItem(null);
            await load();
        } catch (error) {
            console.error('Error saving item:', error);
            const msg = error?.response?.data?.message || 'Không thể lưu món. Vui lòng thử lại.';
            toast.error(msg, { title: 'Lỗi' });
        }
    };

    const deleteItem = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa món này?')) return;
        try {
            await itemAPI.delete(id);
            toast.success('Đã xóa món ăn.', { title: 'Thành công' });
            await load();
        } catch (error) {
            console.error('Error deleting item:', error);
            const msg = error?.response?.data?.message || 'Không thể xóa món. Vui lòng thử lại.';
            toast.error(msg, { title: 'Lỗi' });
        }
    };

    // ==================== COMBO HANDLERS ====================
    const validateComboForm = () => {
        const errors = {};
        if (!comboForm.name?.trim()) errors.name = 'Tên combo là bắt buộc';
        if (!comboForm.price || parseFloat(comboForm.price) <= 0) errors.price = 'Giá phải lớn hơn 0';
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error('Vui lòng kiểm tra lại các trường bắt buộc.', { title: 'Thiếu thông tin' });
        }

        return Object.keys(errors).length === 0;
    };

    const openComboModal = (combo = null) => {
        setFormErrors({});
        setNewComboItem({ itemId: '', quantity: 1, isRequired: false, isDefault: false });

        if (combo) {
            setEditingCombo(combo);
            setComboForm({
                name: combo.name,
                price: combo.price,
                description: combo.description || '',
                image: combo.image || '',
                isActive: combo.isActive
            });

            setSelectedCombo(combo);
            loadComboItems(combo.id);
        } else {
            setEditingCombo(null);
            setComboForm({
                name: '',
                price: '',
                description: '',
                image: '',
                isActive: true
            });

            setSelectedCombo(null);
            setComboItemsList([]);
        }
        setOpenCombo(true);
    };

    const saveCombo = async (e) => {
        e.preventDefault();
        if (!validateComboForm()) return;

        try {
            const data = {
                name: comboForm.name.trim(),
                price: parseFloat(comboForm.price),
                description: comboForm.description.trim(),
                image: comboForm.image.trim(),
                isActive: comboForm.isActive
            };

            if (editingCombo) {
                const res = await comboAPI.update(editingCombo.id, data);
                const updated = res?.data?.data || { ...editingCombo, ...data };

                setEditingCombo(updated);
                setSelectedCombo(updated);
                await load();
                await loadComboItems(updated.id);

                toast.success('Cập nhật combo thành công.', { title: 'Thành công' });
            } else {
                const res = await comboAPI.create(data);
                const created = res?.data?.data;

                toast.success('Tạo combo mới thành công. Bạn có thể thêm món cho combo này phía dưới.', {
                    title: 'Thành công'
                });

                if (created) {
                    setEditingCombo(created);
                    setSelectedCombo(created);
                    await load();
                    await loadComboItems(created.id);
                } else {
                    await load();
                }
            }

            // Không đóng modal sau khi lưu combo
        } catch (error) {
            console.error('Error saving combo:', error);
            const msg = error?.response?.data?.message || 'Không thể lưu combo. Vui lòng thử lại.';
            toast.error(msg, { title: 'Lỗi' });
        }
    };

    const deleteCombo = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa combo này?')) return;
        try {
            await comboAPI.delete(id);
            toast.success('Đã xóa combo.', { title: 'Thành công' });
            await load();
        } catch (error) {
            console.error('Error deleting combo:', error);
            const msg = error?.response?.data?.message || 'Không thể xóa combo. Vui lòng thử lại.';
            toast.error(msg, { title: 'Lỗi' });
        }
    };

    // === toggle dropdown combo items: chỉ xem list món ===
    const toggleComboItems = (combo) => {
        if (selectedCombo?.id === combo.id) {
            setSelectedCombo(null);
            setComboItemsList([]);
            setNewComboItem({ itemId: '', quantity: 1, isRequired: false, isDefault: false });
        } else {
            setSelectedCombo(combo);
            setNewComboItem({ itemId: '', quantity: 1, isRequired: false, isDefault: false });
            loadComboItems(combo.id);
        }
    };

    // ==================== CATEGORY HANDLERS ====================
    const validateCategoryForm = () => {
        const errors = {};
        if (!categoryForm.categoryName?.trim()) errors.categoryName = 'Tên danh mục là bắt buộc';
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error('Vui lòng kiểm tra lại các trường bắt buộc.', { title: 'Thiếu thông tin' });
        }

        return Object.keys(errors).length === 0;
    };

    const openCategoryModal = (category = null) => {
        setFormErrors({});
        if (category) {
            setEditingCategory(category);
            setCategoryForm({
                categoryName: category.categoryName,
                description: category.description || '',
                image: category.image || '',
                sortOrder: category.sortOrder || 0,
                isActive: category.isActive
            });
        } else {
            setEditingCategory(null);
            setCategoryForm({
                categoryName: '',
                description: '',
                image: '',
                sortOrder: 0,
                isActive: true
            });
        }
        setOpenCategory(true);
    };

    const saveCategory = async (e) => {
        e.preventDefault();
        if (!validateCategoryForm()) return;

        try {
            const data = {
                categoryName: categoryForm.categoryName.trim(),
                description: categoryForm.description.trim(),
                image: categoryForm.image.trim(),
                sortOrder: parseInt(String(categoryForm.sortOrder)),
                isActive: categoryForm.isActive
            };

            if (editingCategory) {
                await categoryAPI.update(editingCategory.id, data);
                toast.success('Cập nhật danh mục thành công.', { title: 'Thành công' });
            } else {
                await categoryAPI.create(data);
                toast.success('Tạo danh mục mới thành công.', { title: 'Thành công' });
            }

            setOpenCategory(false);
            setEditingCategory(null);
            await load();
        } catch (error) {
            console.error('Error saving category:', error);
            const msg = error?.response?.data?.message || 'Không thể lưu danh mục. Vui lòng thử lại.';
            toast.error(msg, { title: 'Lỗi' });
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            await categoryAPI.delete(id);
            toast.success('Đã xóa danh mục.', { title: 'Thành công' });
            await load();
        } catch (error) {
            console.error('Error deleting category:', error);
            const msg = error?.response?.data?.message || 'Không thể xóa danh mục. Vui lòng thử lại.';
            toast.error(msg, { title: 'Lỗi' });
        }
    };

    // ==================== COMBO ITEMS HANDLERS ====================
    const addComboItem = async (e) => {
        e.preventDefault();
        if (!selectedCombo) {
            toast.error('Chưa xác định combo.', { title: 'Lỗi' });
            return;
        }
        if (!newComboItem.itemId) {
            toast.error('Vui lòng chọn món trước khi thêm.', { title: 'Thiếu thông tin' });
            return;
        }

        try {
            await comboItemAPI.create({
                comboId: selectedCombo.id,
                itemId: parseInt(newComboItem.itemId),
                quantity: parseInt(String(newComboItem.quantity)),
                isRequired: newComboItem.isRequired,
                isDefault: newComboItem.isDefault
            });

            toast.success('Đã thêm món vào combo.', { title: 'Thành công' });

            setNewComboItem({ itemId: '', quantity: 1, isRequired: false, isDefault: false });
            await loadComboItems(selectedCombo.id);
        } catch (error) {
            console.error('Error adding combo item:', error);
            const msg = error?.response?.data?.message || 'Không thể thêm món vào combo. Vui lòng thử lại.';
            toast.error(msg, { title: 'Lỗi' });
        }
    };

    const deleteComboItem = async (id) => {
        if (!selectedCombo) return;
        if (!window.confirm('Bạn có chắc muốn xóa?')) return;
        try {
            await comboItemAPI.delete(id);
            toast.success('Đã xóa món khỏi combo.', { title: 'Thành công' });
            await loadComboItems(selectedCombo.id);
        } catch (error) {
            console.error('Error deleting combo item:', error);
            const msg = error?.response?.data?.message || 'Không thể xóa. Vui lòng thử lại.';
            toast.error(msg, { title: 'Lỗi' });
        }
    };

    if (loading) {
        return <div className="text-center py-8">Đang tải...</div>;
    }

    // ======= Small helpers (format) =======
    const money = (v) => (Number(v || 0)).toLocaleString() + ' đ';

    // ======= Reusable section: quản lý món trong combo =======
    const ComboItemsSection = ({ showForm = true }) => {
        if (!selectedCombo) return null;
        return (
            <div className="mt-3 space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
                {showForm && (
                    <form onSubmit={addComboItem} className="space-y-3 border-b border-slate-800 pb-4">
                        <select
                            className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                            value={newComboItem.itemId}
                            onChange={e => setNewComboItem(f => ({ ...f, itemId: e.target.value }))}
                        >
                            <option value="">Chọn món</option>
                            {(items ?? []).map(it => (
                                <option key={it.id} value={it.id}>
                                    {it.name} - {money(it.price)}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            min={1}
                            className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                            placeholder="Số lượng"
                            value={newComboItem.quantity}
                            onChange={e => setNewComboItem(f => ({ ...f, quantity: Number(e.target.value) || 1 }))}
                        />

                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={newComboItem.isRequired}
                                    onChange={e => setNewComboItem(f => ({ ...f, isRequired: e.target.checked }))}
                                />
                                Bắt buộc
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={newComboItem.isDefault}
                                    onChange={e => setNewComboItem(f => ({ ...f, isDefault: e.target.checked }))}
                                />
                                Mặc định
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-emerald-600 py-2 text-sm hover:bg-emerald-700"
                        >
                            Thêm món
                        </button>
                    </form>
                )}

                {/* LIST: max 4 item, còn lại cuộn */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {comboItemsList && comboItemsList.length === 0 ? (
                        <p className="text-xs text-slate-400">Chưa có món nào</p>
                    ) : (
                        comboItemsList.map(ci => (
                            <div
                                key={ci.id}
                                className="flex items-center justify-between bg-slate-900 p-2 rounded-lg"
                            >
                                <div className="text-sm">
                                    <p className="text-slate-300">
                                        {ci.item?.name} x{ci.quantity}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {ci.isRequired ? 'Bắt buộc' : ''}{' '}
                                        {ci.isDefault ? '• Mặc định' : ''}
                                    </p>
                                </div>

                                {showForm && (
                                    <button
                                        onClick={() => deleteComboItem(ci.id)}
                                        className="p-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-900 text-rose-300"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Quản lý Menu</h2>
            </div>

            <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-1 text-sm">
                {[
                    { key: 'items', label: 'Món ăn' },
                    { key: 'combos', label: 'Combo' },
                    { key: 'categories', label: 'Danh mục' }
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`rounded-lg px-3 py-2 ${tab === t.key ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ==================== ITEMS TAB ==================== */}
            {tab === 'items' && (
                <>
                    <div className="flex justify-end">
                        <button
                            onClick={() => openItemModal()}
                            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm hover:bg-slate-800"
                        >
                            <Plus className="size-4 inline mr-1" /> Thêm món
                        </button>
                    </div>

                    {/* Mobile cards */}
                    <div className="grid gap-3 sm:hidden">
                        {(items ?? []).map((it) => (
                            <div key={it.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-medium text-slate-200">{it.name}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {it.category?.categoryName || '—'} • {it.isAvailable ? 'Còn' : 'Hết'}
                                        </div>
                                        <div className="text-sm mt-1">{money(it.price)}</div>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            onClick={() => openItemModal(it)}
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                            title="Sửa"
                                        >
                                            <Pencil className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteItem(it.id)}
                                            className="p-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-900 text-rose-300"
                                            title="Xóa"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items && items.length === 0 && <div className="text-center text-sm text-slate-400">Chưa có món nào</div>}
                    </div>

                    {/* Table for ≥ sm */}
                    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-800">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-900 text-slate-300">
                                <tr>
                                    <th className="px-3 py-2 text-left">#</th>
                                    <th className="px-3 py-2 text-left">Tên món</th>
                                    <th className="px-3 py-2 text-left">Giá</th>
                                    <th className="px-3 py-2 text-left">Danh mục</th>
                                    <th className="px-3 py-2 text-left">Trạng thái</th>
                                    <th className="px-3 py-2 text-right pr-4">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(items ?? []).map((it, i) => (
                                    <tr key={it.id} className="border-t border-slate-800">
                                        <td className="px-3 py-2">{i + 1}</td>
                                        <td className="px-3 py-2 text-slate-200">{it.name}</td>
                                        <td className="px-3 py-2">{money(it.price)}</td>
                                        <td className="px-3 py-2">{it.category?.categoryName || '—'}</td>
                                        <td className="px-3 py-2">{it.isAvailable ? 'Còn' : 'Hết'}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-end gap-2 pr-2">
                                                <button
                                                    onClick={() => openItemModal(it)}
                                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                                    title="Sửa"
                                                >
                                                    <Pencil className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteItem(it.id)}
                                                    className="p-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-900 text-rose-300"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {items && items.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-6 text-center text-slate-400">Chưa có món nào</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Item Modal */}
                    <Modal
                        open={openItem}
                        title={editingItem ? 'Sửa món ăn' : 'Thêm món ăn'}
                        onClose={() => {
                            setOpenItem(false);
                            setEditingItem(null);
                            setFormErrors({});
                        }}
                    >
                        <form onSubmit={saveItem} className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400">Tên món</label>
                                <input
                                    className={`w-full rounded-lg bg-slate-900 border p-2 ${formErrors.name ? 'border-rose-500' : 'border-slate-800'}`}
                                    placeholder="Tên món ăn"
                                    value={itemForm.name}
                                    onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))}
                                />
                                {formErrors.name && <p className="text-xs text-rose-400 mt-1">{formErrors.name}</p>}
                            </div>

                            <div>
                                <label className="text-xs text-slate-400">Giá</label>
                                <input
                                    type="number"
                                    step="1000"
                                    className={`w-full rounded-lg bg-slate-900 border p-2 ${formErrors.price ? 'border-rose-500' : 'border-slate-800'}`}
                                    placeholder="Giá"
                                    value={itemForm.price}
                                    onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))}
                                />
                                {formErrors.price && <p className="text-xs text-rose-400 mt-1">{formErrors.price}</p>}
                            </div>

                            <div>
                                <label className="text-xs text-slate-400">Danh mục</label>
                                <select
                                    className={`w-full rounded-lg bg-slate-900 border p-2 ${formErrors.categoryId ? 'border-rose-500' : 'border-slate-800'}`}
                                    value={itemForm.categoryId}
                                    onChange={e => setItemForm(f => ({ ...f, categoryId: e.target.value }))}
                                >
                                    <option value="">Chọn danh mục</option>
                                    {(categories ?? []).map(c => (
                                        <option key={c.id} value={c.id}>{c.categoryName}</option>
                                    ))}
                                </select>
                                {formErrors.categoryId && <p className="text-xs text-rose-400 mt-1">{formErrors.categoryId}</p>}
                            </div>

                            <textarea
                                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                                placeholder="Mô tả (tùy chọn)"
                                rows={2}
                                value={itemForm.description}
                                onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                            />

                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Ảnh món</label>

                                {/* input ẩn */}
                                <input
                                    type="file"
                                    id="itemImageInput"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0] || null;
                                        setItemForm(f => ({ ...f, imageFile: file }));
                                    }}
                                />

                                {!itemForm.imageFile ? (
                                    // Không có file / link -> hiện khung chọn ảnh
                                    <label
                                        htmlFor="itemImageInput"
                                        className="flex flex-col items-center justify-center w-32 h-32 rounded-lg bg-slate-900 border-2 border-dashed border-slate-700 cursor-pointer hover:border-slate-600 hover:bg-slate-800 transition-colors"
                                    >
                                        <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <span className="text-xs text-slate-400 text-center px-2">Chọn ảnh</span>
                                    </label>
                                ) : (
                                    // Có imageFile: có thể là File **hoặc** link string
                                    <div className="relative w-32 h-32 group">
                                        <img
                                            src={
                                                typeof itemForm.imageFile === 'string'
                                                    ? itemForm.imageFile
                                                    : URL.createObjectURL(itemForm.imageFile)
                                            }
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1">
                                            <label
                                                htmlFor="itemImageInput"
                                                className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 cursor-pointer text-xs"
                                            >
                                                Đổi
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setItemForm(f => ({ ...f, imageFile: null }))}
                                                className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-xs"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {itemForm.imageFile && (
                                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[128px]">
                                        {/* {typeof itemForm.imageFile === 'string'
                                            ? itemForm.imageFile
                                            : itemForm.imageFile.name} */}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    checked={itemForm.isAvailable}
                                    onChange={e => setItemForm(f => ({ ...f, isAvailable: e.target.checked }))}
                                />
                                <label htmlFor="isAvailable" className="text-xs text-slate-400">Hoạt động</label>
                            </div>

                            <button type="submit" className="w-full rounded-xl bg-emerald-600 py-2 font-medium hover:bg-emerald-700">
                                {editingItem ? 'Cập nhật' : 'Tạo món'}
                            </button>
                        </form>
                    </Modal>
                </>
            )}

            {/* ==================== COMBOS TAB ==================== */}
            {tab === 'combos' && (
                <>
                    <div className="flex justify-end">
                        <button
                            onClick={() => openComboModal()}
                            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm hover:bg-slate-800"
                        >
                            <Plus className="size-4 inline mr-1" /> Thêm combo
                        </button>
                    </div>

                    {/* Mobile cards */}
                    <div className="grid gap-3 sm:hidden">
                        {(combos ?? []).map((cb) => (
                            <div key={cb.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-medium text-slate-200">{cb.name}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{cb.isActive ? 'Hoạt động' : 'Tạm dừng'}</div>
                                        <div className="text-sm mt-1">{money(cb.price)}</div>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            onClick={() => toggleComboItems(cb)}
                                            className="p-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-900 text-blue-300"
                                            title="Xem món trong combo"
                                        >
                                            <ChevronDown
                                                className={`size-4 transition-transform ${selectedCombo?.id === cb.id ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        <button
                                            onClick={() => openComboModal(cb)}
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                            title="Sửa"
                                        >
                                            <Pencil className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteCombo(cb.id)}
                                            className="p-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-900 text-rose-300"
                                            title="Xóa"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                {selectedCombo?.id === cb.id && <ComboItemsSection showForm={false} />}
                            </div>
                        ))}
                        {combos && combos.length === 0 && <div className="text-center text-sm text-slate-400">Chưa có combo nào</div>}
                    </div>

                    {/* Table for ≥ sm */}
                    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-800">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-900 text-slate-300">
                                <tr>
                                    <th className="px-3 py-2 text-left">#</th>
                                    <th className="px-3 py-2 text-left">Tên combo</th>
                                    <th className="px-3 py-2 text-left">Giá</th>
                                    <th className="px-3 py-2 text-left">Trạng thái</th>
                                    <th className="px-3 py-2 text-right pr-4">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(combos ?? []).map((cb, i) => (
                                    <React.Fragment key={cb.id}>
                                        <tr className="border-t border-slate-800">
                                            <td className="px-3 py-2">{i + 1}</td>
                                            <td className="px-3 py-2 text-slate-200">{cb.name}</td>
                                            <td className="px-3 py-2">{money(cb.price)}</td>
                                            <td className="px-3 py-2">{cb.isActive ? 'Hoạt động' : 'Tạm dừng'}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex justify-end gap-2 pr-2">
                                                    <button
                                                        onClick={() => toggleComboItems(cb)}
                                                        className="p-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-900 text-blue-300"
                                                        title="Xem món trong combo"
                                                    >
                                                        <ChevronDown
                                                            className={`size-4 transition-transform ${selectedCombo?.id === cb.id ? 'rotate-180' : ''}`}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() => openComboModal(cb)}
                                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                                        title="Sửa"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCombo(cb.id)}
                                                        className="p-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-900 text-rose-300"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {selectedCombo?.id === cb.id && (
                                            <tr key={`${cb.id}-dropdown`}>
                                                <td colSpan={5} className="px-3 pb-4">
                                                    <ComboItemsSection showForm={false} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}

                                {combos && combos.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                                            Chưa có combo nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Combo Modal: CRUD combo + add items */}
                    <Modal
                        open={openCombo}
                        title={editingCombo ? 'Sửa combo' : 'Thêm combo'}
                        onClose={() => {
                            setOpenCombo(false);
                            setEditingCombo(null);
                            setFormErrors({});
                            setSelectedCombo(null);
                            setComboItemsList([]);
                            setNewComboItem({ itemId: '', quantity: 1, isRequired: false, isDefault: false });
                        }}
                        className="max-w-5xl"
                    >
                        {/* Wrapper 2 cột */}
                        <div className="md:grid md:grid-cols-[1.1fr_1.4fr] md:gap-6 md:items-start space-y-4 md:space-y-0">
                            {/* LEFT: card thông tin combo */}
                            <form
                                onSubmit={saveCombo}
                                className="rounded-2xl bg-slate-950/80 border border-slate-800 px-4 py-4 space-y-3 shadow-sm"
                            >
                                <h4 className="text-xs font-semibold text-slate-300 mb-1">Thông tin combo</h4>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-400">Tên combo</label>
                                    <input
                                        className={`w-full rounded-lg bg-slate-900 border px-3 py-2 text-sm ${formErrors.name ? 'border-rose-500' : 'border-slate-800'
                                            }`}
                                        placeholder="Tên combo"
                                        value={comboForm.name}
                                        onChange={e => setComboForm(f => ({ ...f, name: e.target.value }))}
                                    />
                                    {formErrors.name && (
                                        <p className="text-xs text-rose-400 mt-0.5">{formErrors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-400">Giá</label>
                                    <input
                                        type="number"
                                        step="1000"
                                        className={`w-full rounded-lg bg-slate-900 border px-3 py-2 text-sm ${formErrors.price ? 'border-rose-500' : 'border-slate-800'
                                            }`}
                                        placeholder="Giá"
                                        value={comboForm.price}
                                        onChange={e => setComboForm(f => ({ ...f, price: e.target.value }))}
                                    />
                                    {formErrors.price && (
                                        <p className="text-xs text-rose-400 mt-0.5">{formErrors.price}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-400">Mô tả</label>
                                    <textarea
                                        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
                                        placeholder="Mô tả (tùy chọn)"
                                        rows={3}
                                        value={comboForm.description}
                                        onChange={e => setComboForm(f => ({ ...f, description: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-400">URL hình ảnh</label>
                                    <input
                                        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm"
                                        placeholder="URL hình ảnh (tùy chọn)"
                                        value={comboForm.image}
                                        onChange={e => setComboForm(f => ({ ...f, image: e.target.value }))}
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="comboIsActive"
                                        checked={comboForm.isActive}
                                        onChange={e => setComboForm(f => ({ ...f, isActive: e.target.checked }))}
                                    />
                                    <label htmlFor="comboIsActive" className="text-xs text-slate-400">
                                        Hoạt động
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="mt-2 w-full rounded-xl bg-emerald-600 py-2 text-sm font-medium hover:bg-emerald-700"
                                >
                                    {editingCombo ? 'Cập nhật' : 'Tạo combo'}
                                </button>
                            </form>

                            {/* RIGHT: card món trong combo – chỉ hiện khi đã có combo */}
                            {editingCombo && selectedCombo && (
                                <div className="rounded-2xl bg-slate-950/80 border border-slate-800 px-4 py-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-semibold text-slate-300">
                                            Món trong combo
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            {comboItemsList.length} món
                                        </p>
                                    </div>
                                    <ComboItemsSection showForm={true} />
                                </div>
                            )}
                        </div>
                    </Modal>
                </>
            )}

            {/* ==================== CATEGORIES TAB ==================== */}
            {tab === 'categories' && (
                <>
                    <div className="flex justify-end">
                        <button
                            onClick={() => openCategoryModal()}
                            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm hover:bg-slate-800"
                        >
                            <Plus className="size-4 inline mr-1" /> Thêm danh mục
                        </button>
                    </div>

                    {/* Mobile cards */}
                    <div className="grid gap-3 sm:hidden">
                        {(categories ?? []).map((cat) => {
                            const count = items.filter(it => it.categoryId === cat.id).length;
                            return (
                                <div key={cat.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-medium text-slate-200">{cat.categoryName}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {count} món • {cat.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <button
                                                onClick={() => openCategoryModal(cat)}
                                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                                title="Sửa"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteCategory(cat.id)}
                                                className="p-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-900 text-rose-300"
                                                title="Xóa"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {categories && categories.length === 0 && <div className="text-center text-sm text-slate-400">Chưa có danh mục</div>}
                    </div>

                    {/* Table for ≥ sm */}
                    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-800">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-900 text-slate-300">
                                <tr>
                                    <th className="px-3 py-2 text-left">#</th>
                                    <th className="px-3 py-2 text-left">Tên danh mục</th>
                                    <th className="px-3 py-2 text-left">Số món</th>
                                    <th className="px-3 py-2 text-left">Trạng thái</th>
                                    <th className="px-3 py-2 text-right pr-4">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(categories ?? []).map((cat, i) => {
                                    const count = items.filter(it => it.categoryId === cat.id).length;
                                    return (
                                        <tr key={cat.id} className="border-t border-slate-800">
                                            <td className="px-3 py-2">{i + 1}</td>
                                            <td className="px-3 py-2 text-slate-200">{cat.categoryName}</td>
                                            <td className="px-3 py-2">{count}</td>
                                            <td className="px-3 py-2">{cat.isActive ? 'Hoạt động' : 'Tạm dừng'}</td>
                                            <td className="px-3 py-2">
                                                <div className="flex justify-end gap-2 pr-2">
                                                    <button
                                                        onClick={() => openCategoryModal(cat)}
                                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                                        title="Sửa"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCategory(cat.id)}
                                                        className="p-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-900 text-rose-300"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {categories && categories.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-6 text-center text-slate-400">Chưa có danh mục</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Category Modal */}
                    <Modal
                        open={openCategory}
                        title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
                        onClose={() => {
                            setOpenCategory(false);
                            setEditingCategory(null);
                            setFormErrors({});
                        }}
                    >
                        <form onSubmit={saveCategory} className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400">Tên danh mục</label>
                                <input
                                    className={`w-full rounded-lg bg-slate-900 border p-2 ${formErrors.categoryName ? 'border-rose-500' : 'border-slate-800'}`}
                                    placeholder="Tên danh mục"
                                    value={categoryForm.categoryName}
                                    onChange={e => setCategoryForm(f => ({ ...f, categoryName: e.target.value }))}
                                />
                                {formErrors.categoryName && <p className="text-xs text-rose-400 mt-1">{formErrors.categoryName}</p>}
                            </div>

                            <textarea
                                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                                placeholder="Mô tả (tùy chọn)"
                                rows={2}
                                value={categoryForm.description}
                                onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))}
                            />

                            <input
                                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                                placeholder="URL hình ảnh (tùy chọn)"
                                value={categoryForm.image}
                                onChange={e => setCategoryForm(f => ({ ...f, image: e.target.value }))}
                            />

                            <input
                                type="number"
                                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                                placeholder="Thứ tự sắp xếp"
                                value={categoryForm.sortOrder}
                                onChange={e => setCategoryForm(f => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
                            />

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="catIsActive"
                                    checked={categoryForm.isActive}
                                    onChange={e => setCategoryForm(f => ({ ...f, isActive: e.target.checked }))}
                                />
                                <label htmlFor="catIsActive" className="text-xs text-slate-400">Hoạt động</label>
                            </div>

                            <button type="submit" className="w-full rounded-xl bg-emerald-600 py-2 font-medium hover:bg-emerald-700">
                                {editingCategory ? 'Cập nhật' : 'Tạo danh mục'}
                            </button>
                        </form>
                    </Modal>
                </>
            )}
        </div>
    );
}

export default MenuSection;
