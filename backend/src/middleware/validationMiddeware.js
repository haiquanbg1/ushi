// middleware/validationMiddleware.js
const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/response");
const userAccountService = require("../services/userService");

/**
 * Validation helper functions
 */
const validators = {
    isEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isStrongPassword: (password) => {
        // Ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return strongPasswordRegex.test(password);
    },

    isValidPhoneNumber: (phone) => {
        // Số điện thoại Việt Nam
        const phoneRegex = /^(0|\+84)[3-9]\d{8,9}$/;
        return phoneRegex.test(phone);
    }
};

/**
 * Validation middleware for user registration
 */
const validateRegister = async (req, res, next) => {
    const { phone, password, confirmPassword, role } = req.body;
    console.log(req.body);

    // Phone validation
    if (!phone) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập số điện thoại.");
    }
    if (!validators.isValidPhoneNumber(phone)) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Số điện thoại không đúng định dạng.");
    }

    // Password validation
    if (!password) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập mật khẩu.");
    }
    if (!validators.isStrongPassword(password)) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường và một chữ số."
        );
    }

    // Confirm password validation
    if (!confirmPassword) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập lại mật khẩu xác nhận.");
    }
    if (password && confirmPassword && password !== confirmPassword) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Mật khẩu và mật khẩu xác nhận không trùng khớp.");
    }

    next();
};

/**
 * Validation middleware for user login
 */
const validateLogin = (req, res, next) => {
    const { phone, password } = req.body;

    if (!phone) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập số điện thoại.");
    }
    if (!validators.isValidPhoneNumber(phone)) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Số điện thoại không đúng định dạng.");
    }

    if (!password) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập mật khẩu.");
    }

    next();
};

/**
 * Validation middleware for user registration/creation
 */
const validateUserCreate = async (req, res, next) => {
    const { phone, password, roleId } = req.body;

    // Phone validation
    if (!phone) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập số điện thoại.");
    }
    if (!validators.isValidPhoneNumber(phone)) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Số điện thoại không đúng định dạng.");
    }
    // Check if phone already exists
    try {
        const phoneExists = await userAccountService.checkPhoneExists(phone);
        if (phoneExists) {
            return errorResponse(res, StatusCodes.BAD_REQUEST, "Số điện thoại đã tồn tại.");
        }
    } catch (error) {
        console.error("Phone check error:", error.message);
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Kiểm tra số điện thoại thất bại.");
    }

    // Password validation
    if (!password) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập mật khẩu.");
    }
    if (!validators.isStrongPassword(password)) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường và một chữ số."
        );
    }

    // Role validation
    if (!roleId) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy chọn vai trò (role).");
    }
    if (!Number.isInteger(roleId) || roleId <= 0) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "ID vai trò không hợp lệ.");
    }

    next();
};

/**
 * Validation middleware for user update
 */
const validateUserUpdate = async (req, res, next) => {
    const { phone, password, email } = req.body;
    const userId = req.params.id;
    console.log(phone, password, email);

    // Phone validation (nếu có truyền)
    if (phone && phone.trim() !== "") {
        if (!validators.isValidPhoneNumber(phone)) {
            return errorResponse(res, StatusCodes.BAD_REQUEST, "Số điện thoại không đúng định dạng.");
        }
        try {
            const phoneExists = await userAccountService.checkPhoneExists(phone, parseInt(userId));
            if (phoneExists) {
                return errorResponse(res, StatusCodes.BAD_REQUEST, "Số điện thoại đã tồn tại.");
            }
        } catch (error) {
            console.error("Phone check error:", error.message);
            return errorResponse(res, StatusCodes.BAD_REQUEST, "Kiểm tra số điện thoại thất bại.");
        }
    }

    // Password validation (nếu có truyền)
    if (password && password.trim() !== "") {
        if (!validators.isStrongPassword(password)) {
            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                "Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường và một chữ số."
            );
        }
    }

    if (email?.trim()) {
        if (!validators.isEmail(email.trim())) {
            return errorResponse(res, StatusCodes.BAD_REQUEST, "Địa chỉ email không đúng định dạng.");
        }
    }

    next();
};

