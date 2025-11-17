'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import Modal from '../utils/Modal';
import { itemAPI, comboAPI, categoryAPI, comboItemAPI } from '@/lib/api';

function MenuSection() {
    const [tab, setTab] = useState('items');
    const [items, setItems] = useState([]);
    const [combos, setCombos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [openItem, setOpenItem] = useState(false);
    const [openCombo, setOpenCombo] = useState(false);
    const [openCategory, setOpenCategory] = useState(false);
    const [openComboItems, setOpenComboItems] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingCombo, setEditingCombo] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [selectedCombo, setSelectedCombo] = useState(null);
    const [comboItemsList, setComboItemsList] = useState([]);
    const [formErrors, setFormErrors] = useState({});

    const [itemForm, setItemForm] = useState({
        name: '',
        price: '',
        categoryId: '',
        description: '',
        image: '',
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

    const [newComboItem, setNewComboItem] = useState({
        itemId: '',
        quantity: 1,
        isRequired: false,
        isDefault: false
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
            alert('Không thể tải dữ liệu. Vui lòng thử lại.');
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
                image: item.image || '',
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
                image: '',
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
            const data = {
                name: itemForm.name.trim(),
                price: parseFloat(itemForm.price),
                categoryId: parseInt(itemForm.categoryId),
                description: itemForm.description.trim(),
                image: itemForm.image.trim(),
                isAvailable: itemForm.isAvailable,
                isActive: itemForm.isActive,
                sortOrder: parseInt(itemForm.sortOrder)
            };

            if (editingItem) {
                await itemAPI.update(editingItem.id, data);
            } else {
                await itemAPI.create(data);
            }

            setOpenItem(false);
            setEditingItem(null);
            await load();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Không thể lưu món. Vui lòng thử lại.');
        }
    };

    const deleteItem = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa món này?')) return;
        try {
            await itemAPI.delete(id);
            await load();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Không thể xóa món. Vui lòng thử lại.');
        }
    };

    // ==================== COMBO HANDLERS ====================
    const validateComboForm = () => {
        const errors = {};
        if (!comboForm.name?.trim()) errors.name = 'Tên combo là bắt buộc';
        if (!comboForm.price || parseFloat(comboForm.price) <= 0) errors.price = 'Giá phải lớn hơn 0';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openComboModal = (combo = null) => {
        setFormErrors({});
        if (combo) {
            setEditingCombo(combo);
            setComboForm({
                name: combo.name,
                price: combo.price,
                description: combo.description || '',
                image: combo.image || '',
                isActive: combo.isActive
            });
        } else {
            setEditingCombo(null);
            setComboForm({
                name: '',
                price: '',
                description: '',
                image: '',
                isActive: true
            });
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
                await comboAPI.update(editingCombo.id, data);
            } else {
                await comboAPI.create(data);
            }

            setOpenCombo(false);
            setEditingCombo(null);
            await load();
        } catch (error) {
            console.error('Error saving combo:', error);
            alert('Không thể lưu combo. Vui lòng thử lại.');
        }
    };

    const deleteCombo = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa combo này?')) return;
        try {
            await comboAPI.delete(id);
            await load();
        } catch (error) {
            console.error('Error deleting combo:', error);
            alert('Không thể xóa combo. Vui lòng thử lại.');
        }
    };

    // ==================== CATEGORY HANDLERS ====================
    const validateCategoryForm = () => {
        const errors = {};
        if (!categoryForm.categoryName?.trim()) errors.categoryName = 'Tên danh mục là bắt buộc';
        setFormErrors(errors);
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
                sortOrder: parseInt(categoryForm.sortOrder),
                isActive: categoryForm.isActive
            };

            if (editingCategory) {
                await categoryAPI.update(editingCategory.id, data);
            } else {
                await categoryAPI.create(data);
            }

            setOpenCategory(false);
            setEditingCategory(null);
            await load();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Không thể lưu danh mục. Vui lòng thử lại.');
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            await categoryAPI.delete(id);
            await load();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Không thể xóa danh mục. Vui lòng thử lại.');
        }
    };

    // ==================== COMBO ITEMS HANDLERS ====================
    const openComboItemsModal = (combo) => {
        setSelectedCombo(combo);
        setNewComboItem({ itemId: '', quantity: 1, isRequired: false, isDefault: false });
        loadComboItems(combo.id);
        setOpenComboItems(true);
    };

    const addComboItem = async (e) => {
        e.preventDefault();
        if (!newComboItem.itemId) {
            alert('Vui lòng chọn món');
            return;
        }

        try {
            await comboItemAPI.create({
                comboId: selectedCombo.id,
                itemId: parseInt(newComboItem.itemId),
                quantity: parseInt(newComboItem.quantity),
                isRequired: newComboItem.isRequired,
                isDefault: newComboItem.isDefault
            });

            setNewComboItem({ itemId: '', quantity: 1, isRequired: false, isDefault: false });
            await loadComboItems(selectedCombo.id);
        } catch (error) {
            console.error('Error adding combo item:', error);
            alert('Không thể thêm món vào combo. Vui lòng thử lại.');
        }
    };

    const deleteComboItem = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa?')) return;
        try {
            await comboItemAPI.delete(id);
            await loadComboItems(selectedCombo.id);
        } catch (error) {
            console.error('Error deleting combo item:', error);
            alert('Không thể xóa. Vui lòng thử lại.');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Đang tải...</div>;
    }

    // ======= Small helpers (format) =======
    const money = (v) => (Number(v || 0)).toLocaleString() + ' đ';

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
                        {items.map((it) => (
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
                        {items.length === 0 && <div className="text-center text-sm text-slate-400">Chưa có món nào</div>}
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
                                {items.map((it, i) => (
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
                                {items.length === 0 && (
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
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.categoryName}</option>
                                    ))}
                                </select>
                                {formErrors.categoryId && <p className="text-xs text-rose-400 mt-1">{formErrors.categoryId}</p>}
                            </div>

                            <textarea
                                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                                placeholder="Mô tả (tùy chọn)"
                                rows="2"
                                value={itemForm.description}
                                onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                            />

                            <input
                                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                                placeholder="URL hình ảnh (tùy chọn)"
                                value={itemForm.image}
                                onChange={e => setItemForm(f => ({ ...f, image: e.target.value }))}
                            />

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    checked={itemForm.isAvailable}
                                    onChange={e => setItemForm(f => ({ ...f, isAvailable: e.target.checked }))}
                                />
                                <label htmlFor="isAvailable" className="text-xs text-slate-400">Còn hàng</label>
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
                        {combos.map((cb) => (
                            <div key={cb.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="font-medium text-slate-200">{cb.name}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{cb.isActive ? 'Hoạt động' : 'Tạm dừng'}</div>
                                        <div className="text-sm mt-1">{money(cb.price)}</div>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            onClick={() => openComboItemsModal(cb)}
                                            className="p-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-900 text-blue-300"
                                            title="Quản lý món"
                                        >
                                            <ChevronDown className="size-4" />
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
                            </div>
                        ))}
                        {combos.length === 0 && <div className="text-center text-sm text-slate-400">Chưa có combo nào</div>}
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
                                {combos.map((cb, i) => (
                                    <tr key={cb.id} className="border-t border-slate-800">
                                        <td className="px-3 py-2">{i + 1}</td>
                                        <td className="px-3 py-2 text-slate-200">{cb.name}</td>
                                        <td className="px-3 py-2">{money(cb.price)}</td>
                                        <td className="px-3 py-2">{cb.isActive ? 'Hoạt động' : 'Tạm dừng'}</td>
                                        <td className="px-3 py-2">
                                            <div className="flex justify-end gap-2 pr-2">
                                                <button
                                                    onClick={() => openComboItemsModal(cb)}
                                                    className="p-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-900 text-blue-300"
                                                    title="Quản lý món"
                                                >
                                                    <ChevronDown className="size-4" />
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
                                ))}
                                {combos.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-6 text-center text-slate-400">Chưa có combo nào</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Combo Modal */}
                    <Modal
                        open={openCombo}
                        title={editingCombo ? 'Sửa combo' : 'Thêm combo'}
                        onClose={() => {
                            setOpenCombo(false);
                            setEditingCombo(null);
                            setFormErrors({});
                        }}
                    >
                        <form onSubmit={saveCombo} className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400">Tên combo</label>
                                <input
                                    className={`w-full rounded-lg bg-slate-900 border p-2 ${formErrors.name ? 'border-rose-500' : 'border-slate-800'}`}
                                    placeholder="Tên combo"
                                    value={comboForm.name}
                                    onChange={e => setComboForm(f => ({ ...f, name: e.target.value }))}
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
                                    value={comboForm.price}
                                    onChange={e => setComboForm(f => ({ ...f, price: e.target.value }))}
                                />
                                {formErrors.price && <p className="text-xs text-rose-400 mt-1">{formErrors.price}</p>}
                            </div>

                            <textarea
                                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                                placeholder="Mô tả (tùy chọn)"
                                rows="2"
                                value={comboForm.description}
                                onChange={e => setComboForm(f => ({ ...f, description: e.target.value }))}
                            />

                            <input
                                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                                placeholder="URL hình ảnh (tùy chọn)"
                                value={comboForm.image}
                                onChange={e => setComboForm(f => ({ ...f, image: e.target.value }))}
                            />

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="comboIsActive"
                                    checked={comboForm.isActive}
                                    onChange={e => setComboForm(f => ({ ...f, isActive: e.target.checked }))}
                                />
                                <label htmlFor="comboIsActive" className="text-xs text-slate-400">Hoạt động</label>
                            </div>

                            <button type="submit" className="w-full rounded-xl bg-emerald-600 py-2 font-medium hover:bg-emerald-700">
                                {editingCombo ? 'Cập nhật' : 'Tạo combo'}
                            </button>
                        </form>
                    </Modal>

                    {/* Combo Items Modal */}
                    <Modal
                        open={openComboItems}
                        title={`Quản lý món trong combo: ${selectedCombo?.name || ''}`}
                        onClose={() => {
                            setOpenComboItems(false);
                            setSelectedCombo(null);
                            setComboItemsList([]);
                        }}
                    >
                        <div className="space-y-4">
                            <form onSubmit={addComboItem} className="space-y-3 border-b border-slate-800 pb-4">
                                <select
                                    className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                                    value={newComboItem.itemId}
                                    onChange={e => setNewComboItem(f => ({ ...f, itemId: e.target.value }))}
                                >
                                    <option value="">Chọn món</option>
                                    {items.map(it => (
                                        <option key={it.id} value={it.id}>
                                            {it.name} - {money(it.price)}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    min="1"
                                    className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                                    placeholder="Số lượng"
                                    value={newComboItem.quantity}
                                    onChange={e => setNewComboItem(f => ({ ...f, quantity: e.target.value }))}
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

                                <button type="submit" className="w-full rounded-lg bg-emerald-600 py-2 text-sm hover:bg-emerald-700">
                                    Thêm món
                                </button>
                            </form>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-300">Các món trong combo:</h3>
                                {comboItemsList.length === 0 ? (
                                    <p className="text-xs text-slate-400">Chưa có món nào</p>
                                ) : (
                                    comboItemsList.map(ci => (
                                        <div key={ci.id} className="flex items-center justify-between bg-slate-900 p-2 rounded-lg">
                                            <div className="text-sm">
                                                <p className="text-slate-300">{ci.item?.name} x{ci.quantity}</p>
                                                <p className="text-xs text-slate-500">
                                                    {ci.isRequired ? 'Bắt buộc' : ''} {ci.isDefault ? '• Mặc định' : ''}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => deleteComboItem(ci.id)}
                                                className="p-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-900 text-rose-300"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
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
                        {categories.map((cat) => {
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
                        {categories.length === 0 && <div className="text-center text-sm text-slate-400">Chưa có danh mục</div>}
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
                                {categories.map((cat, i) => {
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
                                {categories.length === 0 && (
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
                                rows="2"
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
                                onChange={e => setCategoryForm(f => ({ ...f, sortOrder: e.target.value }))}
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
