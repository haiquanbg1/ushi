// middleware/rateLimitMiddleware.js
const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/response");

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or external rate limiting service
 */
class RateLimiter {
    constructor() {
        this.clients = new Map();
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000); // Cleanup every minute
    }

    /**
     * Check if request should be rate limited
     * @param {string} key - Unique identifier (IP, user ID, etc.)
     * @param {number} limit - Maximum number of requests
     * @param {number} windowMs - Time window in milliseconds
     * @returns {Object} - { allowed: boolean, remaining: number, resetTime: Date }
     */
    checkLimit(key, limit, windowMs) {
        const now = Date.now();
        const windowStart = now - windowMs;

        if (!this.clients.has(key)) {
            this.clients.set(key, []);
        }

        const requests = this.clients.get(key);

        // Remove old requests outside the window
        const validRequests = requests.filter(timestamp => timestamp > windowStart);
        this.clients.set(key, validRequests);

        if (validRequests.length >= limit) {
            const resetTime = new Date(validRequests[0] + windowMs);
            return {
                allowed: false,
                remaining: 0,
                resetTime,
                total: limit
            };
        }

        // Add current request
        validRequests.push(now);
        this.clients.set(key, validRequests);

        return {
            allowed: true,
            remaining: limit - validRequests.length,
            resetTime: new Date(now + windowMs),
            total: limit
        };
    }

    /**
     * Clean up old entries
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        for (const [key, requests] of this.clients.entries()) {
            const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
            if (validRequests.length === 0) {
                this.clients.delete(key);
            } else {
                this.clients.set(key, validRequests);
            }
        }
    }

    /**
     * Clear all rate limit data
     */
    reset() {
        this.clients.clear();
    }

    /**
     * Destroy the rate limiter
     */
    destroy() {
        clearInterval(this.cleanupInterval);
        this.clients.clear();
    }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Create rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.max - Maximum number of requests (default: 100)
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {string} options.keyGenerator - Function to generate unique key (default: IP address)
 * @param {string} options.message - Error message when limit exceeded
 * @param {boolean} options.skipSuccessfulRequests - Skip counting successful requests
 * @param {boolean} options.skipFailedRequests - Skip counting failed requests
 * @returns {Function} Express middleware
 */
const createRateLimit = (options = {}) => {
    const {
        max = 100,
        windowMs = 15 * 60 * 1000, // 15 minutes
        keyGenerator = (req) => req.ip || req.connection.remoteAddress,
        message = "Too many requests, please try again later",
        skipSuccessfulRequests = false,
        skipFailedRequests = false,
        onLimitReached = null
    } = options;

    return (req, res, next) => {
        try {
            const key = keyGenerator(req);
            const result = rateLimiter.checkLimit(key, max, windowMs);

            // Set rate limit headers
            res.set({
                'X-RateLimit-Limit': result.total,
                'X-RateLimit-Remaining': result.remaining,
                'X-RateLimit-Reset': result.resetTime.toISOString()
            });

            if (!result.allowed) {
                // Log rate limit exceeded
                console.warn(`Rate limit exceeded for key: ${key}`);

                // Call callback if provided
                if (onLimitReached) {
                    onLimitReached(req, res, options);
                }

                return errorResponse(
                    res,
                    StatusCodes.TOO_MANY_REQUESTS,
                    message,
                    {
                        limit: result.total,
                        remaining: result.remaining,
                        resetTime: result.resetTime
                    }
                );
            }

            // Skip counting based on options
            if (skipSuccessfulRequests || skipFailedRequests) {
                const originalSend = res.send;
                res.send = function (data) {
                    const shouldSkip =
                        (skipSuccessfulRequests && res.statusCode < 400) ||
                        (skipFailedRequests && res.statusCode >= 400);

                    if (shouldSkip) {
                        // Remove the request from count
                        const requests = rateLimiter.clients.get(key) || [];
                        requests.pop(); // Remove the last request
                        rateLimiter.clients.set(key, requests);
                    }

                    return originalSend.call(this, data);
                };
            }

            next();

        } catch (error) {
            console.error("Rate limit middleware error:", error.message);
            // Don't block request on rate limiter errors
            next();
        }
    };
};

/**
 * Strict rate limiting for authentication endpoints
 */
