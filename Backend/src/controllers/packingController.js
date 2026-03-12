const { PackingJob, Order, OrderItem, Product, User, OrderAllocation } = require('../models/setupModels');
const { Op } = require('sequelize');
const sequelize = require('../utils/db');

const getPackingQueue = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        const { count, rows } = await PackingJob.findAndCountAll({
            where: { PackStatus: 'pending' },
            include: [Order],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['CreatedAt', 'DESC']]
        });

        const mappedQueue = rows.map(job => ({
            saleOrderNumber: job.OrderId,
            totalQuantity: job.TotalQuantity,
            status: job.PackStatus.toUpperCase(),
            basketReference: job.BasketRefrence,
        }));

        res.json({ data: mappedQueue, total: count });
    } catch (error) {
        next(error);
    }
};

const getPackingJobDetail = async (req, res, next) => {
    try {
        const job = await PackingJob.findOne({
            where: { OrderId: req.params.so },
            include: [
                {
                    model: Order,
                    include: [
                        {
                            model: OrderItem,
                            include: [Product, OrderAllocation]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'packer'
                }
            ]
        });

        if (!job) return res.status(404).json({ message: 'Packing job not found' });

        const mappedJob = {
            id: job.Packingid,
            saleOrderNumber: job.OrderId,
            shopifyOrderNumber: job.OrderId,
            packedQuantity: job.PackedQuantity,
            totalQuantity: job.TotalQuantity,
            status: job.PackStatus.toUpperCase(),
            basketReference: job.BasketRefrence,
            assignedPicker: job.packer ? { name: job.packer.FullName } : null,
            items: job.Order.OrderItems.map(item => {
                // Calculate packed quantity based on associated allocations for this item
                const packedQty = item.OrderAllocations
                    .filter(a => a.Packed)
                    .reduce((sum, a) => sum + a.Quantity, 0);

                return {
                    sku: item.Product ? item.Product.ProductId.toString() : 'N/A',
                    orderedQty: item.QuantityRequested,
                    packedQty: packedQty
                };
            })
        };

        res.json(mappedJob);
    } catch (error) {
        next(error);
    }
};

const scanPackItem = async (req, res, next) => {
    try {
        const { sku } = req.body;
        const job = await PackingJob.findOne({
            where: { OrderId: req.params.so },
            include: [{ model: Order, include: [{ model: OrderItem, include: [Product, OrderAllocation] }] }]
        });

        if (!job) return res.status(404).json({ message: 'Packing job not found' });

        // Find an allocation for this order and SKU that is Picked but not Packed
        let allocationToPack = null;
        for (const item of job.Order.OrderItems) {
            if (item.Product && item.Product.ProductId.toString() === sku) {
                allocationToPack = item.OrderAllocations.find(a => a.Picked && !a.Packed);
                if (allocationToPack) break;
            }
        }

        if (!allocationToPack) return res.status(400).json({ message: 'Item not found (must be picked first) or already packed' });

        allocationToPack.Packed = true;
        await allocationToPack.save();

        job.PackedQuantity += allocationToPack.Quantity;
        job.PackStatus = 'in_progress';
        await job.save();

        res.json(job);
    } catch (error) {
        next(error);
    }
};

const completePacking = async (req, res, next) => {
    try {
        const job = await PackingJob.findOne({ where: { OrderId: req.params.so } });
        if (!job) return res.status(404).json({ message: 'Packing job not found' });

        job.PackStatus = 'completed';
        job.CompleteAt = new Date();
        job.Packerid = req.user.id;
        await job.save();

        await Order.update({ Status: 'delivered' }, { where: { ShopifyOrderNumber: job.OrderId } });

        res.json(job);
    } catch (error) {
        next(error);
    }
};

const fetchBasketPacking = async (req, res, next) => {
    try {
        const job = await PackingJob.findOne({
            where: { BasketRefrence: req.params.basket },
            include: [{ model: Order, include: [{ model: OrderItem, include: [Product, OrderAllocation] }] }]
        });

        if (!job) return res.status(404).json({ message: 'No packing job found for this basket' });

        const mappedBasket = {
            orders: [{
                saleOrderNumber: job.OrderId,
                items: job.Order.OrderItems.map(item => {
                    const packedQty = item.OrderAllocations
                        .filter(a => a.Packed)
                        .reduce((sum, a) => sum + a.Quantity, 0);

                    return {
                        sku: item.Product ? item.Product.ProductId.toString() : 'N/A',
                        orderedQty: item.QuantityRequested,
                        packedQty: packedQty
                    };
                })
            }]
        };

        res.json(mappedBasket);
    } catch (error) {
        next(error);
    }
};

const scanBasketItem = async (req, res, next) => {
    try {
        const { sku } = req.body;
        const job = await PackingJob.findOne({
            where: { BasketRefrence: req.params.basket },
            include: [{ model: Order, include: [{ model: OrderItem, include: [Product, OrderAllocation] }] }]
        });

        if (!job) return res.status(404).json({ message: 'No packing job found for this basket' });

        let allocationMatched = null;
        for (const item of job.Order.OrderItems) {
            if (item.Product && item.Product.ProductId.toString() === sku) {
                const alloc = item.OrderAllocations.find(a => a.Picked && !a.Packed);
                if (alloc) {
                    alloc.Packed = true;
                    await alloc.save();

                    job.PackedQuantity += alloc.Quantity;
                    job.PackStatus = 'in_progress';
                    await job.save();

                    allocationMatched = alloc;
                    break;
                }
            }
        }

        if (!allocationMatched) return res.status(400).json({ message: 'Item not found in basket (must be picked first) or already packed' });

        res.json({ message: 'Item scanned' });
    } catch (error) {
        next(error);
    }
};

const completeBasketPacking = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const basket = req.params.basket;
        const job = await PackingJob.findOne({ where: { BasketRefrence: basket, PackStatus: 'pending' }, transaction });

        if (!job) {
            await transaction.rollback();
            return res.status(404).json({ message: 'No packing job found for this basket' });
        }

        const orderId = job.OrderId;

        // 1. Update OrderAllocations to Packed: true for this order
        await OrderAllocation.update(
            { Packed: true },
            {
                where: {
                    ShopifyOrderNumber: orderId,
                    Picked: true
                },
                transaction
            }
        );

        // 2. Update PackingJob and Order
        job.PackStatus = 'completed';
        job.CompleteAt = new Date();
        job.Packerid = req.user.id;
        await job.save({ transaction });

        await Order.update(
            { Status: 'delivered' },
            { where: { ShopifyOrderNumber: orderId }, transaction }
        );

        await transaction.commit();
        res.json({ message: 'Basket packing completed' });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

module.exports = {
    getPackingQueue,
    getPackingJobDetail,
    scanPackItem,
    completePacking,
    fetchBasketPacking,
    scanBasketItem,
    completeBasketPacking
};
