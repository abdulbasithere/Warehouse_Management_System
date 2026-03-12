const express = require('express');
const router = express.Router();

const {
    register,
    login,
    logout,
    refreshToken,
    getMe,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

// Password recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

const { protect } = require('../middleware/auth');

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;