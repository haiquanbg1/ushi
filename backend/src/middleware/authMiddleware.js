const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/response");
const { decodeAccessToken, decodeRefreshToken, createAccessToken } = require("../utils/jwt");
const userService = require("../services/userService");
const ms = require("ms");

// Constants for better maintainability
const COOKIE_CONFIG = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Chỉ dùng HTTPS trong production
    sameSite: 'strict', // CSRF protection
    maxAge: ms("7 days")
};

const ERROR_MESSAGES = {
    NO_REFRESH_TOKEN: "Authentication expired. Please log in again.",
    INVALID_REFRESH_TOKEN: "Invalid authentication. Please log in again.",
    REFRESH_TOKEN_EXPIRED: "Session expired. Please log in again.",
    UNAUTHORIZED: "Authentication required. Please log in."
};

const logout = (res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("isLogin", cookieOptions);
};

const authMiddleware = async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies || {};

    // Kiểm tra xem có token nào không
    if (!accessToken && !refreshToken) {
        return errorResponse(
            res,
            StatusCodes.UNAUTHORIZED,
            ERROR_MESSAGES.UNAUTHORIZED
        );
    }

    try {
        // Thử decode access token trước
        if (accessToken) {
            const decodedAccessToken = decodeAccessToken(accessToken);

            // Cache user để tránh query database không cần thiết
            if (req.user?.id !== decodedAccessToken.userId) {
                req.user = await userService.findOne({
                    id: decodedAccessToken.userId
                });
            }

            // Kiểm tra user có tồn tại không
            if (!req.user) {
                logout(res);
                return errorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    ERROR_MESSAGES.UNAUTHORIZED
                );
            }

            return next();
        }
    } catch (accessTokenError) {
        // Access token không hợp lệ hoặc hết hạn, thử refresh token
        console.warn("Access token validation failed:", accessTokenError.message);
    }

    // Xử lý refresh token
    if (!refreshToken) {
        logout(res);
        return errorResponse(
            res,
            StatusCodes.UNAUTHORIZED,
            ERROR_MESSAGES.NO_REFRESH_TOKEN
        );
    }

    try {
        const decodedRefreshToken = decodeRefreshToken(refreshToken);

        // Tìm user từ refresh token
        const user = await userService.findOne({
            id: decodedRefreshToken.userId
        });

        if (!user) {
            logout(res);
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                ERROR_MESSAGES.INVALID_REFRESH_TOKEN
            );
        }

        // Tạo access token mới
        const newAccessToken = createAccessToken({
            userId: user.id
        });

        // Set cookie với config bảo mật
        res.cookie("accessToken", newAccessToken, COOKIE_CONFIG);

        req.user = user;

        // Log để audit
        console.info(`Token refreshed for user ${user.id}`);

        next();

    } catch (refreshTokenError) {
        console.warn("Refresh token validation failed:", refreshTokenError.message);

        logout(res);

        // Phân biệt lỗi hết hạn và lỗi khác
        const isExpired = refreshTokenError?.message?.includes("expired");
        const errorMessage = isExpired
            ? ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED
            : ERROR_MESSAGES.INVALID_REFRESH_TOKEN;

        return errorResponse(
            res,
            StatusCodes.UNAUTHORIZED,
            errorMessage
        );
    }
};

module.exports = authMiddleware;
