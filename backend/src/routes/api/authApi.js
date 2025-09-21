const express = require('express');
const router = express.Router();

// Import controllers and middleware
const authController = require('../../controllers/authController');
const authMiddleware = require('../../middleware/authMiddleware');
const {
    requireAdmin,
    requireOwnerOrAdmin,
    requireActive
} = require('../../middleware/validationMiddeware');
const {
    validateLogin,
    validateRegister,
    validatePasswordChange,
    validatePasswordReset,
    sanitizeInput
} = require('../../middleware/validationMiddeware');
const {
    authRateLimit,
    passwordRateLimit,
    apiRateLimit
} = require('../../middleware/validationMiddeware');

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post('/login',
    authRateLimit,           // Rate limit login attempts
    sanitizeInput,           // Sanitize input data
    validateLogin,           // Validate login data
    authController.login
);

/**
 * @route POST /api/auth/register
 * @desc User Register
 * @access Public
 */
router.post('/register',
    authRateLimit,           // Rate limit login attempts
    sanitizeInput,           // Sanitize input data
    validateRegister,           // Validate login data
    authController.register
);

/**
 * @route POST /api/auth/logout
 * @desc User logout
 * @access Private (requires authentication)
 */
router.post('/logout',
    apiRateLimit,           // General rate limiting
    authMiddleware,         // Require authentication
    authController.logout
);

/**
 * @route GET /api/auth/me
 * @desc Get current user information
 * @access Private (requires authentication)
 */
router.get('/me',
    apiRateLimit,           // General rate limiting
    authMiddleware,         // Require authentication
    requireActive,          // Require active account
    authController.me
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Private (requires refresh token)
 */
router.post('/refresh',
    apiRateLimit,           // General rate limiting
    authMiddleware,         // This will handle token refresh
    authController.refreshToken
);

/**
 * @route GET /api/auth/check
 * @desc Check authentication status
 * @access Private (requires authentication)
 */
router.get('/check',
    apiRateLimit,           // General rate limiting
    authMiddleware,         // Require authentication
    authController.checkAuth
);

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private (requires authentication)
 */
router.post('/change-password',
    passwordRateLimit,      // Strict rate limiting for password operations
    sanitizeInput,          // Sanitize input data
    authMiddleware,         // Require authentication
    requireActive,          // Require active account
    validatePasswordChange, // Validate password change data
    authController.changePassword
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset user password (Admin only)
 * @access Private (Admin only)
 */
router.post('/reset-password',
    passwordRateLimit,      // Strict rate limiting for password operations
    sanitizeInput,          // Sanitize input data
    authMiddleware,         // Require authentication
    requireAdmin,           // Require admin role
    validatePasswordReset,  // Validate reset password data
    authController.resetPassword
);

module.exports = router;