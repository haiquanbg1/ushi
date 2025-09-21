// controllers/userController.js
const { StatusCodes } = require("http-status-codes");
const { successResponse, errorResponse } = require("../utils/response");
const userService = require("../services/userService");

class UserController {
    /**
     * Lấy danh sách tất cả users
     */
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10, search, roleId } = req.query;

            // For now, get all users (you can implement pagination later)
            let users = await userService.getAllUsers();

            // Filter by role if specified
            if (roleId) {
                users = users.filter(user => user.roleId === parseInt(roleId));
            }

            // Search functionality
            if (search) {
                const searchTerm = search.toLowerCase();
                users = users.filter(user =>
                    user.username.toLowerCase().includes(searchTerm) ||
                    (user.employee?.fullName && user.employee.fullName.toLowerCase().includes(searchTerm)) ||
                    (user.role?.roleName && user.role.roleName.toLowerCase().includes(searchTerm))
                );
            }

            return successResponse(
                res,
                StatusCodes.OK,
                "Users retrieved successfully",
                {
                    users,
                    total: users.length,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            );

        } catch (error) {
            console.error("Get all users error:", error.message);
            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to retrieve users"
            );
        }
    }

    /**
     * Lấy danh sách users active
     */
    async getActiveUsers(req, res) {
        try {
            const users = await userService.getActiveUsers();

            return successResponse(
                res,
                StatusCodes.OK,
                "Active users retrieved successfully",
                { users }
            );

        } catch (error) {
            console.error("Get active users error:", error.message);
            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to retrieve active users"
            );
        }
    }

    /**
     * Lấy danh sách users inactive
     */
    async getInactiveUsers(req, res) {
        try {
            const users = await userService.getInactiveUsers();

            return successResponse(
                res,
                StatusCodes.OK,
                "Inactive users retrieved successfully",
                { users }
            );

        } catch (error) {
            console.error("Get inactive users error:", error.message);
            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_SERVER,
                "Failed to retrieve inactive users"
            );
        }
    }

    /**
     * Lấy thống kê users
     */
    async getUserStats(req, res) {
        try {
            const stats = await userService.getUserStats();

            return successResponse(
                res,
                StatusCodes.OK,
                "User statistics retrieved successfully",
                { stats }
            );

        } catch (error) {
            console.error("Get user stats error:", error.message);
            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to retrieve user statistics"
            );
        }
    }

    /**
     * Lấy users theo role ID
     */
    async getUsersByRole(req, res) {
        try {
            const { roleId } = req.params;
            const users = await userService.getUsersByRoleId(parseInt(roleId));

            return successResponse(
                res,
                StatusCodes.OK,
                "Users by role retrieved successfully",
                { users }
            );

        } catch (error) {
            console.error("Get users by role error:", error.message);
            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to retrieve users by role"
            );
        }
    }

    /**
     * Lấy user theo ID
     */
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(parseInt(id));

            return successResponse(
                res,
                StatusCodes.OK,
                "User retrieved successfully",
                { user }
            );

        } catch (error) {
            console.error("Get user by ID error:", error.message);

            if (error.message.includes("not found")) {
                return errorResponse(
                    res,
                    StatusCodes.NOT_FOUND,
                    "User not found"
                );
            }

            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to retrieve user"
            );
        }
    }

    /**
     * Tạo user mới
     */
    async createUser(req, res) {
        try {
            const userData = req.body;

            // Set default values
            userData.isActive = userData.isActive !== undefined ? userData.isActive : true;

            const user = await userService.createUser(userData);

            console.info(`User created: ${user.username} by admin ${req.user.username}`);

            return successResponse(
                res,
                StatusCodes.CREATED,
                "User created successfully",
                { user }
            );

        } catch (error) {
            console.error("Create user error:", error.message);

            // Handle specific errors
            if (error.message.includes("username") && error.message.includes("exists")) {
                return errorResponse(
                    res,
                    StatusCodes.CONFLICT,
                    "Username already exists"
                );
            }

            if (error.message.includes("role") || error.message.includes("foreign key")) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Invalid role specified"
                );
            }

            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to create user"
            );
        }
    }

    /**
     * Cập nhật user
     */
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Remove sensitive fields that shouldn't be updated directly
            delete updateData.password; // Use change password endpoint instead
            delete updateData.id;

            // Only admin can change role and isActive status
            if (req.user.role?.roleName !== 'Admin') {
                delete updateData.roleId;
                delete updateData.isActive;
            }

            const user = await userService.updateUser(parseInt(id), updateData);

            console.info(`User ${id} updated by ${req.user.username}`);

            return successResponse(
                res,
                StatusCodes.OK,
                "User updated successfully",
                { user }
            );

        } catch (error) {
            console.error("Update user error:", error.message);

            if (error.message.includes("not found")) {
                return errorResponse(
                    res,
                    StatusCodes.NOT_FOUND,
                    "User not found"
                );
            }

            if (error.message.includes("username") && error.message.includes("exists")) {
                return errorResponse(
                    res,
                    StatusCodes.CONFLICT,
                    "Username already exists"
                );
            }

            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to update user"
            );
        }
    }

    /**
     * Xóa user
     */
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Prevent deleting self
            if (parseInt(id) === req.user.id) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Cannot delete your own account"
                );
            }

            await userService.deleteUser(parseInt(id));

            console.info(`User ${id} deleted by admin ${req.user.username}`);

            return successResponse(
                res,
                StatusCodes.OK,
                "User deleted successfully"
            );

        } catch (error) {
            console.error("Delete user error:", error.message);

            if (error.message.includes("not found")) {
                return errorResponse(
                    res,
                    StatusCodes.NOT_FOUND,
                    "User not found"
                );
            }

            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to delete user"
            );
        }
    }

    /**
     * Kích hoạt user
     */
    async activateUser(req, res) {
        try {
            const { id } = req.params;
            const user = await userService.activateUser(parseInt(id));

            console.info(`User ${id} activated by admin ${req.user.username}`);

            return successResponse(
                res,
                StatusCodes.OK,
                "User activated successfully",
                { user }
            );

        } catch (error) {
            console.error("Activate user error:", error.message);

            if (error.message.includes("not found")) {
                return errorResponse(
                    res,
                    StatusCodes.NOT_FOUND,
                    "User not found"
                );
            }

            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to activate user"
            );
        }
    }

    /**
     * Vô hiệu hóa user
     */
    async deactivateUser(req, res) {
        try {
            const { id } = req.params;

            // Prevent deactivating self
            if (parseInt(id) === req.user.id) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Cannot deactivate your own account"
                );
            }

            const user = await userService.deactivateUser(parseInt(id));

            console.info(`User ${id} deactivated by admin ${req.user.username}`);

            return successResponse(
                res,
                StatusCodes.OK,
                "User deactivated successfully",
                { user }
            );

        } catch (error) {
            console.error("Deactivate user error:", error.message);

            if (error.message.includes("not found")) {
                return errorResponse(
                    res,
                    StatusCodes.NOT_FOUND,
                    "User not found"
                );
            }

            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to deactivate user"
            );
        }
    }
}

module.exports = new UserController();
