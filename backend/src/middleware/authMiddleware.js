const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/response");
const {
    decodeAccessToken,
    decodeRefreshToken,
    createAccessToken,
    createRefreshToken
} = require("../utils/jwt");
const userService = require("../services/userService");
const ms = require("ms");

// Tách riêng config cho từng loại token
const ACCESS_TOKEN_CONFIG = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: ms("15m") // Access token ngắn hạn
};

const REFRESH_TOKEN_CONFIG = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: ms("7d") // Refresh token dài hạn
};

const ERROR_MESSAGES = {
    NO_REFRESH_TOKEN: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    INVALID_REFRESH_TOKEN: "Xác thực không hợp lệ. Vui lòng đăng nhập lại.",
    REFRESH_TOKEN_EXPIRED: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
    UNAUTHORIZED: "Bạn cần đăng nhập để tiếp tục.",
    USER_INACTIVE: "Tài khoản đã bị vô hiệu hóa."
};

const logout = (res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
};

// Helper function để validate user
const validateUser = (user) => {
    if (!user) return false;
    // Thêm các điều kiện khác nếu cần: user.isActive, user.status, etc.
    return true;
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
            const user = await userService.getUserById(decodedAccessToken.userId);

            // Validate user
            if (!validateUser(user)) {
                logout(res);
                return errorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    ERROR_MESSAGES.USER_INACTIVE
                );
            }

            req.user = user;
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
        const user = await userService.getUserById(decodedRefreshToken.userId);

        // Validate user
        if (!validateUser(user)) {
            logout(res);
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                ERROR_MESSAGES.USER_INACTIVE
            );
        }

        // Tạo CẢ access và refresh token mới (Token Rotation)
        const newAccessToken = createAccessToken({ userId: user.id });
        const newRefreshToken = createRefreshToken({ userId: user.id });

        // Set cookies với config riêng biệt
        res.cookie("accessToken", newAccessToken, ACCESS_TOKEN_CONFIG);
        res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_CONFIG);

        req.user = user;

        // Log để audit
        console.info(`Tokens refreshed for user ${user.id}`);

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