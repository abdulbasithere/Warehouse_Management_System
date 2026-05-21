const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
    register,
    login,
    logout,
    refreshToken,
    getMe,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const { authLimiter } = require('../middleware/security');

// Public routes (Rate limited to prevent brute-force)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

// Password recovery
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;