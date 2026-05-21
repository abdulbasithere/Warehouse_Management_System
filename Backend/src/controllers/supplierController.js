import { Supplier } from '../models/setupModels.js';
import { Op } from 'sequelize';

const SUPPLIER_ATTRIBUTES = ['supplierId', 'name', 'address', 'city', 'phone', 'status', 'createdAt'];

const getStatusBoolean = (status) => {
    if (status === undefined || status === null) return true;
    return (status === true || status === 1 || status === 'true');
};

export const getAllSuppliers = async (req, res, next) => {
    try {
        const { search = '', page = 1, pageSize = 25 } = req.query;
        const offset = (page - 1) * pageSize;
        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { supplierId: { [Op.like]: `%${search}%` } },
                { city: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: suppliers } = await Supplier.findAndCountAll({
            where,
            attributes: SUPPLIER_ATTRIBUTES,
            order: [['createdAt', 'DESC']],
            limit: parseInt(pageSize),
            offset: parseInt(offset)
        });

        res.json({ data: suppliers, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
    } catch (error) {
        next(error);
    }
};

export const getSupplierById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findByPk(id, {
            attributes: SUPPLIER_ATTRIBUTES
        });
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (error) {
        next(error);
    }
};

export const createSupplier = async (req, res, next) => {
    try {
        const { supplierId, name, address, city, phone, status } = req.body;

        if (!supplierId || !name) {
            return res.status(400).json({ message: 'supplierId and name are required' });
        }

        const supplier = await Supplier.create({
            supplierId,
            name,
            address,
            city,
            phone,
            status: getStatusBoolean(status)
        });

        res.status(201).json({
            supplierId: supplier.supplierId,
            name: supplier.name,
            address: supplier.address,
            city: supplier.city,
            phone: supplier.phone,
            status: supplier.status,
            createdAt: supplier.createdAt
        });
    } catch (error) {
        next(error);
    }
};

export const updateSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, address, city, phone, status } = req.body;

        const supplier = await Supplier.findByPk(id, {
            attributes: SUPPLIER_ATTRIBUTES
        });
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (phone !== undefined) updateData.phone = phone;
        if (status !== undefined) updateData.status = getStatusBoolean(status);

        await supplier.update(updateData);

        res.json(supplier);
    } catch (error) {
        next(error);
    }
};

export const deleteSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findByPk(id, { attributes: ['supplierId'] });
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        await supplier.destroy();
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        next(error);
    }
};