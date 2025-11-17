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
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return strongPasswordRegex.test(password);
    },

    isValidPhoneNumber: (phone) => {
        // Vietnamese phone number format
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

    const errors = [];

    // Phone validation
    if (!phone) {
        errors.push("Phone number is required");
    } else if (!validators.isValidPhoneNumber(phone)) {
        errors.push("Invalid phone number format");
    }

    // Password validation
    if (!password) {
        errors.push("Password is required");
    } else if (!validators.isStrongPassword(password)) {
        errors.push("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
    }

    // Confirm password validation
    if (!confirmPassword) {
        errors.push("Confirm password is required");
    } else if (password && confirmPassword && password !== confirmPassword) {
        errors.push("Password and confirm password do not match");
    }

    if (errors.length > 0) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Validation failed",
            { errors }
        );
    }

    next();
};

/**
 * Validation middleware for user login
 */
const validateLogin = (req, res, next) => {
    const { phone, password } = req.body;

    const errors = [];

    if (!phone) {
        errors.push("Phone number is required");
    } else if (!validators.isValidPhoneNumber(phone)) {
        errors.push("Invalid phone number format");
    }

    if (!password) {
        errors.push("Password is required");
    }

    if (errors.length > 0) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Validation failed",
            { errors }
        );
    }

    next();
};

/**
 * Validation middleware for user registration/creation
 */
const validateUserCreate = async (req, res, next) => {
    const { phone, password, roleId } = req.body;

    const errors = [];

    // Phone validation
    if (!phone) {
        errors.push("Phone number is required");
    } else if (!validators.isValidPhoneNumber(phone)) {
        errors.push("Invalid phone number format");
    } else {
        // Check if phone already exists
        try {
            const phoneExists = await userAccountService.checkPhoneExists(phone);
            if (phoneExists) {
                errors.push("Phone number already exists");
            }
        } catch (error) {
            console.error("Phone check error:", error.message);
            errors.push("Failed to validate phone number");
        }
    }

    // Password validation
    if (!password) {
        errors.push("Password is required");
    } else if (!validators.isStrongPassword(password)) {
        errors.push("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
    }

    // Role validation
    if (!roleId) {
        errors.push("Role is required");
    } else if (!Number.isInteger(roleId) || roleId <= 0) {
        errors.push("Invalid role ID");
    }

    if (errors.length > 0) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Validation failed",
            { errors }
        );
    }

    next();
};

/**
 * Validation middleware for user update
 */
const validateUserUpdate = async (req, res, next) => {
    const { phone, password, roleId } = req.body;
    const userId = req.params.id;

    const errors = [];

    // Phone validation (if provided)
    if (phone) {
        if (!validators.isValidPhoneNumber(phone)) {
            errors.push("Invalid phone number format");
        } else {
            // Check if phone already exists for another user
            try {
                const phoneExists = await userAccountService.checkPhoneExists(phone, parseInt(userId));
                if (phoneExists) {
                    errors.push("Phone number already exists");
                }
            } catch (error) {
                console.error("Phone check error:", error.message);
                errors.push("Failed to validate phone number");
            }
        }
    }

    // Password validation (if provided)
    if (password) {
        if (!validators.isStrongPassword(password)) {
            errors.push("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
        }
    }

    // Role validation (if provided)
    if (roleId !== undefined) {
        if (!Number.isInteger(roleId) || roleId <= 0) {
            errors.push("Invalid role ID");
        }
    }

    if (errors.length > 0) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Validation failed",
            { errors }
        );
    }

    next();
};

/**
 * Validation middleware for password change
 */
const validatePasswordChange = (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const errors = [];

    if (!oldPassword) {
        errors.push("Current password is required");
    }

    if (!newPassword) {
        errors.push("New password is required");
    } else if (!validators.isStrongPassword(newPassword)) {
        errors.push("New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
    }

    if (!confirmPassword) {
        errors.push("Confirm password is required");
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        errors.push("New password and confirm password do not match");
    }

    if (oldPassword && newPassword && oldPassword === newPassword) {
        errors.push("New password must be different from current password");
    }

    if (errors.length > 0) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Validation failed",
            { errors }
        );
    }

    next();
};

/**
 * Validation middleware for password reset
 */
const validatePasswordReset = (req, res, next) => {
    const { userId, newPassword } = req.body;

    const errors = [];

    if (!userId) {
        errors.push("User ID is required");
    } else if (!Number.isInteger(userId) || userId <= 0) {
        errors.push("Invalid user ID");
    }

    if (!newPassword) {
        errors.push("New password is required");
    } else if (!validators.isStrongPassword(newPassword)) {
        errors.push("New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number");
    }

    if (errors.length > 0) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Validation failed",
            { errors }
        );
    }

    next();
};

/**
 * Validation middleware for role creation
 */
const validateRoleCreate = (req, res, next) => {
    const { roleName, description } = req.body;

    const errors = [];

    if (!roleName) {
        errors.push("Role name is required");
    } else if (roleName.trim().length < 2) {
        errors.push("Role name must be at least 2 characters long");
    } else if (roleName.trim().length > 50) {
        errors.push("Role name must not exceed 50 characters");
    }

    if (description && description.length > 255) {
        errors.push("Description must not exceed 255 characters");
    }

    if (errors.length > 0) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Validation failed",
            { errors }
        );
    }

    next();
};

/**
 * Validation middleware for role update
 */
const validateRoleUpdate = (req, res, next) => {
    const { roleName, description } = req.body;

    const errors = [];

    if (roleName !== undefined) {
        if (!roleName || roleName.trim().length < 2) {
            errors.push("Role name must be at least 2 characters long");
        } else if (roleName.trim().length > 50) {
            errors.push("Role name must not exceed 50 characters");
        }
    }

    if (description !== undefined && description.length > 255) {
        errors.push("Description must not exceed 255 characters");
    }

    if (errors.length > 0) {
        return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "Validation failed",
            { errors }
        );
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
                `Invalid ${paramName} parameter`
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
            "Input processing failed"
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