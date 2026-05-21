import { User } from '../models/setupModels.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import * as xlsx from 'xlsx';

// Reusable attributes list — excludes password from all reads
const USER_SAFE_ATTRIBUTES = ['userId', 'fullName', 'email', 'phone', 'address', 'isActive', 'lastLogin', 'createdAt', 'updatedAt'];

export const getAllUsers = async (req, res, next) => {
    try {
        const {
            page = 1,
            pageSize = 20,
            username = '',
            userId = ''
        } = req.query;

        const offset = (page - 1) * pageSize;
        const userWhere = {};

        if (userId) {
            userWhere.userId = userId;
        }

        if (username) {
            userWhere.fullName = { [Op.like]: `%${username}%` };
        }

        const { count, rows } = await User.findAndCountAll({
            where: userWhere,
            attributes: USER_SAFE_ATTRIBUTES,
            order: [['createdAt', 'DESC']],
            limit: parseInt(pageSize),
            offset: parseInt(offset)
        });

        res.json({
            data: rows,
            total: count,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });

    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: USER_SAFE_ATTRIBUTES,
            include: [
                {
                    association: 'roles',
                    attributes: ['roleId', 'roleName'],
                    through: { attributes: [] }
                }
            ]
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        const { userId, fullName, email, phone, address, isActive, password } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const existingUser = await User.findByPk(userId, { attributes: ['userId'] });
        if (existingUser) {
            return res.status(400).json({ message: 'User ID already exists' });
        }

        const hashedPassword = await bcrypt.hash(password || '123456', 10);

        const user = await User.create({
            userId,
            fullName,
            email: email || null,
            phone,
            address,
            isActive: isActive !== undefined ? isActive : true,
            password: hashedPassword
        });

        res.status(201).json({
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            isActive: user.isActive,
            createdAt: user.createdAt
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { fullName, email, phone, address, isActive } = req.body;
        const user = await User.findByPk(req.params.id, { attributes: USER_SAFE_ATTRIBUTES });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (fullName) user.fullName = fullName;
        if (email !== undefined) user.email = email || null;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: ['userId'] });
        if (!user) return res.status(404).json({ message: 'User not found' });
        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const deactivateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: USER_SAFE_ATTRIBUTES });
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isActive = false;
        await user.save();
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const activateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: USER_SAFE_ATTRIBUTES });
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isActive = true;
        await user.save();
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findByPk(req.params.id, { attributes: ['userId', 'password'] });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};

export const bulkCreateUsers = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an excel file' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (!data || data.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty' });
        }

        const usersToCreate = [];
        const duplicateUserIds = [];
        const errors = [];

        for (const [index, row] of data.entries()) {
            const { userId, fullName, email, phone, address, isActive, password } = row;

            if (!userId || !fullName) {
                errors.push(`Row ${index + 2}: userId and fullName are required.`);
                continue;
            }

            const parsedUserId = parseInt(userId, 10);
            if (isNaN(parsedUserId)) {
                errors.push(`Row ${index + 2}: userId must be a valid number.`);
                continue;
            }

            // Check existing userId in DB or in current batch
            const existingUser = await User.findByPk(parsedUserId, { attributes: ['userId'] });
            if (existingUser || usersToCreate.find(u => u.userId === parsedUserId)) {
                duplicateUserIds.push(parsedUserId);
                continue;
            }

            const plainPassword = password ? password.toString() : '123456';
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            usersToCreate.push({
                userId: parsedUserId,
                fullName,
                email,
                phone: phone ? phone.toString() : null,
                address,
                isActive: isActive !== undefined ? isActive : true,
                password: hashedPassword
            });
        }

        if (usersToCreate.length > 0) {
            await User.bulkCreate(usersToCreate);
        }

        res.status(201).json({
            message: `Successfully created ${usersToCreate.length} users.`,
            duplicates: duplicateUserIds,
            errors
        });
    } catch (error) {
        next(error);
    }
};
