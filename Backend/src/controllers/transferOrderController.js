import {
    TransferOrder, TransferOrderLine, InventoryLocation,
    Warehouse, ProductVariant, ShelfLocation, Putaway, User
} from '../models/setupModels.js';
import sequelize from '../utils/db.js';
import { Op } from 'sequelize';

/**
 * Helper: Generate unique transfer number  TO-YYYYMMDD-XXXX
 */
const generateTransferNumber = async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await TransferOrder.count({
        where: {
            transferNumber: { [Op.like]: `TO-${today}-%` }
        }
    });
    return `TO-${today}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * Helper: Find or create a TRANSIT shelf for a warehouse
 * Transit shelves are virtual locations representing goods in-transit
 */
const getTransitShelf = async (warehouseId, transaction) => {
    const transitShelfId = `TRANSIT-WH${warehouseId}`;
    const [shelf] = await ShelfLocation.findOrCreate({
        where: { shelfId: transitShelfId },
        defaults: {
            shelfId: transitShelfId,
            warehouseId,
            currentOccupancy: 0,
            aisle: 'TRANSIT',
            shelfLevel: '0',
            basket: 'VIRTUAL'
        },
        transaction
    });
    return shelf;
};

// ──────────────────────────────────────────────
// 1. CREATE TRANSFER ORDER
// ──────────────────────────────────────────────
export const createTransferOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { fromWarehouseId, toWarehouseId, transferDate, remarks, lines } = req.body;
        const createdBy = req.user?.id || null;

        // ── Validation ──
        if (!fromWarehouseId || !toWarehouseId) {
            await transaction.rollback();
            return res.status(400).json({ message: 'fromWarehouseId and toWarehouseId are required' });
        }

        if (parseInt(fromWarehouseId) === parseInt(toWarehouseId)) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Source and destination warehouse cannot be the same' });
        }

        if (!lines || !Array.isArray(lines) || lines.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'At least one transfer line is required' });
        }

        // Validate warehouses exist
        const fromWH = await Warehouse.findByPk(fromWarehouseId, { transaction });
        const toWH = await Warehouse.findByPk(toWarehouseId, { transaction });
        if (!fromWH) {
            await transaction.rollback();
            return res.status(404).json({ message: `Source warehouse ${fromWarehouseId} not found` });
        }
        if (!toWH) {
            await transaction.rollback();
            return res.status(404).json({ message: `Destination warehouse ${toWarehouseId} not found` });
        }

        // Validate all product variants exist
        for (const line of lines) {
            if (!line.productVariantId || !line.quantity || line.quantity <= 0) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Each line must have a valid productVariantId and quantity > 0' });
            }
            const variant = await ProductVariant.findByPk(line.productVariantId, { transaction });
            if (!variant) {
                await transaction.rollback();
                return res.status(404).json({ message: `Product variant ${line.productVariantId} not found` });
            }
        }

        // ── Create Header ──
        const transferNumber = await generateTransferNumber();
        const transferOrder = await TransferOrder.create({
            transferNumber,
            fromWarehouseId,
            toWarehouseId,
            status: 'Created',
            transferDate: transferDate || new Date(),
            remarks,
            createdBy
        }, { transaction });

        // ── Create Lines ──
        const createdLines = await Promise.all(lines.map(line =>
            TransferOrderLine.create({
                transferOrderId: transferOrder.id,
                productVariantId: line.productVariantId,
                quantity: line.quantity,
                packageType: line.packageType || null,
                packageQuantity: line.packageQuantity || null
            }, { transaction })
        ));

        await transaction.commit();

        res.status(201).json({
            message: 'Transfer order created successfully',
            transferOrder: {
                ...transferOrder.toJSON(),
                Lines: createdLines
            }
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// ──────────────────────────────────────────────
// 2. SHIP ORDER — Deduct from source, move to TRANSIT shelf
// ──────────────────────────────────────────────
export const shipOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const transferOrder = await TransferOrder.findByPk(id, {
            include: [{ model: TransferOrderLine, as: 'Lines' }],
            transaction
        });

        if (!transferOrder) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Transfer order not found' });
        }

        if (transferOrder.status !== 'Created') {
            await transaction.rollback();
            return res.status(400).json({
                message: `Cannot ship order with status '${transferOrder.status}'. Only 'Created' orders can be shipped.`
            });
        }

        // Get or create TRANSIT shelf at source warehouse
        const transitShelf = await getTransitShelf(transferOrder.fromWarehouseId, transaction);

        // ── Process each line ──
        for (const line of transferOrder.Lines) {
            const { productVariantId, quantity } = line;

            // Check available inventory at source warehouse (FIFO)
            const sourceInventory = await InventoryLocation.findAll({
                where: {
                    productVariantId,
                    warehouseId: transferOrder.fromWarehouseId,
                    quantityAvailable: { [Op.gt]: 0 },
                    // Exclude TRANSIT shelves — don't pick from items already in transit
                    shelfId: { [Op.notLike]: 'TRANSIT-%' }
                },
                order: [['receivedAt', 'ASC']],  // FIFO
                transaction
            });

            const totalAvailable = sourceInventory.reduce(
                (sum, loc) => sum + (loc.quantityAvailable - loc.quantityReserved), 0
            );

            if (totalAvailable < quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    message: `Insufficient stock for variant ${productVariantId}. Required: ${quantity}, Available: ${totalAvailable} at warehouse ${transferOrder.fromWarehouseId}`
                });
            }

            // ── Deduct from source (FIFO) ──
            let remainingToDeduct = quantity;
            for (const loc of sourceInventory) {
                if (remainingToDeduct <= 0) break;

                const freeQty = loc.quantityAvailable - loc.quantityReserved;
                const toDeduct = Math.min(remainingToDeduct, freeQty);

                if (toDeduct > 0) {
                    loc.quantityAvailable -= toDeduct;
                    await loc.save({ transaction });
                    remainingToDeduct -= toDeduct;
                }
            }

            // ── Create Putaway for transit (audit trail) ──
            const transitPutaway = await Putaway.create({
                productId: (await ProductVariant.findByPk(productVariantId, { transaction })).productId,
                totalUnits: quantity,
                putawayStatus: 'completed',
                putawayQuantity: quantity,
                completedAt: new Date(),
                referenceId: transferOrder.transferNumber,
                referenceType: 'TransferOrder',
                warehouseId: transferOrder.fromWarehouseId
            }, { transaction });

            // ── Create InventoryLocation on TRANSIT shelf ──
            await InventoryLocation.create({
                productVariantId,
                shelfId: transitShelf.shelfId,
                putawayId: transitPutaway.putawayId,
                warehouseId: transferOrder.fromWarehouseId,
                quantityAvailable: quantity,
                quantityReserved: quantity,  // Reserved — can't be picked for orders
                inventoryType: 'Normal',
                receivedAt: new Date(),
                referenceNumber: `TO-${transferOrder.id}-L${line.id}`
            }, { transaction });

            // Update line shipped quantity
            line.shippedQuantity = quantity;
            await line.save({ transaction });
        }

        // ── Update order status ──
        transferOrder.status = 'Shipped';
        transferOrder.shippedAt = new Date();
        await transferOrder.save({ transaction });

        await transaction.commit();

        res.json({
            message: `Transfer order ${transferOrder.transferNumber} shipped successfully`,
            transferOrder
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// ──────────────────────────────────────────────
// 3. RECEIVE ORDER — Move from TRANSIT to destination warehouse
// ──────────────────────────────────────────────
export const receiveOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { lineOverrides } = req.body; // Optional: [{ lineId, destinationShelfId }]

        const transferOrder = await TransferOrder.findByPk(id, {
            include: [{ model: TransferOrderLine, as: 'Lines' }],
            transaction
        });

        if (!transferOrder) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Transfer order not found' });
        }

        if (transferOrder.status !== 'Shipped') {
            await transaction.rollback();
            return res.status(400).json({
                message: `Cannot receive order with status '${transferOrder.status}'. Only 'Shipped' orders can be received.`
            });
        }

        // Determine a default receiving shelf at the destination warehouse
        const defaultReceivingShelfId = `RECEIVING-WH${transferOrder.toWarehouseId}`;
        await ShelfLocation.findOrCreate({
            where: { shelfId: defaultReceivingShelfId },
            defaults: {
                shelfId: defaultReceivingShelfId,
                warehouseId: transferOrder.toWarehouseId,
                currentOccupancy: 0,
                aisle: 'RECEIVING',
                shelfLevel: '0',
                basket: 'DOCK'
            },
            transaction
        });

        // Build override map: lineId -> destinationShelfId
        const overrideMap = {};
        if (Array.isArray(lineOverrides)) {
            for (const ov of lineOverrides) {
                overrideMap[ov.lineId] = ov.destinationShelfId;
            }
        }

        // ── Process each line ──
        for (const line of transferOrder.Lines) {
            const { productVariantId, shippedQuantity } = line;

            // ── Remove transit inventory ──
            const transitRef = `TO-${transferOrder.id}-L${line.id}`;
            const transitInventory = await InventoryLocation.findOne({
                where: { referenceNumber: transitRef },
                transaction
            });

            if (transitInventory) {
                transitInventory.quantityAvailable = 0;
                transitInventory.quantityReserved = 0;
                await transitInventory.save({ transaction });
            }

            // ── Determine destination shelf ──
            const targetShelfId = overrideMap[line.id]
                || defaultReceivingShelfId;

            // Validate destination shelf exists and belongs to destination warehouse
            const targetShelf = await ShelfLocation.findByPk(targetShelfId, { transaction });
            if (!targetShelf) {
                await transaction.rollback();
                return res.status(400).json({
                    message: `Destination shelf ${targetShelfId} not found`
                });
            }

            // ── Create Putaway at destination (audit trail) ──
            const variant = await ProductVariant.findByPk(productVariantId, { transaction });
            const destPutaway = await Putaway.create({
                productId: variant.productId,
                totalUnits: shippedQuantity,
                putawayStatus: 'completed',
                putawayQuantity: shippedQuantity,
                completedAt: new Date(),
                referenceId: transferOrder.transferNumber,
                referenceType: 'TransferOrder',
                warehouseId: transferOrder.toWarehouseId
            }, { transaction });

            // ── Create new inventory at destination warehouse ──
            await InventoryLocation.create({
                productVariantId,
                shelfId: targetShelfId,
                putawayId: destPutaway.putawayId,
                warehouseId: transferOrder.toWarehouseId,
                quantityAvailable: shippedQuantity,
                quantityReserved: 0,
                inventoryType: 'Normal',
                receivedAt: new Date(),
                referenceNumber: `TO-${transferOrder.id}-L${line.id}-RCV`
            }, { transaction });

            // Update shelf occupancy
            if (typeof targetShelf.currentOccupancy === 'number') {
                targetShelf.currentOccupancy += shippedQuantity;
                await targetShelf.save({ transaction });
            }

            // Update line received quantity
            line.receivedQuantity = shippedQuantity;
            await line.save({ transaction });
        }

        // ── Update order status ──
        transferOrder.status = 'Received';
        transferOrder.receivedAt = new Date();
        await transferOrder.save({ transaction });

        await transaction.commit();

        res.json({
            message: `Transfer order ${transferOrder.transferNumber} received successfully`,
            transferOrder
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// ──────────────────────────────────────────────
// 4. CANCEL ORDER — Only if status is 'Created'
// ──────────────────────────────────────────────
export const cancelOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const transferOrder = await TransferOrder.findByPk(id, { transaction });
        if (!transferOrder) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Transfer order not found' });
        }

        if (transferOrder.status !== 'Created') {
            await transaction.rollback();
            return res.status(400).json({
                message: `Cannot cancel order with status '${transferOrder.status}'. Only 'Created' orders can be cancelled.`
            });
        }

        transferOrder.status = 'Cancelled';
        await transferOrder.save({ transaction });

        await transaction.commit();
        res.json({ message: `Transfer order ${transferOrder.transferNumber} cancelled`, transferOrder });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

// ──────────────────────────────────────────────
// 5. GET ALL TRANSFER ORDERS (Paginated)
// ──────────────────────────────────────────────
export const getAllTransferOrders = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 25, status = '', fromWarehouseId = '', toWarehouseId = '' } = req.query;
        const offset = (page - 1) * pageSize;

        const where = {};
        if (status) where.status = status;
        if (fromWarehouseId) where.fromWarehouseId = fromWarehouseId;
        if (toWarehouseId) where.toWarehouseId = toWarehouseId;

        const { count, rows } = await TransferOrder.findAndCountAll({
            where,
            include: [
                { model: Warehouse, as: 'FromWarehouse', attributes: ['warehouseName'] },
                { model: Warehouse, as: 'ToWarehouse', attributes: ['warehouseName'] },
                { model: User, as: 'Creator', attributes: ['fullName'] },
                {
                    model: TransferOrderLine, as: 'Lines',
                    include: [{ model: ProductVariant, attributes: ['variantId', 'color', 'size'] }]
                }
            ],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({ data: rows, total: count });
    } catch (error) {
        next(error);
    }
};

// ──────────────────────────────────────────────
// 6. GET TRANSFER ORDER BY ID
// ──────────────────────────────────────────────
export const getTransferOrderById = async (req, res, next) => {
    try {
        const transferOrder = await TransferOrder.findByPk(req.params.id, {
            include: [
                { model: Warehouse, as: 'FromWarehouse' },
                { model: Warehouse, as: 'ToWarehouse' },
                { model: User, as: 'Creator', attributes: ['fullName'] },
                {
                    model: TransferOrderLine, as: 'Lines',
                    include: [
                        { model: ProductVariant, attributes: ['variantId', 'color', 'size', 'productId'] }
                    ]
                }
            ]
        });

        if (!transferOrder) {
            return res.status(404).json({ message: 'Transfer order not found' });
        }

        res.json(transferOrder);
    } catch (error) {
        next(error);
    }
};
