import { Warehouse } from '../models/setupModels.js';
import { Op } from 'sequelize';

const WAREHOUSE_ATTRIBUTES = ['warehouseId', 'warehouseName', 'phone', 'address', 'city', 'zip', 'longitude', 'latitude', 'status'];

export const getAllWarehouses = async (req, res, next) => {
    try {
        const { search = '', page = 1, pageSize = 25 } = req.query;
        const offset = (page - 1) * pageSize;
        const where = {};

        if (search) {
            where[Op.or] = [
                { warehouseName: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: warehouses } = await Warehouse.findAndCountAll({
            where,
            attributes: WAREHOUSE_ATTRIBUTES,
            order: [['warehouseName', 'ASC']],
            limit: parseInt(pageSize),
            offset: parseInt(offset)
        });

        const mapped = warehouses.map(w => ({
            id: w.warehouseId,
            name: w.warehouseName,
            phone: w.phone || '',
            address: w.address || '',
            city: w.city || '',
            zip: w.zip || '',
            longitude: w.longitude || '',
            latitude: w.latitude || '',
            status: w.status
        }));

        res.json({ data: mapped, total: count, page: parseInt(page), pageSize: parseInt(pageSize) });
    } catch (error) {
        next(error);
    }
};

export const getWarehouseById = async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id, {
            attributes: WAREHOUSE_ATTRIBUTES
        });
        if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });

        res.json({
            id: warehouse.warehouseId,
            name: warehouse.warehouseName,
            phone: warehouse.phone || '',
            address: warehouse.address || '',
            city: warehouse.city || '',
            zip: warehouse.zip || '',
            longitude: warehouse.longitude || '',
            latitude: warehouse.latitude || '',
            status: warehouse.status
        });
    } catch (error) {
        next(error);
    }
};

export const createWarehouse = async (req, res, next) => {
    try {
        const { name, phone, address, city, zip, longitude, latitude, status } = req.body;
        const statusValue = status !== undefined
            ? (status === true || status === 1)
            : true;

        const warehouse = await Warehouse.create({
            warehouseName: name,
            phone: phone,
            address: address,
            city: city,
            zip: zip,
            longitude: longitude,
            latitude: latitude,
            status: statusValue
        });

        res.status(201).json({
            id: warehouse.warehouseId,
            name: warehouse.warehouseName,
            phone: warehouse.phone,
            address: warehouse.address,
            city: warehouse.city,
            zip: warehouse.zip,
            longitude: warehouse.longitude,
            latitude: warehouse.latitude,
            status: warehouse.status
        });
    } catch (error) {
        next(error);
    }
};

export const updateWarehouse = async (req, res, next) => {
    try {
        const {
            name,
            phone,
            address,
            city,
            zip,
            longitude,
            latitude,
            status
        } = req.body;

        const warehouse = await Warehouse.findByPk(req.params.id, {
            attributes: WAREHOUSE_ATTRIBUTES
        });
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        if (name !== undefined) warehouse.warehouseName = name;
        if (phone !== undefined) warehouse.phone = phone;
        if (address !== undefined) warehouse.address = address;
        if (city !== undefined) warehouse.city = city;
        if (zip !== undefined) warehouse.zip = zip;
        if (longitude !== undefined) warehouse.longitude = longitude;
        if (latitude !== undefined) warehouse.latitude = latitude;
        if (status !== undefined) {
            warehouse.status = (status === true || status === 1 || status === 'true');
        }

        await warehouse.save();
        res.json({
            id: warehouse.warehouseId,
            name: warehouse.warehouseName,
            phone: warehouse.phone,
            address: warehouse.address,
            city: warehouse.city,
            zip: warehouse.zip,
            longitude: warehouse.longitude,
            latitude: warehouse.latitude,
            status: warehouse.status
        });

    } catch (error) {
        next(error);
    }
};

export const deleteWarehouse = async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id, { attributes: ['warehouseId'] });
        if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
        await warehouse.destroy();
        res.json({ message: 'Warehouse deleted successfully' });
    } catch (error) {
        next(error);
    }
};
