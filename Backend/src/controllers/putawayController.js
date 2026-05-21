import { Putaway, Product, InventoryLocation, ShelfLocation, User } from '../models/setupModels.js';
import { Op } from 'sequelize';

export const getAllPutaways = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 25, productId = '', status = '' } = req.query;
        const offset = (page - 1) * pageSize;

        const where = {};

        if (productId) {
            where.productId = { [Op.like]: `%${productId}%` };
        }

        if (status) {
            where.putawayStatus = status.toLowerCase();
        }

        if (req.user && req.user.role === 'picker') {
            where.assignedPickerId = req.user.id;
        }

        const { count, rows } = await Putaway.findAndCountAll({
            where,
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            include: [{ model: Product, attributes: ['name'] }],
            order: [['createdAt', 'DESC']]
        });

        const mappedPutaways = rows.map(p => ({
            id: p.putawayId,
            putawayNumber: `PA-${p.putawayId.toString().padStart(5, '0')}`,
            productId: p.productId,
            productName: p.Product ? p.Product.name : 'Unknown',
            totalQuantity: p.totalUnits,
            putawayQuantity: p.putawayQuantity || 0,
            status: p.putawayStatus.toUpperCase(),
            createDate: p.createdAt,
            assignedPickerId: p.assignedPickerId
        }));

        res.json({ data: mappedPutaways, total: count });
    } catch (error) {
        next(error);
    }
};

export const getPutawayDetail = async (req, res, next) => {
    try {
        const putaway = await Putaway.findByPk(req.params.id, {
            include: [
                { model: Product },
                { model: User, as: 'Picker', attributes: ['fullName'] }
            ]
        });

        if (!putaway) return res.status(404).json({ message: 'Putaway not found' });

        const mappedDetail = {
            id: putaway.putawayId,
            putawayNumber: `PA-${putaway.putawayId.toString().padStart(4, '0')}`,
            status: putaway.putawayStatus.toUpperCase(),
            productId: putaway.productId,
            productName: putaway.Product ? putaway.Product.name : 'Unknown',
            totalQuantity: putaway.totalUnits,
            putawayQuantity: putaway.putawayQuantity || 0,
            assignedPickerId: putaway.assignedPickerId,
            assignedPickerName: putaway.Picker ? putaway.Picker.fullName : null,
            items: [{
                id: `item-${putaway.putawayId}`,
                productId: putaway.productId,
                sku: putaway.productId,
                productName: putaway.Product ? putaway.Product.name : 'Unknown',
                quantity: putaway.totalUnits,
                putawayQuantity: putaway.putawayQuantity || 0
            }]
        };

        res.json(mappedDetail);
    } catch (error) {
        next(error);
    }
};

export const createPutaway = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        const newPutaway = await Putaway.create({
            productId: productId,
            totalUnits: quantity,
            putawayStatus: 'pending',
            putawayQuantity: 0
        });

        res.status(201).json(newPutaway);
    } catch (error) {
        next(error);
    }
};

export const bulkCreatePutaways = async (req, res, next) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({ message: 'Items must be an array' });
        }

        const putaways = await Promise.all(items.map(item =>
            Putaway.create({
                productId: item.productId,
                totalUnits: parseInt(item.totalUnits),
                putawayStatus: 'pending',
                putawayQuantity: 0
            })
        ));

        res.status(201).json({ message: `${putaways.length} putaways created`, data: putaways });
    } catch (error) {
        next(error);
    }
};

export const assignPickerToPutaway = async (req, res, next) => {
    try {
        const { putawayId, putawayIds, userId } = req.body;

        const ids = putawayIds || (putawayId ? [putawayId] : []);
        if (ids.length === 0) {
            return res.status(400).json({ message: 'No putaway IDs provided' });
        }

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await Putaway.update(
            {
                assignedPickerId: userId,
                putawayStatus: 'in-progress'
            },
            { where: { putawayId: { [Op.in]: ids } } }
        );

        res.json({ message: 'Picker assigned successfully' });
    } catch (error) {
        next(error);
    }
};

export const completePutawayTask = async (req, res, next) => {
    try {
        const { scans } = req.body;
        const putaway = await Putaway.findByPk(req.params.id);

        if (!putaway) {
            return res.status(404).json({ message: 'Putaway not found' });
        }

        if (putaway.putawayStatus === 'completed') {
            return res.status(400).json({ message: 'Putaway already completed' });
        }

        const totalScanned = scans.reduce((sum, s) => sum + parseInt(s.quantity, 10), 0);

        if (totalScanned > putaway.totalUnits) {
            return res.status(400).json({
                message: `Scanned quantity (${totalScanned}) exceeds total required (${putaway.totalUnits})`
            });
        }

        for (const scan of scans) {
            const { shelfId, quantity } = scan;
            const qty = parseInt(quantity, 10);

            if (qty <= 0) continue;

            const shelf = await ShelfLocation.findByPk(shelfId);
            if (!shelf) {
                return res.status(400).json({ message: `Shelf ${shelfId} not found` });
            }

            // Populate denormalized warehouseId from shelf
            const warehouseId = shelf.warehouseId || null;

            // Set warehouseId on putaway if not already set
            if (!putaway.warehouseId && warehouseId) {
                putaway.warehouseId = warehouseId;
            }

            await InventoryLocation.create({
                productId: putaway.productId,
                shelfId: shelf.shelfId,
                putawayId: putaway.putawayId,
                quantityAvailable: qty,
                quantityReserved: 0,
                receivedAt: new Date(),
                warehouseId,
            });

            if (typeof shelf.currentOccupancy === 'number') {
                shelf.currentOccupancy = (shelf.currentOccupancy || 0) + qty;
                await shelf.save();
            }
        }

        putaway.putawayQuantity = totalScanned;

        if (totalScanned >= putaway.totalUnits) {
            putaway.putawayStatus = 'completed';
            putaway.completedAt = new Date();
        } else {
            putaway.putawayStatus = 'in-progress';
        }

        await putaway.save();

        return res.status(200).json({
            message: 'Putaway processed successfully',
            putaway
        });

    } catch (error) {
        next(error);
    }
};
