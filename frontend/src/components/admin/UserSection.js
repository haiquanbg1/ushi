'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Badge from '../utils/Badge';
import IconBtn from '../utils/IconBtn';
import { Th, Td } from '../utils/Table';
import Modal from '../utils/Modal';
import { userAPI, roleAPI } from '@/lib/api';

function UsersSection() {
    const [rows, setRows] = useState([]);
    const [roles, setRoles] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({
        username: '',
        phone: '',
        password: '',
        roleId: ''
    });

    const load = async () => {
        try {
            setLoading(true);
            const [users, rolesData] = await Promise.all([
                userAPI.getAll(),
                roleAPI.getAll()
            ]);
            setRows(users.data.data.users);
            setRoles(rolesData.data.data);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Không thể tải danh sách người dùng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setForm({
                username: user.username,
                phone: user.phone,
                password: '', // Không hiển thị password cũ
                roleId: user.roleId
            });
        } else {
            setEditingUser(null);
            setForm({ username: '', phone: '', password: '', roleId: '' });
        }
        setOpen(true);
    };

    const saveUser = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...form,
                roleId: parseInt(form.roleId),
                isActive: true
            };

            // Nếu đang edit và không đổi password, xóa field password
            if (editingUser && !form.password) {
                delete data.password;
            }

            if (editingUser) {
                await userAPI.update(editingUser.id, data);
            } else {
                await userAPI.create(data);
            }

            setOpen(false);
            setEditingUser(null);
            setForm({ username: '', phone: '', password: '', roleId: '' });
            await load();
        } catch (error) {
            console.error('Error saving user:', error);
            const errorMsg = error.response?.data?.message || 'Không thể lưu người dùng. Vui lòng thử lại.';
            alert(errorMsg);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
        try {
            await userAPI.delete(id);
            await load();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Không thể xóa người dùng. Vui lòng thử lại.');
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            if (currentStatus) {
                await userAPI.deactivate(userId);
            } else {
                await userAPI.activate(userId);
            }
            await load();
        } catch (error) {
            console.error('Error toggling user status:', error);
            alert('Không thể thay đổi trạng thái người dùng.');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Đang tải...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Quản lý người dùng</h2>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm hover:bg-slate-800"
                >
                    <Plus className="size-4" /> Thêm người dùng
                </button>
            </div>

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
                        {rows.map((u, idx) => (
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
                                        onClick={() => toggleUserStatus(u.id, u.isActive)}
                                        className="cursor-pointer"
                                    >
                                        <Badge tone={u.isActive ? 'emerald' : 'rose'}>
                                            {u.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                        </Badge>
                                    </button>
                                </Td>
                                <Td>
                                    <div className="flex justify-end gap-2 pr-2">
                                        <IconBtn title="Sửa" onClick={() => openModal(u)}>
                                            <Pencil className="size-4" />
                                        </IconBtn>
                                        <IconBtn
                                            tone="danger"
                                            title="Xóa"
                                            onClick={() => deleteUser(u.id)}
                                        >
                                            <Trash2 className="size-4" />
                                        </IconBtn>
                                    </div>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                open={open}
                title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
                onClose={() => {
                    setOpen(false);
                    setEditingUser(null);
                }}
            >
                <form onSubmit={saveUser} className="space-y-3">
                    <input
                        className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                        placeholder="Tên đăng nhập"
                        value={form.username}
                        onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                        required
                    />
                    <input
                        className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                        placeholder="Số điện thoại (10-15 chữ số)"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        pattern="[0-9]{10,15}"
                        required
                    />
                    <div>
                        <input
                            type="password"
                            className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2"
                            placeholder={editingUser ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            minLength="6"
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
                        onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}
                        required
                    >
                        <option value="">Chọn vai trò</option>
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.roleName}</option>
                        ))}
                    </select>
                    <button className="w-full rounded-xl bg-emerald-600 py-2 font-medium hover:bg-emerald-700">
                        {editingUser ? 'Cập nhật' : 'Tạo người dùng'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}

export default UsersSection;