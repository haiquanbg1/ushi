// middleware/roleMiddleware.js
const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/response");

/**
 * Middleware kiểm tra quyền truy cập dựa trên role
 * @param {string|string[]} allowedRoles - Role hoặc danh sách roles được phép
 * @returns {Function} Express middleware function
 */
const requireRole = (allowedRoles) => {
    // Normalize to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        try {
            // Kiểm tra user có tồn tại không (từ auth middleware)
            if (!req.user) {
                return errorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    "Authentication required"
                );
            }

            // Kiểm tra user có role không
            if (!req.user.role || !req.user.role.roleName) {
                return errorResponse(
                    res,
                    StatusCodes.FORBIDDEN,
                    "User role not found"
                );
            }

            // Kiểm tra user có active không
            if (!req.user.isActive) {
                return errorResponse(
                    res,
                    StatusCodes.FORBIDDEN,
                    "User account is inactive"
                );
            }

            const userRole = req.user.role.roleName;

            // Kiểm tra role có trong danh sách cho phép không
            if (!roles.includes(userRole)) {
                console.warn(
                    `Access denied: User ${req.user.username} with role ${userRole} attempted to access resource requiring roles: ${roles.join(', ')}`
                );

                return errorResponse(
                    res,
                    StatusCodes.FORBIDDEN,
                    "Insufficient permissions"
                );
            }

            // Log successful authorization
            console.info(`Access granted: User ${req.user.username} (${userRole}) accessing protected resource`);

            next();

        } catch (error) {
            console.error("Role middleware error:", error.message);
            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Authorization check failed"
            );
        }
    };
};

/**
 * Middleware kiểm tra quyền admin
 */
const requireAdmin = requireRole('Admin');

/**
 * Middleware kiểm tra quyền manager trở lên
 */
const requireManager = requireRole(['Admin', 'Manager']);

/**
 * Middleware kiểm tra quyền user trở lên (tất cả authenticated users)
 */
const requireUser = requireRole(['Admin', 'Manager', 'User', 'Employee']);

/**
 * Middleware kiểm tra owner hoặc admin
 * @param {string} userIdField - Field name chứa userId trong req (params, body, etc.)
 */
const requireOwnerOrAdmin = (userIdField = 'id') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return errorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    "Authentication required"
                );
            }

            const userRole = req.user.role?.roleName;
            const currentUserId = req.user.id;

            // Lấy userId từ request
            let targetUserId;
            if (req.params[userIdField]) {
                targetUserId = parseInt(req.params[userIdField]);
            } else if (req.body[userIdField]) {
                targetUserId = parseInt(req.body[userIdField]);
            } else if (req.query[userIdField]) {
                targetUserId = parseInt(req.query[userIdField]);
            }

            // Admin có thể truy cập tất cả
            if (userRole === 'Admin') {
                return next();
            }

            // User chỉ có thể truy cập tài khoản của mình
            if (currentUserId === targetUserId) {
                return next();
            }

            console.warn(
                `Access denied: User ${req.user.username} (${userRole}) attempted to access resource belonging to user ${targetUserId}`
            );

            return errorResponse(
                res,
                StatusCodes.FORBIDDEN,
                "Access denied. You can only access your own resources."
            );

        } catch (error) {
            console.error("Owner/Admin middleware error:", error.message);
            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Authorization check failed"
            );
        }
    };
};

/**
 * Middleware tùy chỉnh kiểm tra permission
 * @param {Function} permissionCheck - Function kiểm tra permission nhận (req, user) => boolean
 * @param {string} errorMessage - Error message khi không có quyền
 */
const requirePermission = (permissionCheck, errorMessage = "Insufficient permissions") => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return errorResponse(
                    res,
                    StatusCodes.UNAUTHORIZED,
                    "Authentication required"
                );
            }

            const hasPermission = await permissionCheck(req, req.user);

            if (!hasPermission) {
                console.warn(
                    `Permission denied: User ${req.user.username} failed custom permission check`
                );

                return errorResponse(
                    res,
                    StatusCodes.FORBIDDEN,
                    errorMessage
                );
            }

            next();

        } catch (error) {
            console.error("Permission middleware error:", error.message);
            return errorResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Permission check failed"
            );
        }
    };
};

/**
 * Middleware kiểm tra active status
 */
const requireActive = (req, res, next) => {
    try {
        if (!req.user) {
            return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                "Authentication required"
            );
        }

        if (!req.user.isActive) {
            return errorResponse(
                res,
                StatusCodes.FORBIDDEN,
                "Account is inactive. Please contact administrator."
            );
        }

        next();

    } catch (error) {
        console.error("Active status middleware error:", error.message);
        return errorResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Status check failed"
        );
    }
};

// Export các middleware
module.exports = {
    requireRole,
    requireAdmin,
    requireManager,
    requireUser,
    requireOwnerOrAdmin,
    requirePermission,
    requireActive
};
