'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Badge from '../utils/Badge';
import IconBtn from '../utils/IconBtn';
import Modal from '../utils/Modal';
import { tableAPI } from '@/lib/api';
import { useToast } from '@/components/utils/ToaskProvider';

function TablesSection() {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [tableToDelete, setTableToDelete] = useState(null);

    const [form, setForm] = useState({
        tableNumber: '',
        capacity: 2,
        status: 'available',
        isActive: true
    });

    const toast = useToast();

    const load = async () => {
        try {
            setLoading(true);
            const tables = await tableAPI.getAll();
            setRows(tables.data.data);
        } catch (error) {
            console.error('Error loading tables:', error);
            toast.error('Không thể tải danh sách bàn. Vui lòng thử lại.', {
                title: 'Lỗi'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openModal = (table = null) => {
        setFormErrors({});
        if (table) {
            setEditingTable(table);
            setForm({
                tableNumber: table.tableNumber,
                capacity: table.capacity,
                status: table.status,
                isActive: table.isActive
            });
        } else {
            setEditingTable(null);
            setForm({
                tableNumber: '',
                capacity: 2,
                status: 'available',
                isActive: true
            });
        }
        setOpen(true);
    };

    const validateForm = () => {
        const errors = {};

        if (!form.tableNumber?.trim()) {
            errors.tableNumber = 'Số bàn là bắt buộc';
        }

        if (!form.capacity || form.capacity < 1 || form.capacity > 20) {
            errors.capacity = 'Sức chứa phải từ 1 đến 20 người';
        }

        if (!form.status) {
            errors.status = 'Trạng thái là bắt buộc';
        }

        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error('Vui lòng kiểm tra lại các trường bắt buộc.', {
                title: 'Thiếu thông tin'
            });
        }

        return Object.keys(errors).length === 0;
    };

    const saveTable = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const data = {
                tableNumber: form.tableNumber.trim(),
                capacity: parseInt(form.capacity, 10),
                status: form.status,
                isActive: form.isActive
            };

            if (editingTable) {
                await tableAPI.update(editingTable.id, data);
                toast.success('Cập nhật bàn thành công.', { title: 'Thành công' });
            } else {
                await tableAPI.create(data);
                toast.success('Tạo bàn mới thành công.', { title: 'Thành công' });
            }

            setOpen(false);
            setEditingTable(null);
            setForm({
                tableNumber: '',
                capacity: 2,
                status: 'available',
                isActive: true
            });
            setFormErrors({});
            await load();
        } catch (error) {
            console.error('Error saving table:', error);
            toast.error('Không thể lưu bàn. Vui lòng thử lại.', {
                title: 'Lỗi'
            });
        }
    };

    const openDeleteModal = (table) => {
        setTableToDelete(table);
        setDeleteModalOpen(true);
    };

    const confirmDeleteTable = async () => {
        if (!tableToDelete) return;
        try {
            setLoading(true);
            await tableAPI.delete(tableToDelete.id);
            toast.success('Đã xóa bàn.', { title: 'Thành công' });
            await load();
        } catch (error) {
            console.error('Error deleting table:', error);
            toast.error('Không thể xóa bàn. Vui lòng thử lại.', {
                title: 'Lỗi'
            });
        } finally {
            setLoading(false);
            setDeleteModalOpen(false);
            setTableToDelete(null);
        }
    };

    const getStatusBadgeTone = (status) => {
        const toneMap = {
            available: 'emerald',
            reserved: 'amber',
            occupied: 'blue',
            cleaning: 'slate',
            maintenance: 'rose'
        };
        return toneMap[status] || 'slate';
    };

    const getStatusLabel = (status) => {
        const labelMap = {
            available: 'Trống',
            reserved: 'Đặt trước',
            occupied: 'Đang dùng',
            cleaning: 'Dọn dẹp',
            maintenance: 'Bảo trì'
        };
        return labelMap[status] || status;
    };

    if (loading && rows && rows.length === 0) {
        return <div className="text-center py-8">Đang tải...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Quản lý bàn</h2>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm hover:bg-slate-800"
                >
                    <Plus className="size-4" /> Thêm bàn
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(rows ?? []).map((t) => (
                    <div
                        key={t.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-slate-300 text-sm font-medium">
                                    Bàn {t.tableNumber}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                    Sức chứa: {t.capacity} người
                                </div>
                            </div>
                            <Badge tone={getStatusBadgeTone(t.status)}>
                                {getStatusLabel(t.status)}
                            </Badge>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <IconBtn title="Sửa" onClick={() => openModal(t)}>
                                <Pencil className="size-4" />
                            </IconBtn>
                            <IconBtn
                                tone="danger"
                                title="Xóa"
                                onClick={() => openDeleteModal(t)}
                            >
                                <Trash2 className="size-4" />
                            </IconBtn>
                        </div>
                    </div>
                ))}
            </div>

            {rows && rows.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <p>Chưa có bàn nào</p>
                    <button
                        onClick={() => openModal()}
                        className="mt-3 text-emerald-400 hover:text-emerald-300"
                    >
                        Thêm bàn đầu tiên
                    </button>
                </div>
            )}

            {/* Modal tạo / sửa */}
            <Modal
                open={open}
                title={editingTable ? 'Sửa bàn' : 'Thêm bàn'}
                onClose={() => {
                    setOpen(false);
                    setEditingTable(null);
                    setFormErrors({});
                }}
            >
                <form onSubmit={saveTable} className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Số bàn</label>
                        <input
                            className={`w-full rounded-lg bg-slate-900 border p-2 ${formErrors.tableNumber
                                ? 'border-rose-500'
                                : 'border-slate-800'
                                }`}
                            placeholder="VD: 01, A1, B2"
                            value={form.tableNumber}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, tableNumber: e.target.value }))
                            }
                        />
                        {formErrors.tableNumber && (
                            <p className="text-xs text-rose-400 mt-1">
                                {formErrors.tableNumber}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Sức chứa</label>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            className={`w-full rounded-lg bg-slate-900 border p-2 ${formErrors.capacity
                                ? 'border-rose-500'
                                : 'border-slate-800'
                                }`}
                            placeholder="Số người"
                            value={form.capacity}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, capacity: e.target.value }))
                            }
                        />
                        {formErrors.capacity && (
                            <p className="text-xs text-rose-400 mt-1">
                                {formErrors.capacity}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">
                            Trạng thái
                        </label>
                        <select
                            className={`w-full rounded-lg bg-slate-900 border p-2 ${formErrors.status
                                ? 'border-rose-500'
                                : 'border-slate-800'
                                }`}
                            value={form.status}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, status: e.target.value }))
                            }
                        >
                            <option value="available">Trống</option>
                            <option value="reserved">Đặt trước</option>
                            <option value="occupied">Đang dùng</option>
                            <option value="cleaning">Dọn dẹp</option>
                            <option value="maintenance">Bảo trì</option>
                        </select>
                        {formErrors.status && (
                            <p className="text-xs text-rose-400 mt-1">
                                {formErrors.status}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={form.isActive}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    isActive: e.target.checked
                                }))
                            }
                            className="rounded"
                        />
                        <label htmlFor="isActive" className="text-xs text-slate-400">
                            Kích hoạt bàn
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-emerald-600 py-2 font-medium hover:bg-emerald-700"
                    >
                        {editingTable ? 'Cập nhật' : 'Tạo bàn'}
                    </button>
                </form>
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal
                open={deleteModalOpen}
                title="Xóa bàn"
                onClose={() => {
                    setDeleteModalOpen(false);
                    setTableToDelete(null);
                }}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-300">
                        Bạn có chắc muốn xóa bàn{' '}
                        <span className="font-semibold">
                            {tableToDelete?.tableNumber || ''}
                        </span>
                        ? Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setTableToDelete(null);
                            }}
                            className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={confirmDeleteTable}
                            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium hover:bg-rose-700 transition-colors"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default TablesSection;