const authRateLimit = createRateLimit({
    max: 5, // 5 attempts
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: "Too many login attempts, please try again after 15 minutes",
    keyGenerator: (req) => {
        // Rate limit by IP and username combination for login attempts
        const ip = req.ip || req.connection.remoteAddress;
        const username = req.body?.username || 'unknown';
        return `auth:${ip}:${username}`;
    },
    skipSuccessfulRequests: true, // Don't count successful logins
    onLimitReached: (req, res, options) => {
        console.error(`Authentication rate limit exceeded for IP: ${req.ip}, Username: ${req.body?.username}`);
    }
});

/**
 * General API rate limiting
 */
const apiRateLimit = createRateLimit({
    max: 1000, // 1000 requests
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "API rate limit exceeded, please try again later",
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        if (req.user?.id) {
            return `api:user:${req.user.id}`;
        }
        return `api:ip:${req.ip || req.connection.remoteAddress}`;
    }
});

/**
 * Strict rate limiting for password operations
 */
const passwordRateLimit = createRateLimit({
    max: 3, // 3 attempts
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many password change attempts, please try again later",
    keyGenerator: (req) => {
        const userId = req.user?.id || 'anonymous';
        const ip = req.ip || req.connection.remoteAddress;
        return `password:${userId}:${ip}`;
    },
    onLimitReached: (req, res, options) => {
        console.error(`Password rate limit exceeded for User ID: ${req.user?.id}, IP: ${req.ip}`);
    }
});

/**
 * Rate limiting for user registration
 */
const registerRateLimit = createRateLimit({
    max: 3, // 3 registrations per IP
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many registration attempts, please try again later",
    keyGenerator: (req) => {
        const ip = req.ip || req.connection.remoteAddress;
        return `register:${ip}`;
    },
    onLimitReached: (req, res, options) => {
        console.warn(`Registration rate limit exceeded for IP: ${req.ip}`);
    }
});

/**
 * Rate limiting for user creation (admin operations)
 */
const userCreationRateLimit = createRateLimit({
    max: 10, // 10 user creations
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many user creation attempts, please try again later",
    keyGenerator: (req) => {
        const adminId = req.user?.id || 'anonymous';
        return `user-creation:${adminId}`;
    }
});

/**
 * Rate limiting by user ID for authenticated requests
 */
const userRateLimit = createRateLimit({
    max: 500, // 500 requests per user
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "User rate limit exceeded, please slow down",
    keyGenerator: (req) => {
        if (!req.user?.id) {
            // Fallback to IP if not authenticated
            return `guest:${req.ip || req.connection.remoteAddress}`;
        }
        return `user:${req.user.id}`;
    }
});

/**
 * Middleware to reset rate limit for a specific key
 */
const resetRateLimit = (keyGenerator) => {
    return (req, res, next) => {
        try {
            const key = keyGenerator(req);
            rateLimiter.clients.delete(key);
            console.info(`Rate limit reset for key: ${key}`);
            next();
        } catch (error) {
            console.error("Reset rate limit error:", error.message);
            next();
        }
    };
};

/**
 * Middleware to check current rate limit status without incrementing
 */
const checkRateLimit = (options = {}) => {
    const {
        max = 100,
        windowMs = 15 * 60 * 1000,
        keyGenerator = (req) => req.ip || req.connection.remoteAddress
    } = options;

    return (req, res, next) => {
        try {
            const key = keyGenerator(req);
            const now = Date.now();
            const windowStart = now - windowMs;

            const requests = rateLimiter.clients.get(key) || [];
            const validRequests = requests.filter(timestamp => timestamp > windowStart);

            const remaining = Math.max(0, max - validRequests.length);
            const resetTime = validRequests.length > 0
                ? new Date(validRequests[0] + windowMs)
                : new Date(now + windowMs);

            // Add rate limit info to request
            req.rateLimit = {
                limit: max,
                remaining,
                resetTime,
                used: validRequests.length
            };

            // Set headers
            res.set({
                'X-RateLimit-Limit': max,
                'X-RateLimit-Remaining': remaining,
                'X-RateLimit-Reset': resetTime.toISOString()
            });

            next();
        } catch (error) {
            console.error("Check rate limit error:", error.message);
            next();
        }
    };
};

// Cleanup on process termination
process.on('SIGTERM', () => {
    rateLimiter.destroy();
});

process.on('SIGINT', () => {
    rateLimiter.destroy();
});

module.exports = {
    createRateLimit,
    authRateLimit,
    registerRateLimit,
    apiRateLimit,
    passwordRateLimit,
    userCreationRateLimit,
    userRateLimit,
    resetRateLimit,
    checkRateLimit,
    rateLimiter // Export for testing purposes
};