/**
 * Validation middleware for password change
 */
const validatePasswordChange = (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập mật khẩu hiện tại.");
    }

    if (!newPassword) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập mật khẩu mới.");
    }
    if (!validators.isStrongPassword(newPassword)) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường và một chữ số."
        );
    }

    if (!confirmPassword) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập lại mật khẩu mới để xác nhận.");
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Mật khẩu mới và mật khẩu xác nhận không trùng khớp.");
    }

    if (oldPassword && newPassword && oldPassword === newPassword) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Mật khẩu mới phải khác mật khẩu hiện tại.");
    }

    next();
};

/**
 * Validation middleware for password reset
 */
const validatePasswordReset = (req, res, next) => {
    const { userId, newPassword } = req.body;

    if (!userId) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Thiếu ID người dùng.");
    }
    if (!Number.isInteger(userId) || userId <= 0) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "ID người dùng không hợp lệ.");
    }

    if (!newPassword) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập mật khẩu mới.");
    }
    if (!validators.isStrongPassword(newPassword)) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường và một chữ số."
        );
    }

    next();
};

/**
 * Validation middleware for role creation
 */
const validateRoleCreate = (req, res, next) => {
    const { roleName, description } = req.body;

    if (!roleName) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Hãy nhập tên vai trò.");
    }
    if (roleName.trim().length < 2) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Tên vai trò phải có ít nhất 2 ký tự.");
    }
    if (roleName.trim().length > 50) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Tên vai trò không được vượt quá 50 ký tự.");
    }

    if (description && description.length > 255) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Mô tả không được vượt quá 255 ký tự.");
    }

    next();
};

/**
 * Validation middleware for role update
 */
const validateRoleUpdate = (req, res, next) => {
    const { roleName, description } = req.body;

    if (roleName !== undefined) {
        if (!roleName || roleName.trim().length < 2) {
            return errorResponse(res, StatusCodes.BAD_REQUEST, "Tên vai trò phải có ít nhất 2 ký tự.");
        }
        if (roleName.trim().length > 50) {
            return errorResponse(res, StatusCodes.BAD_REQUEST, "Tên vai trò không được vượt quá 50 ký tự.");
        }
    }

    if (description !== undefined && description.length > 255) {
        return errorResponse(res, StatusCodes.BAD_REQUEST, "Mô tả không được vượt quá 255 ký tự.");
    }

    next();
};

/**
 * Generic validation middleware for ID parameters
 */
const validateId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!id || !Number.isInteger(parseInt(id)) || parseInt(id) <= 0) {
            return errorResponse(
                res,
                StatusCodes.BAD_REQUEST,
                `Tham số ${paramName} không hợp lệ.`
            );
        }

        // Convert to number for convenience
        req.params[paramName] = parseInt(id);
        next();
    };
};

/**
 * Sanitization middleware to clean input data
 */
const sanitizeInput = (req, res, next) => {
    try {
        // Trim string values in body
        if (req.body && typeof req.body === 'object') {
            Object.keys(req.body).forEach(key => {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = req.body[key].trim();
                }
            });
        }

        // Trim string values in query
        if (req.query && typeof req.query === 'object') {
            Object.keys(req.query).forEach(key => {
                if (typeof req.query[key] === 'string') {
                    req.query[key] = req.query[key].trim();
                }
            });
        }

        next();
    } catch (error) {
        console.error("Input sanitization error:", error.message);
        return errorResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Xử lý dữ liệu đầu vào thất bại."
        );
    }
};

module.exports = {
    validateRegister,
    validateLogin,
    validateUserCreate,
    validateUserUpdate,
    validatePasswordChange,
    validatePasswordReset,
    validateRoleCreate,
    validateRoleUpdate,
    validateId,
    sanitizeInput,
    validators
};
