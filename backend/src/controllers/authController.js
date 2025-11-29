// controllers/authController.js
const { StatusCodes } = require("http-status-codes");
const { successResponse, errorResponse } = require("../utils/response");
const { createAccessToken, createRefreshToken } = require("../utils/jwt");
const userService = require("../services/userService");
const roleService = require("../services/roleService");
const customerService = require("../services/customerService");
const ms = require("ms");

const COOKIE_CONFIG = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
};

const ACCESS_TOKEN_CONFIG = {
    ...COOKIE_CONFIG,
    maxAge: ms("15m")
};

const REFRESH_TOKEN_CONFIG = {
    ...COOKIE_CONFIG,
    maxAge: ms("7d")
};

module.exports = {
    /**
     * Đăng ký người dùng mới
     */
    register: async (req, res) => {
        try {
            const { username, phone, password, confirmPassword, role = null } = req.body;

            if (!phone || !password || !confirmPassword) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Vui lòng nhập đầy đủ số điện thoại và mật khẩu."
                );
            }

            if (password !== confirmPassword) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Mật khẩu và mật khẩu xác nhận không trùng khớp."
                );
            }

            if (password.length < 6) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Mật khẩu phải có ít nhất 6 ký tự."
                );
            }

            const phoneExists = await userService.checkPhoneExists(phone);
            if (phoneExists) {
                return errorResponse(
                    res,
                    StatusCodes.CONFLICT,
                    "Số điện thoại đã tồn tại."
                );
            }

            const roleByName = await roleService.getRoleByName(role);

            const userData = {
                username,
                phone,
                password,
                roleId: roleByName.id || 3,
                isActive: true
            };

            const user = await userService.createUser(userData);

            const response = {
                user: {
                    id: user.id,
                    phone: user.phone,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                },
            };

            if (role == "Customer") {
                const customer = await customerService.create({
                    userId: user.id,
                    fullName: username
                });

                response.customer = { customerId: customer.id };
            }

            return successResponse(
                res,
                StatusCodes.CREATED,
                "Đăng ký tài khoản thành công.",
                response
            );

        } catch (error) {
            console.error("Registration error:", error.message);

            if (error.message.includes("username") && error.message.includes("exists")) {
                return errorResponse(
                    res,
                    StatusCodes.CONFLICT,
                    "Tên người dùng đã tồn tại."
                );
            }

            if (error.message.includes("role") || error.message.includes("foreign key")) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Vai trò không hợp lệ."
                );
            }

            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Đăng ký thất bại. Vui lòng thử lại."
            );
        }
    },

    /**
     * Đăng nhập người dùng
     */
    login: async (req, res) => {
        try {
            const { phone, password } = req.body;

            if (!phone || !password) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Vui lòng nhập số điện thoại và mật khẩu."
                );
            }

            const user = await userService.authenticateUser(phone, password);

            const accessToken = createAccessToken({ userId: user.id });
            const refreshToken = createRefreshToken({ userId: user.id });

            res.cookie("accessToken", accessToken, ACCESS_TOKEN_CONFIG);
            res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_CONFIG);

            console.info(`User ${user.username} logged in successfully`);

            return successResponse(
                res,
                StatusCodes.OK,
                "Đăng nhập thành công.",
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

            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                "Số điện thoại hoặc mật khẩu không chính xác."
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

            res.clearCookie("accessToken", cookieOptions);
            res.clearCookie("refreshToken", cookieOptions);

            return successResponse(
                res,
                StatusCodes.OK,
                "Đăng xuất thành công."
            );

        } catch (error) {
            console.error("Logout error:", error.message);
            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Đã xảy ra lỗi khi đăng xuất."
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
                "Lấy thông tin người dùng thành công.",
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
                "Không thể lấy thông tin người dùng."
            );
        }
    },

    /**
     * Đổi mật khẩu
     */
    changePassword: async (req, res) => {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;

            if (!oldPassword || !newPassword || !confirmPassword) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Vui lòng nhập đầy đủ thông tin mật khẩu."
                );
            }

            if (newPassword !== confirmPassword) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Mật khẩu mới và mật khẩu xác nhận không trùng khớp."
                );
            }

            if (newPassword.length < 6) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Mật khẩu mới phải có ít nhất 6 ký tự."
                );
            }

            await userService.changePassword(req.user.id, oldPassword, newPassword);

            return successResponse(
                res,
                StatusCodes.OK,
                "Đổi mật khẩu thành công."
            );

        } catch (error) {
            console.error("Change password error:", error.message);

            if (error.message.includes("Current password is incorrect")) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Mật khẩu hiện tại không đúng."
                );
            }

            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Không thể đổi mật khẩu."
            );
        }
    },

    /**
     * Refresh token
     */
    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return errorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    "Không tìm thấy refresh token."
                );
            }

            return successResponse(
                res,
                StatusCodes.OK,
                "Làm mới token thành công."
            );

        } catch (error) {
            console.error("Refresh token error:", error.message);
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                "Refresh token không hợp lệ."
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
                "Người dùng đã đăng nhập.",
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
                "Người dùng chưa đăng nhập."
            );
        }
    },

    /**
     * Reset mật khẩu (chỉ admin)
     */
    resetPassword: async (req, res) => {
        try {
            const { userId, newPassword } = req.body;

            if (!userId || !newPassword) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Vui lòng nhập đầy đủ ID người dùng và mật khẩu mới."
                );
            }

            if (newPassword.length < 6) {
                return errorResponse(
                    res,
                    StatusCodes.BAD_REQUEST,
                    "Mật khẩu mới phải có ít nhất 6 ký tự."
                );
            }

            await userService.resetPassword(userId, newPassword);

            return successResponse(
                res,
                StatusCodes.OK,
                "Đặt lại mật khẩu thành công."
            );

        } catch (error) {
            console.error("Reset password error:", error.message);

            if (error.message.includes("User account not found")) {
                return errorResponse(
                    res,
                    StatusCodes.NOT_FOUND,
                    "Không tìm thấy người dùng."
                );
            }

            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Không thể đặt lại mật khẩu."
            );
        }
    }
};
