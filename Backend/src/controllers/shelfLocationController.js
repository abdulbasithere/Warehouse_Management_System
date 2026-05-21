import { ShelfLocation, Warehouse } from '../models/setupModels.js';
import xlsx from 'xlsx';
import fs from 'fs';
import { Op } from 'sequelize';

export const getShelfLocations = async (req, res, next) => {
    try {
        const { search = '', warehouseId, page = 1, pageSize = 25 } = req.query;
        const offset = (page - 1) * pageSize;

        const where = {};

        if (search) {
            where[Op.or] = [
                { shelfId: { [Op.like]: `%${search}%` } },
                { aisle: { [Op.like]: `%${search}%` } },
                { shelfLevel: { [Op.like]: `%${search}%` } },
                { basket: { [Op.like]: `%${search}%` } }
            ];
        }

        if (warehouseId) {
            where.warehouseId = warehouseId;
        }

        const { count, rows } = await ShelfLocation.findAndCountAll({
            where,
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['shelfId', 'ASC']]
        });

        const mappedLocations = rows.map(sl => ({
            id: sl.shelfId,
            aisle: sl.aisle,
            shelfLevel: sl.shelfLevel,
            basket: sl.basket,
            currentOccupancy: sl.currentOccupancy || 0,
            warehouseId: sl.warehouseId
        }));

        res.json({ data: mappedLocations, total: count });
    } catch (error) {
        next(error);
    }
};

export const getShelfLocationById = async (req, res, next) => {
    try {
        const sl = await ShelfLocation.findByPk(req.params.id);
        if (!sl) return res.status(404).json({ message: 'Shelf location not found' });

        res.json({
            id: sl.shelfId,
            aisle: sl.aisle,
            shelfLevel: sl.shelfLevel,
            basket: sl.basket,
            currentOccupancy: sl.currentOccupancy || 0,
            warehouseId: sl.warehouseId
        });
    } catch (error) {
        next(error);
    }
};

export const createShelfLocation = async (req, res, next) => {
    try {
        const { aisle, shelfLevel, basket, warehouseId } = req.body;
        const shelfId = `${aisle}-${shelfLevel}-${basket}`;

        const newLocation = await ShelfLocation.create({
            shelfId: shelfId,
            aisle: aisle,
            shelfLevel: shelfLevel,
            basket: basket,
            warehouseId: warehouseId
        });

        res.status(201).json({
            id: newLocation.shelfId,
            locationCode: newLocation.shelfId,
            aisle: newLocation.aisle,
            shelfLevel: newLocation.shelfLevel,
            basket: newLocation.basket,
            currentOccupancy: newLocation.currentOccupancy || 0,
            warehouseId: newLocation.warehouseId
        });
    } catch (error) {
        next(error);
    }
};

export const bulkCreateShelfLocations = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // 1. Get unique warehouse names from rows
        const warehouseNames = [...new Set(rows.map(row => 
            (row.warehouseName || row.WarehouseName || row.warehouse || row.Warehouse || '').toString().trim()
        ))].filter(name => name !== '');

        // 2. Fetch all matching warehouses
        const warehouses = await Warehouse.findAll({
            where: {
                warehouseName: warehouseNames
            },
            attributes: ['warehouseId', 'warehouseName']
        });

        // 3. Create a mapping for quick lookup
        const warehouseMap = {};
        warehouses.forEach(w => {
            warehouseMap[w.warehouseName.toLowerCase()] = w.warehouseId;
        });

        const locationsToCreate = rows.map(row => {
            const aisle = (row.aisle || row.Aisle || '').toString().trim();
            const shelfLevel = (row.shelfLevel || row.ShelfLevel || row.Level || row.level || '').toString().trim();
            const basket = (row.basket || row.Basket || '').toString().trim();
            const wName = (row.warehouseName || row.WarehouseName || row.warehouse || row.Warehouse || '').toString().trim();

            const warehouseId = warehouseMap[wName.toLowerCase()];

            if (!aisle || !shelfLevel || !basket || !warehouseId) return null;

            return {
                shelfId: `${aisle}-${shelfLevel}-${basket}`,
                aisle: aisle,
                shelfLevel: shelfLevel,
                basket: basket,
                warehouseId: warehouseId
            };
        }).filter(l => l !== null);

        if (locationsToCreate.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'No valid locations found in file' });
        }

        const existingIds = (await ShelfLocation.findAll({
            attributes: ['shelfId'],
            where: {
                shelfId: locationsToCreate.map(l => l.shelfId)
            }
        })).map(sl => sl.shelfId);

        const newLocations = locationsToCreate.filter(l => !existingIds.includes(l.shelfId));

        if (newLocations.length > 0) {
            await ShelfLocation.bulkCreate(newLocations);
        }

        fs.unlinkSync(req.file.path);
        res.json({ message: `${newLocations.length} new shelf locations imported, ${existingIds.length} skipped as duplicates` });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(error);
    }
};

export const updateShelfLocation = async (req, res, next) => {
    try {
        const { aisle, shelfLevel, basket, warehouseId, currentOccupancy } = req.body;
        const oldId = req.params.id;
        const sl = await ShelfLocation.findByPk(oldId);
        if (!sl) return res.status(404).json({ message: 'Shelf location not found' });

        const newAisle = aisle !== undefined ? aisle : sl.aisle;
        const newShelfLevel = shelfLevel !== undefined ? shelfLevel : sl.shelfLevel;
        const newBasket = basket !== undefined ? basket : sl.basket;
        const newId = `${newAisle}-${newShelfLevel}-${newBasket}`;

        await ShelfLocation.update({
            shelfId: newId,
            aisle: newAisle,
            shelfLevel: newShelfLevel,
            basket: newBasket,
            warehouseId: warehouseId !== undefined ? warehouseId : sl.warehouseId,
            currentOccupancy: currentOccupancy !== undefined ? currentOccupancy : sl.currentOccupancy
        }, {
            where: { shelfId: oldId }
        });

        const updatedSl = await ShelfLocation.findByPk(newId);

        res.json({
            id: updatedSl.shelfId,
            aisle: updatedSl.aisle,
            shelfLevel: updatedSl.shelfLevel,
            basket: updatedSl.basket,
            currentOccupancy: updatedSl.currentOccupancy || 0,
            warehouseId: updatedSl.warehouseId
        });
    } catch (error) {
        next(error);
    }
};

export const deleteShelfLocation = async (req, res, next) => {
    try {
        const sl = await ShelfLocation.findByPk(req.params.id);
        if (!sl) return res.status(404).json({ message: 'Shelf location not found' });
        await sl.destroy();
        res.json({ message: 'Shelf location deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getCrossDockShelves = async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findOne({
            where: { warehouseName: 'CrossDock' }
        });

        if (!warehouse) {
            return res.status(404).json({ message: 'CrossDock warehouse not found' });
        }

        const shelves = await ShelfLocation.findAll({
            where: { warehouseId: warehouse.warehouseId }
        });

        res.json(shelves);
    } catch (error) {
        next(error);
    }
};
