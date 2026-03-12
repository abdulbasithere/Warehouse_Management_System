const { PickList, OrderAllocation, Product, ShelfLocation, User, Order, PackingJob } = require('../models/setupModels');
const { Op } = require('sequelize');
const sequelize = require('../utils/db');

const getAllPickLists = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        const where = {
            PickStatus: 'open'          // ← Only show pick lists that are NOT yet completed
        };
        // If user is a picker, only show picklists assigned to them
        if (req.user.role === 'picker') {
            where.AssginPickerId = req.user.id;
        }

        const { count, rows } = await PickList.findAndCountAll({
            where,
            include: [{ model: OrderAllocation }],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['CreatedAt', 'DESC']]
        });

        const mappedPicklists = rows.map(pl => {
            const pickedQty = pl.OrderAllocations
                ? pl.OrderAllocations.reduce((sum, a) => sum + (a.Picked ? a.Quantity : 0), 0)
                : 0;

            return {
                id: pl.PicklistId,
                pickingListNumber: `PL-${pl.PicklistId.toString().padStart(4, '0')}`,
                status: pl.PickStatus.toUpperCase(),
                pickedQuantity: pickedQty,
                totalQuantity: pl.TotalQauntity,
                totalOrders: pl.TotalOrder
            };
        });

        res.json({ data: mappedPicklists, total: count });
    } catch (error) {
        next(error);
    }
};

const getPickListDetail = async (req, res, next) => {
    try {
        const pl = await PickList.findByPk(req.params.id, {
            include: [
                {
                    model: OrderAllocation,
                    include: [Product, ShelfLocation, Order]
                },
                {
                    model: User,
                    as: 'picker'
                }
            ]
        });

        if (!pl) return res.status(404).json({ message: 'PickList not found' });

        // If user is a picker, they can only view their own picklists
        if (req.user.role === 'picker' && pl.AssginPickerId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to view this picklist' });
        }

        const mappedDetail = {
            pickList: {
                id: pl.PicklistId,
                pickingListNumber: `PL-${pl.PicklistId.toString().padStart(4, '0')}`,
                status: pl.PickStatus.toUpperCase(),
                pickedQuantity: pl.PickQuantity,
                totalQuantity: pl.TotalQauntity,
                totalOrders: pl.TotalOrder
            },
            items: pl.OrderAllocations.map(item => ({
                id: item.OrderAllocationId,
                sku: item.Product ? item.Product.ProductId.toString() : 'N/A',
                itemName: item.Product ? item.Product.ProductName : 'Unknown',
                requiredQty: item.Quantity,
                pickedQty: item.Picked ? item.Quantity : 0,
                shelfLocation: item.ShelfLocation ? `${item.ShelfLocation.Aisle}-${item.ShelfLocation.ShelfLevel}-${item.ShelfLocation.Basket}` : 'N/A',
                aisle: item.ShelfLocation ? item.ShelfLocation.Aisle : '',
                shelfLevel: item.ShelfLocation ? item.ShelfLocation.ShelfLevel : '',
                orderNumber: item.ShopifyOrderNumber,
                basketReference: item.Order ? item.Order.BasketRefrence : null
            }))
        };

        res.json(mappedDetail);
    } catch (error) {
        next(error);
    }
};

const createPickList = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { ids, assignedPickerId } = req.body;

        // Find all allocations for these orders that are NOT yet in a picklist
        const allocations = await OrderAllocation.findAll({
            where: {
                ShopifyOrderNumber: ids,
                pickListId: null
            },
            transaction
        });

        if (allocations.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'No unassigned items found for these orders' });
        }

        const totalQty = allocations.reduce((sum, item) => sum + item.Quantity, 0);

        // Create the PickList
        const newPL = await PickList.create({
            PickStatus: 'open',
            PickQuantity: 0,
            TotalQauntity: totalQty,
            TotalOrder: ids.length,
            AssginPickerId: assignedPickerId
        }, { transaction });

        // Assign these allocations to the new picklist
        await OrderAllocation.update(
            { pickListId: newPL.PicklistId },
            {
                where: { OrderAllocationId: allocations.map(a => a.OrderAllocationId) },
                transaction
            }
        );

        // Update order status to processing
        await Order.update(
            { Status: 'picking' },
            {
                where: { ShopifyOrderNumber: ids },
                transaction
            }
        );
        await transaction.commit();
        res.status(201).json({ id: newPL.PicklistId });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const assignBasket = async (req, res, next) => {
    try {
        const { basket, orderNumber } = req.body;
        const pl = await PickList.findByPk(req.params.id);
        if (!pl) return res.status(404).json({ message: 'PickList not found' });

        if (orderNumber) {
            // Assign to specific order
            await Order.update(
                { BasketRefrence: basket },
                { where: { ShopifyOrderNumber: orderNumber } }
            );
        }

        pl.PickStatus = 'in_progress';
        await pl.save();

        res.json({ message: 'Basket assigned' });
    } catch (error) {
        next(error);
    }
};

