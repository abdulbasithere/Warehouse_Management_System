import { User, Role } from '../models/setupModels.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendNewPasswordEmail } from '../utils/email.js';
import crypto from 'crypto';

export const register = async (req, res, next) => {
    try {
        const { userId, fullName, email, password } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const existingUser = await User.findByPk(userId);
        if (existingUser) {
            return res.status(400).json({ message: 'User ID already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            userId,
            fullName,
            email,
            password: hashedPassword
        });
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, userId, password } = req.body;
        const identifier = email || userId;

        if (!identifier) {
            return res.status(400).json({ message: 'Email or User ID is required' });
        }

        const user = await User.findOne({
            where: email ? { email } : { userId },
            include: [{ model: Role, as: 'roles' }]
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Mapping roles for token
        const roles = user.roles ? user.roles.map(r => r.roleName) : [];

        const token = jwt.sign(
            { id: user.userId, roles: roles },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.cookie('token', token, { 
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.json({
            user: {
                id: user.userId,
                name: user.fullName,
                roles: roles
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.json({ message: 'Logged out' });
};

export const refreshToken = (req, res) => {
    res.json({ message: 'Token refreshed' });
};

export const getMe = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
        const user = await User.findByPk(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email, userId } = req.body;
        const user = await User.findOne({ 
            where: email ? { email } : { userId } 
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const newPassword = crypto.randomBytes(4).toString('hex');
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        if (user.email) {
            await sendNewPasswordEmail(user.email, newPassword);
        }
        res.json({ 
            message: user.email ? 'A new password has been sent to your email.' : `Password reset to: ${newPassword}`,
            tempPassword: user.email ? undefined : newPassword 
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { userId, newPassword } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};
