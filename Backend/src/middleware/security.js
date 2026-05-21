const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Security middleware configuration
 * - Helmet: sets various HTTP headers for security
 * - Rate limiter: prevents brute-force & DDoS attacks
 */

// Helmet with sensible defaults for API server
const securityHeaders = helmet({
    contentSecurityPolicy: false,   // Disable CSP for API-only backend
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
});

// General API rate limiter: 200 requests per minute per IP
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minute
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many requests, please try again after a minute.'
    }
});

// Stricter rate limiter for auth endpoints: 10 attempts per 15 min
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many login attempts, please try again after 15 minutes.'
    }
});

module.exports = { securityHeaders, apiLimiter, authLimiter };
