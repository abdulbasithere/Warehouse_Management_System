const { User } = require('../models/setupModels');
const bcrypt = require('bcryptjs');

const { Op } = require('sequelize');

const getAllUsers = async (req, res, next) => {
    try {
        const { search = '', role = '' } = req.query;

        const where = {};

        if (search) {
            where[Op.or] = [
                { FullName: { [Op.like]: `%${search}%` } },
                { Email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role && role !== 'ALL') {
            const backendRole = role === 'MASTER' ? 'admin' : role.toLowerCase();
            where.userRole = backendRole;
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            order: [['FullName', 'ASC']]
        });

        // Map backend user fields to frontend expected fields
        const mappedUsers = rows.map(u => ({
            id: u.UserId,
            name: u.FullName,
            email: u.Email,
            role: u.userRole === 'admin' ? 'MASTER' : u.userRole.toUpperCase(),
            isActive: u.isActive
        }));

        res.json({ data: mappedUsers, total: count });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const { name, email, role, isActive } = req.body;

        // Map frontend role to backend role
        const backendRole = role === 'MASTER' ? 'admin' : role.toLowerCase();

        const hashedPassword = await bcrypt.hash('123', 10);

        const user = await User.create({
            FullName: name,
            Email: email,
            userRole: backendRole,
            isActive: isActive !== undefined ? isActive : true,
            Password: hashedPassword
        });

        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { name, email, role, isActive } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.FullName = name;
        if (email) user.Email = email;
        if (role) user.userRole = role === 'MASTER' ? 'admin' : role.toLowerCase();
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();
        res.json(user);
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const deactivateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isActive = false;
        await user.save();
        res.json(user);
    } catch (error) {
        next(error);
    }
};

const activateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isActive = true;
        await user.save();
        res.json(user);
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.Password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    deactivateUser,
    activateUser,
    resetPassword
};
