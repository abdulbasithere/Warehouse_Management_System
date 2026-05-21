import { InventoryAdjustment, InventoryLocation, Putaway, Product, ShelfLocation, User } from '../models/setupModels.js';
import sequelize from '../utils/db.js';
import { Op } from 'sequelize';

export const createAdjustment = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { productId, shelfId, adjustmentQuantity, reason, notes } = req.body;
        const adjustedBy = req.user.id;

        if (!productId || !shelfId || adjustmentQuantity === 0 || !reason) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Missing required fields or adjustment quantity is zero' });
        }

        // Fetch warehouseId from shelf for denormalization
        const shelf = await ShelfLocation.findByPk(shelfId, { attributes: ['warehouseId'], transaction });
        const warehouseId = shelf ? shelf.warehouseId : null;

        const adjustment = await InventoryAdjustment.create({
            productId,
            shelfId,
            adjustmentQuantity,
            reason,
            notes,
            adjustedBy,
            warehouseId,
            status: 'approved'
        }, { transaction });

        if (adjustmentQuantity < 0) {
            let remainingToSubtract = Math.abs(adjustmentQuantity);

            const locations = await InventoryLocation.findAll({
                where: {
                    productId,
                    shelfId,
                    quantityAvailable: { [Op.gt]: 0 }
                },
                order: [['receivedAt', 'ASC']],
                transaction
            });

            const totalNetAvailable = locations.reduce((sum, loc) => sum + (loc.quantityAvailable - loc.quantityReserved), 0);

            if (totalNetAvailable < remainingToSubtract) {
                await transaction.rollback();
                return res.status(400).json({
                    message: `Insufficient available stock. Trying to adjust ${remainingToSubtract} but only ${totalNetAvailable} is free (Available - Reserved).`
                });
            }

            for (const loc of locations) {
                if (remainingToSubtract <= 0) break;

                const freeInThisBatch = loc.quantityAvailable - loc.quantityReserved;
                const toSubtractFromThisBatch = Math.min(remainingToSubtract, freeInThisBatch);

                if (toSubtractFromThisBatch > 0) {
                    loc.quantityAvailable -= toSubtractFromThisBatch;
                    await loc.save({ transaction });
                    remainingToSubtract -= toSubtractFromThisBatch;
                }
            }
        } else {
            const newPutaway = await Putaway.create({
                productId,
                totalUnits: adjustmentQuantity,
                putawayStatus: 'completed',
                putawayQuantity: adjustmentQuantity,
                completedAt: new Date(),
                assignedPickerId: adjustedBy,
                warehouseId,
                referenceId: `ADJ-${Date.now()}`,
                referenceType: 'StockAdjustment'
            }, { transaction });

            await InventoryLocation.create({
                productId,
                shelfId,
                putawayId: newPutaway.putawayId,
                quantityAvailable: adjustmentQuantity,
                quantityReserved: 0,
                receivedAt: new Date(),
                warehouseId,
            }, { transaction });
        }

        await transaction.commit();
        res.status(201).json({ message: 'Adjustment processed successfully', adjustment });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export const getAdjustments = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 25 } = req.query;
        const offset = (page - 1) * pageSize;

        const { count, rows } = await InventoryAdjustment.findAndCountAll({
            include: [
                { model: Product, attributes: ['name'] },
                { model: User, attributes: ['fullName'] },
                { model: ShelfLocation }
            ],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['adjustmentDate', 'DESC']]
        });

        res.json({
            data: rows.map(adj => ({
                id: adj.adjustmentId,
                productId: adj.productId,
                productName: adj.Product ? adj.Product.name : 'Unknown',
                shelfId: adj.shelfId,
                shelfLocation: adj.ShelfLocation ? `${adj.ShelfLocation.aisle}-${adj.ShelfLocation.shelfLevel}-${adj.ShelfLocation.basket}` : adj.shelfId,
                quantity: adj.adjustmentQuantity,
                reason: adj.reason,
                notes: adj.notes,
                adjustedBy: adj.User ? adj.User.fullName : 'Unknown',
                date: adj.adjustmentDate,
                status: adj.status
            })),
            total: count
        });
    } catch (error) {
        next(error);
    }
};