const scanPickItem = async (req, res, next) => {
    try {
        const { sku } = req.body;
        const pl = await PickList.findByPk(req.params.id, {
            include: [{ model: OrderAllocation, include: [Product] }]
        });

        if (!pl) return res.status(404).json({ message: 'PickList not found' });

        // Find an allocation with this SKU that is not picked yet
        const item = pl.OrderAllocations.find(i => i.Product && i.Product.ProductId.toString() === sku && !i.Picked);
        if (!item) return res.status(400).json({ message: 'Item not found in picklist or already picked' });

        item.Picked = true;
        await item.save();

        pl.PickQuantity += item.Quantity; // Full quantity of this allocation is now picked
        if (pl.PickQuantity >= pl.TotalQauntity) {
            pl.PickStatus = 'completed';
            pl.CompletedAt = new Date();
        }
        await pl.save();

        res.json({ message: 'Item picked' });
    } catch (error) {
        next(error);
    }
};

const finalizePickList = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const pl = await PickList.findByPk(id, {
            include: [{ model: OrderAllocation }],
            transaction
        });

        if (!pl) {
            await transaction.rollback();
            return res.status(404).json({ message: 'PickList not found' });
        }

        if (pl.PickStatus === 'completed') {
            await transaction.rollback();
            return res.status(400).json({ message: 'PickList is already completed' });
        }

        // 1. Update PickList status and completion time
        pl.PickStatus = 'completed';
        pl.CompletedAt = new Date();
        await pl.save({ transaction });

        // 2. Update all OrderAllocations to Picked: true
        await OrderAllocation.update(
            { Picked: true },
            { where: { pickListId: id }, transaction }
        );

        // 3. Create PackingJobs for each unique order in this picklist
        const allocations = await OrderAllocation.findAll({
            where: { pickListId: id },
            include: [Order],
            transaction
        });

        const ordersInPicklist = [...new Set(allocations.map(a => a.ShopifyOrderNumber))];

        for (const orderNumber of ordersInPicklist) {
            const orderAllocations = allocations.filter(a => a.ShopifyOrderNumber === orderNumber);
            const totalQty = orderAllocations.reduce((sum, a) => sum + a.Quantity, 0);

            // Use order-specific basket
            const orderBasket = orderAllocations[0].Order ? orderAllocations[0].Order.BasketRefrence : null;

            if (!orderBasket) {
                // If NO basket is assigned anywhere, we might want to throw an error or skip
                // For now, let's assume at least one is assigned.
                continue;
            }

            // Check if PackingJob already exists for this order and basket
            const existingJob = await PackingJob.findOne({
                where: { OrderId: orderNumber, BasketRefrence: orderBasket },
                transaction
            });

            if (!existingJob) {
                await PackingJob.create({
                    OrderId: orderNumber,
                    PackStatus: 'pending',
                    PackedQuantity: 0,
                    TotalQuantity: totalQty,
                    BasketRefrence: orderBasket,
                    CreatedAt: new Date()
                }, { transaction });
            }
        }

        await transaction.commit();
        res.json({ message: 'Picklist finalized and packing jobs created' });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

module.exports = {
    getAllPickLists,
    getPickListDetail,
    createPickList,
    assignBasket,
    scanPickItem,
    finalizePickList
};
