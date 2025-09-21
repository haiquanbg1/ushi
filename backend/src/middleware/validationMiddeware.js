// middleware/validationMiddleware.js
const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/response");
const userAccountService = require("../services/userAccountService");

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

    isValidUsername: (username) => {
        // Alphanumeric, underscore, dash, 3-20 characters
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        return usernameRegex.test(username);
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
    const { username, password, confirmPassword, roleId } = req.body;

    const errors = [];

    // Username validation
    if (!username) {
        errors.push("Username is required");
    } else if (!validators.isValidUsername(username)) {
        errors.push("Username must be 3-20 characters long and contain only letters, numbers, underscore, or dash");
    } else {
        // Check if username already exists
        try {
            const usernameExists = await userAccountService.checkUsernameExists(username);
            if (usernameExists) {
                errors.push("Username already exists");
            }
        } catch (error) {
            console.error("Username check error:", error.message);
            errors.push("Failed to validate username");
        }
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

    // Role validation (optional for registration)
    if (roleId !== undefined && roleId !== null) {
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
 * Validation middleware for user login
 */
const validateLogin = (req, res, next) => {
    const { username, password } = req.body;

    const errors = [];

    if (!username) {
        errors.push("Username is required");
    } else if (username.trim().length < 3) {
        errors.push("Username must be at least 3 characters long");
    }

    if (!password) {
        errors.push("Password is required");
    } else if (password.length < 6) {
        errors.push("Password must be at least 6 characters long");
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
    const { username, password, roleId } = req.body;

    const errors = [];

    // Username validation
    if (!username) {
        errors.push("Username is required");
    } else if (!validators.isValidUsername(username)) {
        errors.push("Username must be 3-20 characters long and contain only letters, numbers, underscore, or dash");
    } else {
        // Check if username already exists
        try {
            const usernameExists = await userAccountService.checkUsernameExists(username);
            if (usernameExists) {
                errors.push("Username already exists");
            }
        } catch (error) {
            console.error("Username check error:", error.message);
            errors.push("Failed to validate username");
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
    const { username, password, roleId } = req.body;
    const userId = req.params.id;

    const errors = [];

    // Username validation (if provided)
    if (username) {
        if (!validators.isValidUsername(username)) {
            errors.push("Username must be 3-20 characters long and contain only letters, numbers, underscore, or dash");
        } else {
            // Check if username already exists (excluding current user)
            try {
                const usernameExists = await userAccountService.checkUsernameExists(username, parseInt(userId));
                if (usernameExists) {
                    errors.push("Username already exists");
                }
            } catch (error) {
                console.error("Username check error:", error.message);
                errors.push("Failed to validate username");
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
