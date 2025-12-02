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
 * @route GET /api/v1/users
 * @desc Get all users
 * @access Private (Manager+ only)
 */
router.get('/',
    authMiddleware,
    userController.getAllUsers
);

/**
 * @route GET /api/v1/users/active
 * @desc Get all active users
 * @access Private (Manager+ only)
 */
router.get('/active',
    authMiddleware,
    userController.getActiveUsers
);

/**
 * @route GET /api/v1/v1/users/inactive
 * @desc Get all inactive users
 * @access Private (Admin only)
 */
router.get('/inactive',
    authMiddleware,
    userController.getInactiveUsers
);

/**
 * @route GET /api/v1/v1/users/stats
 * @desc Get user statistics
 * @access Private (Admin only)
 */
router.get('/stats',
    authMiddleware,
    userController.getUserStats
);

/**
 * @route GET /api/v1/v1/users/role/:roleId
 * @desc Get users by role ID
 * @access Private (Manager+ only)
 */
router.get('/role/:roleId',
    authMiddleware,
    userController.getUsersByRole
);

/**
 * @route GET /api/v1/v1/users/:id
 * @desc Get user by ID
 * @access Private (Owner or Admin)
 */
router.get('/:id',
    authMiddleware,
    userController.getUserById
);

/**
 * @route POST /api/v1/users
 * @desc Create new user
 * @access Private (Admin only)
 */
router.post('/',
    authMiddleware,
    userController.createUser
);

/**
 * @route PUT /api/v1/users/:id
 * @desc Update user
 * @access Private (Owner or Admin)
 */
router.put('/:id',
    authMiddleware,
    userController.updateUser
);

/**
 * @route DELETE /api/v1/users/:id
 * @desc Delete user
 * @access Private (Admin only)
 */
router.delete('/:id',
    authMiddleware,
    userController.deleteUser
);

/**
 * @route PATCH /api/v1/users/:id/activate
 * @desc Activate user account
 * @access Private (Admin only)
 */
router.patch('/:id/activate',
    authMiddleware,
    userController.activateUser
);

/**
 * @route PATCH /api/v1/users/:id/deactivate
 * @desc Deactivate user account
 * @access Private (Admin only)
 */
router.patch('/:id/deactivate',
    authMiddleware,
    userController.deactivateUser
);

module.exports = router;
