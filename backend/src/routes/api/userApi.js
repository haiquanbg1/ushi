const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../../middleware/authMiddleware');
const {
    requireAdmin,
    requireManager,
    requireOwnerOrAdmin,
    requireActive
} = require('../../middleware/roleMiddleware');
const {
    validateUserCreate,
    validateUserUpdate,
    validateId,
    sanitizeInput
} = require('../../middleware/validationMiddeware');
const {
    apiRateLimit,
    userCreationRateLimit
} = require('../../middleware/rateLimitMiddleware');

// You'll need to create this controller
const userController = require('../../controllers/userController');

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private (Manager+ only)
 */
router.get('/',
    apiRateLimit,
    authMiddleware,
    requireManager,
    userController.getAllUsers
);

/**
 * @route GET /api/users/active
 * @desc Get all active users
 * @access Private (Manager+ only)
 */
router.get('/active',
    apiRateLimit,
    authMiddleware,
    requireManager,
    userController.getActiveUsers
);

/**
 * @route GET /api/users/inactive
 * @desc Get all inactive users
 * @access Private (Admin only)
 */
router.get('/inactive',
    apiRateLimit,
    authMiddleware,
    requireAdmin,
    userController.getInactiveUsers
);

/**
 * @route GET /api/users/stats
 * @desc Get user statistics
 * @access Private (Admin only)
 */
router.get('/stats',
    apiRateLimit,
    authMiddleware,
    requireAdmin,
    userController.getUserStats
);

/**
 * @route GET /api/users/role/:roleId
 * @desc Get users by role ID
 * @access Private (Manager+ only)
 */
router.get('/role/:roleId',
    apiRateLimit,
    validateId('roleId'),
    authMiddleware,
    requireManager,
    userController.getUsersByRole
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private (Owner or Admin)
 */
router.get('/:id',
    apiRateLimit,
    validateId(),
    authMiddleware,
    requireOwnerOrAdmin(),
    userController.getUserById
);

/**
 * @route POST /api/users
 * @desc Create new user
 * @access Private (Admin only)
 */
router.post('/',
    userCreationRateLimit,
    sanitizeInput,
    authMiddleware,
    requireAdmin,
    validateUserCreate,
    userController.createUser
);

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Private (Owner or Admin)
 */
router.put('/:id',
    apiRateLimit,
    validateId(),
    sanitizeInput,
    authMiddleware,
    requireOwnerOrAdmin(),
    validateUserUpdate,
    userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private (Admin only)
 */
router.delete('/:id',
    apiRateLimit,
    validateId(),
    authMiddleware,
    requireAdmin,
    userController.deleteUser
);

/**
 * @route PATCH /api/users/:id/activate
 * @desc Activate user account
 * @access Private (Admin only)
 */
router.patch('/:id/activate',
    apiRateLimit,
    validateId(),
    authMiddleware,
    requireAdmin,
    userController.activateUser
);

/**
 * @route PATCH /api/users/:id/deactivate
 * @desc Deactivate user account
 * @access Private (Admin only)
 */
router.patch('/:id/deactivate',
    apiRateLimit,
    validateId(),
    authMiddleware,
    requireAdmin,
    userController.deactivateUser
);

module.exports = router;
