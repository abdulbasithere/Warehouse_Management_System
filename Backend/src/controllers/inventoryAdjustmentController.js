const { InventoryAdjustment, InventoryLocation, Putaway, Product, ShelfLocation, User } = require('../models/setupModels');
const sequelize = require('../utils/db');
const { Op } = require('sequelize');

const createAdjustment = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { productID, shelfID, adjustmentQuantity, reason, notes } = req.body;
        const adjustedBy = req.user.id;

        if (!productID || !shelfID || adjustmentQuantity === 0 || !reason) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Missing required fields or adjustment quantity is zero' });
        }

        // 1. Log the adjustment
        const adjustment = await InventoryAdjustment.create({
            ProductID: productID,
            ShelfID: shelfID,
            AdjustmentQuantity: adjustmentQuantity,
            Reason: reason,
            Notes: notes,
            AdjustedBy: adjustedBy,
            Status: 'approved' // Automatically approved for admin-level action
        }, { transaction });

        if (adjustmentQuantity < 0) {
            // SHORTAGE: Decrease inventory
            let remainingToSubtract = Math.abs(adjustmentQuantity);

            // Find available inventory on this shelf for this product (FIFO)
            const locations = await InventoryLocation.findAll({
                where: {
                    ProductID: productID,
                    ShelfID: shelfID,
                    QuantityAvailable: { [Op.gt]: 0 }
                },
                order: [['RecievedAt', 'ASC']],
                transaction
            });

            // Calculate total available (excluding reserved)
            const totalNetAvailable = locations.reduce((sum, loc) => sum + (loc.QuantityAvailable - loc.QuantityReserved), 0);

            if (totalNetAvailable < remainingToSubtract) {
                await transaction.rollback();
                return res.status(400).json({
                    message: `Insufficient available stock. Trying to adjust ${remainingToSubtract} but only ${totalNetAvailable} is free (Available - Reserved).`
                });
            }

            for (const loc of locations) {
                if (remainingToSubtract <= 0) break;

                const freeInThisBatch = loc.QuantityAvailable - loc.QuantityReserved;
                const toSubtractFromThisBatch = Math.min(remainingToSubtract, freeInThisBatch);

                if (toSubtractFromThisBatch > 0) {
                    loc.QuantityAvailable -= toSubtractFromThisBatch;
                    await loc.save({ transaction });
                    remainingToSubtract -= toSubtractFromThisBatch;
                }
            }
        } else {
            // EXCESS: Increase inventory
            // Create a pseudo-putaway task for tracking
            const newPutaway = await Putaway.create({
                ProductId: productID,
                TotalUnits: adjustmentQuantity,
                PutawayStatus: 'completed',
                PutawayQuantity: adjustmentQuantity,
                CompletedAt: new Date(),
                AssignedPickerId: adjustedBy
            }, { transaction });

            // Create new inventory location record
            await InventoryLocation.create({
                ProductID: productID,
                ShelfID: shelfID,
                PutawayId: newPutaway.PutawayId,
                QuantityAvailable: adjustmentQuantity,
                QuantityReserved: 0,
                RecievedAt: new Date(),
            }, { transaction });
        }

        await transaction.commit();
        res.status(201).json({ message: 'Adjustment processed successfully', adjustment });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const getAdjustments = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        const { count, rows } = await InventoryAdjustment.findAndCountAll({
            include: [
                { model: Product, attributes: ['ProductName'] },
                { model: User, attributes: ['FullName'] },
                { model: ShelfLocation }
            ],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['AdjustmentDate', 'DESC']]
        });

        res.json({
            data: rows.map(adj => ({
                id: adj.AdjustmentId,
                productId: adj.ProductID,
                productName: adj.Product ? adj.Product.ProductName : 'Unknown',
                shelfId: adj.ShelfID,
                shelfLocation: adj.ShelfLocation ? `${adj.ShelfLocation.Aisle}-${adj.ShelfLocation.ShelfLevel}-${adj.ShelfLocation.Basket}` : adj.ShelfID,
                quantity: adj.AdjustmentQuantity,
                reason: adj.Reason,
                notes: adj.Notes,
                adjustedBy: adj.User ? adj.User.FullName : 'Unknown',
                date: adj.AdjustmentDate,
                status: adj.Status
            })),
            total: count
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAdjustment,
    getAdjustments
};
