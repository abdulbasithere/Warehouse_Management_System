const { User } = require('../models/setupModels.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
    try {
        const { FullName, Email, Password, userRole } = req.body;
        const hashedPassword = await bcrypt.hash(Password, 10);
        const user = await User.create({
            FullName,
            Email,
            Password: hashedPassword,
            userRole: userRole || 'picker'
        });
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { Email, Password } = req.body;
        console.log(Email, Password);
        console.log('Imported User:', User);
        console.log('Is User a model?', typeof User.findOne === 'function');
        const user = await User.findOne({ where: { Email } });
        if (!user || !(await bcrypt.compare(Password, user.Password))) {
            console.log("Invalid credentials");
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.UserId, role: user.userRole },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        console.log(user);
        res.cookie('token', token, { httpOnly: true });
        res.json({ user: { id: user.UserId, name: user.FullName, role: user.userRole }, token });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
};

const refreshToken = (req, res) => {
    // Basic implementation
    res.json({ message: 'Token refreshed' });
};

const getMe = async (req, res, next) => {
    try {
        // This usually depends on auth middleware setting req.user
        if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
        const user = await User.findByPk(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

const forgotPassword = (req, res) => {
    res.json({ message: 'Forgot password email sent' });
};

const resetPassword = async (req, res, next) => {
    try {
        const { userId, newPassword } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.Password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    getMe,
    forgotPassword,
    resetPassword
};
