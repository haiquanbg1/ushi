// controllers/authController.js
const { StatusCodes } = require("http-status-codes");
const { successResponse, errorResponse } = require("../utils/response");
const { createAccessToken, createRefreshToken } = require("../utils/jwt");
const userService = require("../services/userService");
const roleService = require("../services/roleService");
const customerService = require("../services/customerService");
const ms = require("ms");

// Cookie configuration
const COOKIE_CONFIG = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
};

const ACCESS_TOKEN_CONFIG = {
    ...COOKIE_CONFIG,
    maxAge: ms("15m") // 15 phút
};

const REFRESH_TOKEN_CONFIG = {
    ...COOKIE_CONFIG,
    maxAge: ms("7d") // 7 ngày
};

module.exports = {
    /**
     * Đăng ký người dùng mới
     */
    register: async (req, res) => {
        try {
            const { username, phone, password, confirmPassword, role = null } = req.body;

            // Validation
            if (!phone || !password || !confirmPassword) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Phone, password are required"
                );
            }

            if (password !== confirmPassword) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Password and confirm password do not match"
                );
            }

            if (password.length < 6) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Password must be at least 6 characters long"
                );
            }

            // Check if phone already exists
            const phoneExists = await userService.checkPhoneExists(phone);
            if (phoneExists) {
                return errorResponse(
                    res,
                    StatusCodes.CONFLICT,
                    "Phone already exists"
                );
            }

            const roleByName = await roleService.getRoleByName(role);

            // Create user data
            const userData = {
                username,
                phone,
                password,
                roleId: roleByName.id || 3,
                isActive: true
            };

            // Create new user
            const user = await userService.createUser(userData);
            const response = {
                user: {
                    id: user.id,
                    phone: user.phone,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                },
            }

            if (role == "Customer") {
                const customer = await customerService.create({ userId: user.id, fullName: username });
                response.customer = {
                    customerId: customer.id,
                }
            }

            return successResponse(
                res,
                StatusCodes.CREATED,
                "Registration successful",
                response
            );

        } catch (error) {
            console.error("Registration error:", error.message);

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
                "Registration failed. Please try again."
            );
        }
    },

    /**
     * Đăng nhập người dùng
     */
    login: async (req, res) => {
        try {
            const { phone, password } = req.body;

            // Validation
            if (!phone || !password) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Phone and password are required"
                );
            }

            // Authenticate user
            const user = await userService.authenticateUser(phone, password);

            // Create tokens
            const accessToken = createAccessToken({ userId: user.id });
            const refreshToken = createRefreshToken({ userId: user.id });

            // Set cookies
            res.cookie("accessToken", accessToken, ACCESS_TOKEN_CONFIG);
            res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_CONFIG);

            // Log successful login
            console.info(`User ${user.username} logged in successfully`);

            return successResponse(
                res,
                StatusCodes.OK,
                "Login successful",
                {
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                        phone: user.phone,
                        email: user.email,
                    }
                }
            );

        } catch (error) {
            console.error("Login error:", error.message);

            // Don't reveal too much information about authentication failures
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                "Invalid phone or password"
            );
        }
    },

    /**
     * Đăng xuất người dùng
     */
    logout: async (req, res) => {
        try {
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            };

            // Clear all auth cookies
            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);

            console.info(`User ${req.user?.username || 'unknown'} logged out`);

            return successResponse(
                res,
                StatusCodes.OK,
                "Logout successful"
            );

        } catch (error) {
            console.error("Logout error:", error.message);
            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "An error occurred during logout"
            );
        }
    },

    /**
     * Lấy thông tin người dùng hiện tại
     */
    me: async (req, res) => {
        try {
            const user = await userService.getUserById(req.user.id);

            return successResponse(
                res,
                StatusCodes.OK,
                "User information retrieved successfully",
                {
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                        isActive: user.isActive,
                        lastLoginAt: user.lastLoginAt,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                }
            );

        } catch (error) {
            console.error("Get user info error:", error.message);
            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to retrieve user information"
            );
        }
    },

    /**
     * Đổi mật khẩu
     */
    changePassword: async (req, res) => {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;

            // Validation
            if (!oldPassword || !newPassword || !confirmPassword) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Old password, new password, and confirm password are required"
                );
            }

            if (newPassword !== confirmPassword) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "New password and confirm password do not match"
                );
            }

            if (newPassword.length < 6) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "New password must be at least 6 characters long"
                );
            }

            // Change password
            await userService.changePassword(req.user.id, oldPassword, newPassword);

            console.info(`User ${req.user.username} changed password successfully`);

            return successResponse(
                res,
                StatusCodes.OK,
                "Password changed successfully"
            );

        } catch (error) {
            console.error("Change password error:", error.message);

            if (error.message.includes("Current password is incorrect")) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Current password is incorrect"
                );
            }

            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to change password"
            );
        }
    },

    /**
     * Refresh access token
     */
    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return errorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    "Refresh token not found"
                );
            }

            // This will be handled by auth middleware, just return success
            return successResponse(
                res,
                StatusCodes.OK,
                "Token refreshed successfully"
            );

        } catch (error) {
            console.error("Refresh token error:", error.message);
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                "Invalid refresh token"
            );
        }
    },

    /**
     * Kiểm tra trạng thái đăng nhập
     */
    checkAuth: async (req, res) => {
        try {
            return successResponse(
                res,
                StatusCodes.OK,
                "User is authenticated",
                {
                    isAuthenticated: true,
                    user: {
                        id: req.user.id,
                        username: req.user.username,
                        role: req.user.role,
                        phone: req.user.phone,
                        email: req.user.email,
                    }
                }
            );

        } catch (error) {
            console.error("Check auth error:", error.message);
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                "User is not authenticated"
            );
        }
    },

    /**
     * Reset mật khẩu (chỉ admin)
     */
    resetPassword: async (req, res) => {
        try {
            const { userId, newPassword } = req.body;

            // Validation
            if (!userId || !newPassword) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "User ID and new password are required"
                );
            }

            if (newPassword.length < 6) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "New password must be at least 6 characters long"
                );
            }

            // Reset password
            await userService.resetPassword(userId, newPassword);

            console.info(`Admin ${req.user.username} reset password for user ID ${userId}`);

            return successResponse(
                res,
                StatusCodes.OK,
                "Password reset successfully"
            );

        } catch (error) {
            console.error("Reset password error:", error.message);

            if (error.message.includes("User account not found")) {
                return errorResponse(
                    res,
                    StatusCodes.NOT_FOUND,
                    "User not found"
                );
            }

            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to reset password"
            );
        }
    }
}
