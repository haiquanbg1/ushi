// services/userService.js
const { User, Role } = require('../models');
const bcryptjs = require('bcryptjs');

class UserService {

    async getAllUsers() {
        try {
            return await User.findAll({
                attributes: { exclude: ['password'] },
                include: [{ model: Role, as: 'role' }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách người dùng: ${error.message}`);
        }
    }

    async getUserById(id) {
        try {
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password'] },
                include: [{ model: Role, as: 'role' }]
            });

            if (!user) {
                throw new Error('Không tìm thấy tài khoản người dùng.');
            }

            return user;
        } catch (error) {
            throw new Error(`Lỗi khi lấy tài khoản người dùng: ${error.message}`);
        }
    }

    async createUser(userData) {
        try {
            if (userData.password) {
                const saltRounds = 10;
                userData.password = await bcryptjs.hash(userData.password, saltRounds);
            }

            const user = await User.create(userData);
            return await this.getUserById(user.id);

        } catch (error) {
            throw new Error(`Lỗi khi tạo tài khoản người dùng: ${error.message}`);
        }
    }

    async updateUser(id, updateData) {
        try {
            if (updateData.password) {
                const saltRounds = 10;
                updateData.password = await bcryptjs.hash(updateData.password, saltRounds);
            }

            const [updatedCount] = await User.update(updateData, { where: { id } });

            if (updatedCount === 0) {
                throw new Error('Không tìm thấy tài khoản hoặc không có thay đổi nào.');
            }

            return await this.getUserById(id);

        } catch (error) {
            throw new Error(`Lỗi khi cập nhật tài khoản người dùng: ${error.message}`);
        }
    }

    async deleteUser(id) {
        try {
            const deletedCount = await User.destroy({ where: { id } });

            if (deletedCount === 0) {
                throw new Error('Không tìm thấy tài khoản người dùng.');
            }

            return { message: 'Xóa tài khoản thành công.' };

        } catch (error) {
            throw new Error(`Lỗi khi xóa tài khoản người dùng: ${error.message}`);
        }
    }

    async getUserByUsername(username) {
        try {
            return await User.findOne({
                where: { username },
                attributes: { exclude: ['password'] },
                include: [{ model: Role, as: 'role' }]
            });
        } catch (error) {
            throw new Error(`Lỗi khi lấy tài khoản theo username: ${error.message}`);
        }
    }

    async getUserByPhone(phone) {
        try {
            return await User.findOne({
                where: { phone },
                attributes: { exclude: ['password'] },
                include: [{ model: Role, as: 'role' }]
            });
        } catch (error) {
            throw new Error(`Lỗi khi lấy tài khoản theo số điện thoại: ${error.message}`);
        }
    }

    async authenticateUser(phone, password) {
        try {
            const user = await User.findOne({
                where: { phone, isActive: true },
                include: [{ model: Role, as: 'role' }]
            });

            if (!user) {
                throw new Error('Số điện thoại hoặc mật khẩu không đúng.');
            }

            const isPasswordValid = await bcryptjs.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Số điện thoại hoặc mật khẩu không đúng.');
            }

            await User.update(
                { lastLoginAt: new Date() },
                { where: { id: user.id } }
            );

            const { password: _, ...userWithoutPassword } = user.toJSON();
            return userWithoutPassword;

        } catch (error) {
            throw new Error(`Lỗi khi đăng nhập: ${error.message}`);
        }
    }

    async changePassword(id, oldPassword, newPassword) {
        try {
            const user = await User.findByPk(id);

            if (!user) {
                throw new Error('Không tìm thấy tài khoản người dùng.');
            }

            const isOldPasswordValid = await bcryptjs.compare(oldPassword, user.password);
            if (!isOldPasswordValid) {
                throw new Error('Mật khẩu hiện tại không đúng.');
            }

            const hashedNewPassword = await bcryptjs.hash(newPassword, 10);

            await User.update(
                { password: hashedNewPassword },
                { where: { id } }
            );

            return { message: 'Đổi mật khẩu thành công.' };

        } catch (error) {
            throw new Error(`Lỗi khi đổi mật khẩu: ${error.message}`);
        }
    }

    async resetPassword(id, newPassword) {
        try {
            const user = await User.findByPk(id);

            if (!user) {
                throw new Error('Không tìm thấy tài khoản người dùng.');
            }

            const hashedNewPassword = await bcryptjs.hash(newPassword, 10);

            await User.update(
                { password: hashedNewPassword },
                { where: { id } }
            );

            return { message: 'Đặt lại mật khẩu thành công.' };

        } catch (error) {
            throw new Error(`Lỗi khi đặt lại mật khẩu: ${error.message}`);
        }
    }

    async getActiveUsers() {
        try {
            return await User.findAll({
                where: { isActive: true },
                attributes: { exclude: ['password'] },
                include: [{ model: Role, as: 'role' }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách tài khoản đang hoạt động: ${error.message}`);
        }
    }

    async getInactiveUsers() {
        try {
            return await User.findAll({
                where: { isActive: false },
                attributes: { exclude: ['password'] },
                include: [{ model: Role, as: 'role' }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách tài khoản không hoạt động: ${error.message}`);
        }
    }

    async deactivateUser(id) {
        try {
            const [updatedCount] = await User.update(
                { isActive: false },
                { where: { id } }
            );

            if (updatedCount === 0) {
                throw new Error('Không tìm thấy tài khoản người dùng.');
            }

            return await this.getUserById(id);

        } catch (error) {
            throw new Error(`Lỗi khi vô hiệu hóa tài khoản: ${error.message}`);
        }
    }

    async activateUser(id) {
        try {
            const [updatedCount] = await User.update(
                { isActive: true },
                { where: { id } }
            );

            if (updatedCount === 0) {
                throw new Error('Không tìm thấy tài khoản người dùng.');
            }

            return await this.getUserById(id);

        } catch (error) {
            throw new Error(`Lỗi khi kích hoạt tài khoản: ${error.message}`);
        }
    }

    async getUsersByRoleId(roleId) {
        try {
            return await User.findAll({
                where: { roleId },
                attributes: { exclude: ['password'] },
                include: [{ model: Role, as: 'role' }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Lỗi khi lấy danh sách theo vai trò: ${error.message}`);
        }
    }

    async checkUsernameExists(username, excludeId = null) {
        try {
            const whereCondition = { username };

            if (excludeId) {
                whereCondition.id = { [require('sequelize').Op.ne]: excludeId };
            }

            const user = await User.findOne({ where: whereCondition });
            return !!user;

        } catch (error) {
            throw new Error(`Lỗi khi kiểm tra username tồn tại: ${error.message}`);
        }
    }

    async checkPhoneExists(phone, excludeId = null) {
        try {
            const whereCondition = { phone };

            if (excludeId) {
                whereCondition.id = { [require('sequelize').Op.ne]: excludeId };
            }

            const user = await User.findOne({ where: whereCondition });
            return !!user;

        } catch (error) {
            throw new Error(`Lỗi khi kiểm tra số điện thoại tồn tại: ${error.message}`);
        }
    }

    async updateLastLogin(id) {
        try {
            const [updatedCount] = await User.update(
                { lastLoginAt: new Date() },
                { where: { id } }
            );

            if (updatedCount === 0) {
                throw new Error('Không tìm thấy tài khoản người dùng.');
            }

            return { message: 'Cập nhật thời gian đăng nhập gần nhất thành công.' };

        } catch (error) {
            throw new Error(`Lỗi khi cập nhật thời gian đăng nhập: ${error.message}`);
        }
    }

    async getUserStats() {
        try {
            const totalUsers = await User.count();
            const activeUsers = await User.count({ where: { isActive: true } });
            const inactiveUsers = await User.count({ where: { isActive: false } });

            const { Op } = require('sequelize');
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentLoginUsers = await User.count({
                where: {
                    lastLoginAt: { [Op.gte]: thirtyDaysAgo },
                    isActive: true
                }
            });

            return {
                totalUsers,
                activeUsers,
                inactiveUsers,
                recentLoginUsers
            };

        } catch (error) {
            throw new Error(`Lỗi khi lấy thống kê tài khoản: ${error.message}`);
        }
    }
}

module.exports = new UserService();
