const { Putaway, Product, InventoryLocation, ShelfLocation, User } = require('../models/setupModels');
const { Op } = require('sequelize');

const getAllPutaways = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10, productId = '', status = '' } = req.query;
        const offset = (page - 1) * pageSize;

        const where = {};

        if (productId) {
            where.ProductId = { [Op.like]: `%${productId}%` };
        }

        if (status) {
            where.PutawayStatus = status.toLowerCase();
        }

        // If user is a picker, restrict to putaways assigned to them
        if (req.user && req.user.role === 'picker') {
            where.AssignedPickerId = req.user.id;
        }

        const { count, rows } = await Putaway.findAndCountAll({
            where,
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            include: [{ model: Product, attributes: ['ProductName'] }],
            order: [['CreatedAt', 'DESC']]
        });

        const mappedPutaways = rows.map(p => ({
            id: p.PutawayId,
            putawayNumber: `PA-${p.PutawayId.toString().padStart(5, '0')}`,
            productId: p.ProductId,
            productName: p.Product ? p.Product.ProductName : 'Unknown',
            totalQuantity: p.TotalUnits,
            putawayQuantity: p.PutawayQuantity || 0,
            status: p.PutawayStatus.toUpperCase(),
            createDate: p.CreatedAt,
            assignedPickerId: p.AssignedPickerId
        }));

        res.json({ data: mappedPutaways, total: count });
    } catch (error) {
        next(error);
    }
};

const getPutawayDetail = async (req, res, next) => {
    try {
        const putaway = await Putaway.findByPk(req.params.id, {
            include: [
                { model: Product },
                { model: User, as: 'Picker', attributes: ['FullName'] }
            ]
        });

        if (!putaway) return res.status(404).json({ message: 'Putaway not found' });

        const mappedDetail = {
            id: putaway.PutawayId,
            putawayNumber: `PA-${putaway.PutawayId.toString().padStart(4, '0')}`,
            status: putaway.PutawayStatus.toUpperCase(),
            productId: putaway.ProductId,
            productName: putaway.Product ? putaway.Product.ProductName : 'Unknown',
            totalQuantity: putaway.TotalUnits,
            putawayQuantity: putaway.PutawayQuantity || 0,
            assignedPickerId: putaway.AssignedPickerId,
            assignedPickerName: putaway.Picker ? putaway.Picker.FullName : null,
            items: [{
                id: `item-${putaway.PutawayId}`,
                productId: putaway.ProductId,
                sku: putaway.ProductId, // Assuming ProductId is the SKU
                productName: putaway.Product ? putaway.Product.ProductName : 'Unknown',
                quantity: putaway.TotalUnits,
                putawayQuantity: putaway.PutawayQuantity || 0
            }]
        };

        res.json(mappedDetail);
    } catch (error) {
        next(error);
    }
};

const createPutaway = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        const newPutaway = await Putaway.create({
            ProductId: productId,
            TotalUnits: quantity,
            PutawayStatus: 'pending',
            PutawayQuantity: 0
        });

        res.status(201).json(newPutaway);
    } catch (error) {
        next(error);
    }
};

const bulkCreatePutaways = async (req, res, next) => {
    try {
        const { items } = req.body; // Array of { productId, totalUnits }

        if (!Array.isArray(items)) {
            return res.status(400).json({ message: 'Items must be an array' });
        }

        const putaways = await Promise.all(items.map(item =>
            Putaway.create({
                ProductId: item.productId,
                TotalUnits: parseInt(item.totalUnits),
                PutawayStatus: 'pending',
                PutawayQuantity: 0
            })
        ));

        res.status(201).json({ message: `${putaways.length} putaways created`, data: putaways });
    } catch (error) {
        next(error);
    }
};

const assignPickerToPutaway = async (req, res, next) => {
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
                AssignedPickerId: userId,
                PutawayStatus: 'in-progress'
            },
            { where: { PutawayId: { [Op.in]: ids } } }
        );

        res.json({ message: 'Picker assigned successfully' });
    } catch (error) {
        next(error);
    }
};

const completePutawayTask = async (req, res, next) => {
    try {
        const { scans } = req.body; // Array of { shelfId, quantity }
        const putaway = await Putaway.findByPk(req.params.id);

        if (!putaway) {
            return res.status(404).json({ message: 'Putaway not found' });
        }

        if (putaway.PutawayStatus === 'completed') {
            return res.status(400).json({ message: 'Putaway already completed' });
        }

        const totalScanned = scans.reduce((sum, s) => sum + parseInt(s.quantity, 10), 0);

        if (totalScanned > putaway.TotalUnits) {
            return res.status(400).json({
                message: `Scanned quantity (${totalScanned}) exceeds total required (${putaway.TotalUnits})`
            });
        }

        // Process each scan – create NEW InventoryLocation record per scan / putaway event
        for (const scan of scans) {
            const { shelfId, quantity } = scan;
            const qty = parseInt(quantity, 10);

            if (qty <= 0) continue; // skip invalid quantities

            const shelf = await ShelfLocation.findByPk(shelfId);
            if (!shelf) {
                return res.status(400).json({ message: `Shelf ${shelfId} not found` });
            }

            // Create new inventory location record for this putaway batch
            await InventoryLocation.create({
                ProductID: putaway.ProductId,
                ShelfID: shelf.ShelfId,
                PutawayId: putaway.PutawayId,          // links to this specific putaway task
                QuantityAvailable: qty,
                QuantityReserved: 0,
                RecievedAt: new Date(),                // or use putaway.CompletedAt if you set it earlier
            });

            // Optional: maintain shelf occupancy if the field exists
            if (typeof shelf.CurrentOccupancy === 'number') {
                shelf.CurrentOccupancy = (shelf.CurrentOccupancy || 0) + qty;
                await shelf.save();
            }
        }

        // Update putaway status
        putaway.PutawayQuantity = totalScanned;

        if (totalScanned >= putaway.TotalUnits) {
            putaway.PutawayStatus = 'completed';
            putaway.CompletedAt = new Date();
        } else {
            putaway.PutawayStatus = 'in-progress';
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

module.exports = {
    getAllPutaways,
    getPutawayDetail,
    createPutaway,
    bulkCreatePutaways,
    assignPickerToPutaway,
    // scanPutawayItem,
    completePutawayTask
};
