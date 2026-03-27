const { ShelfLocation } = require('../models/setupModels');
const xlsx = require('xlsx');
const fs = require('fs');
const { Op } = require('sequelize');

const getShelfLocations = async (req, res, next) => {
    try {
        const { search = '', warehouseId, page = 1, pageSize = 5 } = req.query;
        const offset = (page - 1) * pageSize;

        const where = {};

        if (search) {
            where.ShelfId = { [Op.like]: `%${search}%` };
        }

        if (warehouseId) {
            where.WarehouseId = warehouseId;
        }

        const { count, rows } = await ShelfLocation.findAndCountAll({
            where,
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['ShelfId', 'ASC']]
        });

        const mappedLocations = rows.map(sl => ({
            id: sl.ShelfId,
            aisle: sl.Aisle,
            shelfLevel: sl.ShelfLevel,
            basket: sl.Basket,
            currentOccupancy: sl.CurrentOccupancy || 0,
            warehouseId: sl.WarehouseId
        }));

        res.json({ data: mappedLocations, total: count });
    } catch (error) {
        next(error);
    }
};

const createShelfLocation = async (req, res, next) => {
    try {
        const { aisle, shelfLevel, basket, warehouseId } = req.body;
        const shelfId = `${aisle}-${shelfLevel}-${basket}`;

        const newLocation = await ShelfLocation.create({
            ShelfId: shelfId,
            Aisle: aisle,
            ShelfLevel: shelfLevel,
            Basket: basket,
            WarehouseId: warehouseId
        });

        res.status(201).json({
            id: newLocation.ShelfId,
            locationCode: newLocation.ShelfId,
            aisle: newLocation.Aisle,
            shelfLevel: newLocation.ShelfLevel,
            basket: newLocation.Basket,
            currentOccupancy: newLocation.CurrentOccupancy || 0,
            warehouseId: newLocation.WarehouseId
        });
    } catch (error) {
        next(error);
    }
};

const bulkCreateShelfLocations = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const locationsToCreate = rows.map(row => {
            const aisle = (row.Aisle || row.aisle || '').toString().trim();
            const shelfLevel = (row.ShelfLevel || row.shelfLevel || row.Level || row.level || '').toString().trim();
            const basket = (row.Basket || row.basket || '').toString().trim();
            const warehouseId = row.WarehouseId || row.warehouseId || row.WarehouseID || row.warehouse_id;

            if (!aisle || !shelfLevel || !basket) return null;

            return {
                ShelfId: `${aisle}-${shelfLevel}-${basket}`,
                Aisle: aisle,
                ShelfLevel: shelfLevel,
                Basket: basket,
                WarehouseId: warehouseId
            };
        }).filter(l => l !== null);

        if (locationsToCreate.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'No valid locations found in file' });
        }

        const existingIds = (await ShelfLocation.findAll({
            attributes: ['ShelfId'],
            where: {
                ShelfId: locationsToCreate.map(l => l.ShelfId)
            }
        })).map(sl => sl.ShelfId);

        const newLocations = locationsToCreate.filter(l => !existingIds.includes(l.ShelfId));

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

module.exports = {
    getShelfLocations,
    createShelfLocation,
    bulkCreateShelfLocations
};
