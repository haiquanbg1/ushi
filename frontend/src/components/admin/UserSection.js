'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Badge from '../utils/Badge';
import IconBtn from '../utils/IconBtn';
import { Th, Td } from '../utils/Table';
import Modal from '../utils/Modal';
import { userAPI, roleAPI } from '@/lib/api';
import { useToast } from '@/components/utils/ToaskProvider';

function UsersSection() {
    const [rows, setRows] = useState([]);
    const [roles, setRoles] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [editingUser, setEditingUser] = useState(null);

    const [form, setForm] = useState({
        username: '',
        phone: '',
        password: '',
        roleId: ''
    });

    const toast = useToast();

    const resetForm = () => {
        setEditingUser(null);
        setForm({
            username: '',
            phone: '',
            password: '',
            roleId: ''
        });
    };

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes] = await Promise.all([
                userAPI.getAll(),
                roleAPI.getAll()
            ]);

            setRows(usersRes.data?.data?.users ?? []);
            setRoles(rolesRes.data?.data ?? []);
        } catch (err) {
            console.error('Error loading users:', err);
            toast.error('Không thể tải danh sách người dùng. Vui lòng thử lại.', {
                title: 'Lỗi'
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        load();
    }, [load]);

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setForm({
                username: user.username || '',
                phone: user.phone || '',
                password: '',
                roleId: String(user.roleId ?? '')
            });
        } else {
            resetForm();
        }
        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);
        resetForm();
    };

    const saveUser = async (e) => {
        e.preventDefault();
        if (saving) return;

        // validate trước khi vào try
        if (!editingUser && !form.password) {
            toast.error('Mật khẩu là bắt buộc.', {
                title: 'Thiếu thông tin'
            });
            return;
        }

        try {
            setSaving(true);

            const data = {
                username: form.username.trim(),
                phone: form.phone.trim(),
                roleId: parseInt(form.roleId, 10),
                isActive: true
            };

            if (form.password) {
                data.password = form.password;
            }

            if (editingUser) {
                await userAPI.update(editingUser.id, data);
                toast.success('Cập nhật người dùng thành công.', {
                    title: 'Thành công'
                });
            } else {
                await userAPI.create(data);
                toast.success('Tạo người dùng mới thành công.', {
                    title: 'Thành công'
                });
            }

            closeModal();
            await load();
        } catch (err) {
            console.error('Error saving user:', err);
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Không thể lưu người dùng. Vui lòng thử lại.';
            toast.error(msg, {
                title: 'Lỗi khi lưu'
            });
        } finally {
            setSaving(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
        try {
            setProcessingId(id);
            await userAPI.delete(id);
            toast.success('Đã xóa người dùng.', {
                title: 'Thành công'
            });
            await load();
        } catch (err) {
            console.error('Error deleting user:', err);
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Không thể xóa người dùng. Vui lòng thử lại.';
            toast.error(msg, {
                title: 'Lỗi khi xóa'
            });
        } finally {
            setProcessingId(null);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            setProcessingId(userId);
            if (currentStatus) {
                await userAPI.deactivate(userId);
                toast.info('Đã tạm dừng tài khoản người dùng.', {
                    title: 'Đã cập nhật trạng thái'
                });
            } else {
                await userAPI.activate(userId);
                toast.success('Đã kích hoạt lại tài khoản người dùng.', {
                    title: 'Đã cập nhật trạng thái'
                });
            }
            await load();
        } catch (err) {
            console.error('Error toggling user status:', err);
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Không thể thay đổi trạng thái người dùng.';
            toast.error(msg, {
                title: 'Lỗi trạng thái'
            });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Quản lý người dùng</h2>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
                    disabled={loading || saving}
                >
                    <Plus className="size-4" /> Thêm người dùng
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-sm text-slate-300">
                    Đang tải danh sách người dùng...
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-900 text-slate-300">
                            <tr>
                                <Th>#</Th>
                                <Th>Tên đăng nhập</Th>
                                <Th>Số điện thoại</Th>
                                <Th>Vai trò</Th>
                                <Th>Trạng thái</Th>
                                <Th className="text-right pr-4">Thao tác</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows && rows.length === 0 && (
                                <tr>
                                    <Td colSpan={6} className="py-6 text-center text-slate-400">
                                        Chưa có người dùng nào.
                                    </Td>
                                </tr>
                            )}

                            {(rows ?? []).map((u, idx) => {
                                const isProcessing = processingId === u.id;

                                return (
                                    <tr key={u.id} className="border-t border-slate-800">
                                        <Td>{idx + 1}</Td>
                                        <Td className="text-slate-200">{u.username}</Td>
                                        <Td className="text-slate-300">{u.phone}</Td>
                                        <Td>
                                            <Badge tone="blue">
                                                {u.role?.roleName || '—'}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <button
                                                type="button"
                                                onClick={() => toggleUserStatus(u.id, u.isActive)}
                                                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                                disabled={isProcessing || saving}
                                            >
                                                <Badge tone={u.isActive ? 'emerald' : 'rose'}>
                                                    {u.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                                </Badge>
                                            </button>
                                        </Td>
                                        <Td>
                                            <div className="flex justify-end gap-2 pr-2">
                                                <IconBtn
                                                    title="Sửa"
                                                    onClick={() => openModal(u)}
                                                    disabled={isProcessing || saving}
                                                >
                                                    <Pencil className="size-4" />
                                                </IconBtn>
                                                <IconBtn
                                                    tone="danger"
                                                    title="Xóa"
                                                    onClick={() => deleteUser(u.id)}
                                                    disabled={isProcessing || saving}
                                                >
                                                    <Trash2 className="size-4" />
                                                </IconBtn>
                                            </div>
                                        </Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                open={open}
                title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
                onClose={closeModal}
            >
                <form onSubmit={saveUser} className="space-y-3">
                    <input
                        className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                        placeholder="Tên đăng nhập"
                        value={form.username}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, username: e.target.value }))
                        }
                        required
                    />
                    <input
                        className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                        placeholder="Số điện thoại (10-15 chữ số)"
                        value={form.phone}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, phone: e.target.value }))
                        }
                        pattern="[0-9]{10,15}"
                        required
                    />
                    <div>
                        <input
                            type="password"
                            className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                            placeholder={
                                editingUser
                                    ? 'Mật khẩu mới (để trống nếu không đổi)'
                                    : 'Mật khẩu'
                            }
                            value={form.password}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, password: e.target.value }))
                            }
                            minLength={6}
                            required={!editingUser}
                        />
                        {editingUser && (
                            <p className="mt-1 text-xs text-slate-400">
                                Để trống nếu không muốn đổi mật khẩu
                            </p>
                        )}
                    </div>
                    <select
                        className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                        value={form.roleId}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, roleId: e.target.value }))
                        }
                        required
                    >
                        <option value="">Chọn vai trò</option>
                        {(roles ?? []).map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.roleName}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-emerald-600 py-2 font-medium hover:bg-emerald-700 disabled:opacity-60"
                        disabled={saving}
                    >
                        {saving
                            ? editingUser
                                ? 'Đang cập nhật...'
                                : 'Đang tạo...'
                            : editingUser
                                ? 'Cập nhật'
                                : 'Tạo người dùng'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}

export default UsersSection;
