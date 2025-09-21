// services/userService.js
const { User, Role, Employee } = require('../models');
const bcryptjs = require('bcryptjs');

class UserService {
    async getAllUsers() {
        try {
            return await User.findAll({
                attributes: { exclude: ['password'] }, // Không trả về password
                include: [
                    { model: Role, as: 'role' },
                    { model: Employee, as: 'employee' }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching user accounts: ${error.message}`);
        }
    }

    async getUserById(id) {
        try {
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password'] }, // Không trả về password
                include: [
                    { model: Role, as: 'role' },
                    { model: Employee, as: 'employee' }
                ]
            });
            if (!user) {
                throw new Error('User account not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Error fetching user account: ${error.message}`);
        }
    }

    async createUser(userData) {
        try {
            // Hash password before creating
            if (userData.password) {
                const saltRounds = 10;
                userData.password = await bcryptjs.hash(userData.password, saltRounds);
            }

            const user = await User.create(userData);

            // Return user account without password
            return await this.getUserById(user.id);
        } catch (error) {
            throw new Error(`Error creating user account: ${error.message}`);
        }
    }

    async updateUser(id, updateData) {
        try {
            // Hash password if it's being updated
            if (updateData.password) {
                const saltRounds = 10;
                updateData.password = await bcryptjs.hash(updateData.password, saltRounds);
            }

            const [updatedCount] = await User.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('User account not found or no changes made');
            }
            return await this.getUserById(id);
        } catch (error) {
            throw new Error(`Error updating user account: ${error.message}`);
        }
    }

    async deleteUser(id) {
        try {
            const deletedCount = await User.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('User account not found');
            }
            return { message: 'User account deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting user account: ${error.message}`);
        }
    }

    async getUserByUsername(username) {
        try {
            return await User.findOne({
                where: { username },
                attributes: { exclude: ['password'] }, // Không trả về password
                include: [
                    { model: Role, as: 'role' },
                    { model: Employee, as: 'employee' }
                ]
            });
        } catch (error) {
            throw new Error(`Error fetching user account by username: ${error.message}`);
        }
    }

    async authenticateUser(username, password) {
        try {
            const user = await User.findOne({
                where: {
                    username,
                    isActive: true
                },
                include: [
                    { model: Role, as: 'role' },
                    { model: Employee, as: 'employee' }
                ]
            });

            if (!user) {
                throw new Error('Invalid username or password');
            }

            const isPasswordValid = await bcryptjs.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid username or password');
            }

            // Update last login time
            await User.update(
                { lastLoginAt: new Date() },
                { where: { id: user.id } }
            );

            // Return user without password
            const { password: userPassword, ...userWithoutPassword } = user.toJSON();
            return userWithoutPassword;
        } catch (error) {
            throw new Error(`Error authenticating user: ${error.message}`);
        }
    }

    async changePassword(id, oldPassword, newPassword) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('User account not found');
            }

            const isOldPasswordValid = await bcryptjs.compare(oldPassword, user.password);
            if (!isOldPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            const saltRounds = 10;
            const hashedNewPassword = await bcryptjs.hash(newPassword, saltRounds);

            await User.update(
                { password: hashedNewPassword },
                { where: { id } }
            );

            return { message: 'Password changed successfully' };
        } catch (error) {
            throw new Error(`Error changing password: ${error.message}`);
        }
    }

    async resetPassword(id, newPassword) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error('User account not found');
            }

            const saltRounds = 10;
            const hashedNewPassword = await bcryptjs.hash(newPassword, saltRounds);

            await User.update(
                { password: hashedNewPassword },
                { where: { id } }
            );

            return { message: 'Password reset successfully' };
        } catch (error) {
            throw new Error(`Error resetting password: ${error.message}`);
        }
    }

    async getActiveUsers() {
        try {
            return await User.findAll({
                where: { isActive: true },
                attributes: { exclude: ['password'] },
                include: [
                    { model: Role, as: 'role' },
                    { model: Employee, as: 'employee' }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching active user accounts: ${error.message}`);
        }
    }

    async getInactiveUsers() {
        try {
            return await User.findAll({
                where: { isActive: false },
                attributes: { exclude: ['password'] },
                include: [
                    { model: Role, as: 'role' },
                    { model: Employee, as: 'employee' }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching inactive user accounts: ${error.message}`);
        }
    }

    async deactivateUser(id) {
        try {
            const [updatedCount] = await User.update(
                { isActive: false },
                { where: { id } }
            );
            if (updatedCount === 0) {
                throw new Error('User account not found');
            }
            return await this.getUserById(id);
        } catch (error) {
            throw new Error(`Error deactivating user account: ${error.message}`);
        }
    }

    async activateUser(id) {
        try {
            const [updatedCount] = await User.update(
                { isActive: true },
                { where: { id } }
            );
            if (updatedCount === 0) {
                throw new Error('User account not found');
            }
            return await this.getUserById(id);
        } catch (error) {
            throw new Error(`Error activating user account: ${error.message}`);
        }
    }

    async getUsersByRoleId(roleId) {
        try {
            return await User.findAll({
                where: { roleId },
                attributes: { exclude: ['password'] },
                include: [
                    { model: Role, as: 'role' },
                    { model: Employee, as: 'employee' }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching user accounts by role ID: ${error.message}`);
        }
    }

    async checkUsernameExists(username, excludeId = null) {
        try {
            const whereCondition = { username };
            if (excludeId) {
                whereCondition.id = { [require('sequelize').Op.ne]: excludeId };
            }

            const user = await User.findOne({
                where: whereCondition
            });

            return !!user; // Return boolean
        } catch (error) {
            throw new Error(`Error checking username exists: ${error.message}`);
        }
    }

    async updateLastLogin(id) {
        try {
            const [updatedCount] = await User.update(
                { lastLoginAt: new Date() },
                { where: { id } }
            );
            if (updatedCount === 0) {
                throw new Error('User account not found');
            }
            return { message: 'Last login updated successfully' };
        } catch (error) {
            throw new Error(`Error updating last login: ${error.message}`);
        }
    }

    async getUserStats() {
        try {
            const totalUsers = await User.count();
            const activeUsers = await User.count({ where: { isActive: true } });
            const inactiveUsers = await User.count({ where: { isActive: false } });

            const { Op, BulkRecordError } = require('sequelize');
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
            throw new Error(`Error fetching user account stats: ${error.message}`);
        }
    }
}

module.exports = new UserService();
