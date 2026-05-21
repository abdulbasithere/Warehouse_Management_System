import { PackingJob, Order, OrderItem, Product, User, OrderAllocation } from '../models/setupModels.js';
import sequelize from '../utils/db.js';

export const getPackingQueue = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 25 } = req.query;
        const offset = (page - 1) * pageSize;

        const { count, rows } = await PackingJob.findAndCountAll({
            where: { packStatus: 'pending' },
            include: [Order],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const mappedQueue = rows.map(job => ({
            saleOrderNumber: job.orderId,
            totalQuantity: job.totalQuantity,
            status: job.packStatus.toUpperCase(),
            basketReference: job.basketReference,
        }));

        res.json({ data: mappedQueue, total: count });
    } catch (error) {
        next(error);
    }
};

export const getPackingJobDetail = async (req, res, next) => {
    try {
        const job = await PackingJob.findOne({
            where: { orderId: req.params.so },
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
            id: job.packingId,
            saleOrderNumber: job.orderId,
            shopifyOrderNumber: job.orderId,
            packedQuantity: job.packedQuantity,
            totalQuantity: job.totalQuantity,
            status: job.packStatus.toUpperCase(),
            basketReference: job.basketReference,
            assignedPicker: job.packer ? { name: job.packer.fullName } : null,
            items: job.Order.OrderItems.map(item => {
                const packedQty = item.OrderAllocations
                    .filter(a => a.packed)
                    .reduce((sum, a) => sum + a.quantity, 0);

                return {
                    sku: item.Product ? item.Product.productId.toString() : 'N/A',
                    orderedQty: item.quantityRequested,
                    packedQty: packedQty
                };
            })
        };

        res.json(mappedJob);
    } catch (error) {
        next(error);
    }
};

export const scanPackItem = async (req, res, next) => {
    try {
        const { sku } = req.body;
        const job = await PackingJob.findOne({
            where: { orderId: req.params.so },
            include: [{ model: Order, include: [{ model: OrderItem, include: [Product, OrderAllocation] }] }]
        });

        if (!job) return res.status(404).json({ message: 'Packing job not found' });

        let allocationToPack = null;
        for (const item of job.Order.OrderItems) {
            if (item.Product && item.Product.productId.toString() === sku) {
                allocationToPack = item.OrderAllocations.find(a => a.picked && !a.packed);
                if (allocationToPack) break;
            }
        }

        if (!allocationToPack) return res.status(400).json({ message: 'Item not found (must be picked first) or already packed' });

        allocationToPack.packed = true;
        await allocationToPack.save();

        job.packedQuantity += allocationToPack.quantity;
        job.packStatus = 'in_progress';
        await job.save();

        res.json(job);
    } catch (error) {
        next(error);
    }
};

export const completePacking = async (req, res, next) => {
    try {
        const job = await PackingJob.findOne({ where: { orderId: req.params.so } });
        if (!job) return res.status(404).json({ message: 'Packing job not found' });

        job.packStatus = 'completed';
        job.completeAt = new Date();
        job.packerId = req.user.id;
        await job.save();

        await Order.update({ status: 'delivered' }, { where: { shopifyOrderNumber: job.orderId } });

        res.json(job);
    } catch (error) {
        next(error);
    }
};

export const fetchBasketPacking = async (req, res, next) => {
    try {
        const job = await PackingJob.findOne({
            where: { basketReference: req.params.basket },
            include: [{ model: Order, include: [{ model: OrderItem, include: [Product, OrderAllocation] }] }]
        });

        if (!job) return res.status(404).json({ message: 'No packing job found for this basket' });

        const mappedBasket = {
            orders: [{
                saleOrderNumber: job.orderId,
                items: job.Order.OrderItems.map(item => {
                    const packedQty = item.OrderAllocations
                        .filter(a => a.packed)
                        .reduce((sum, a) => sum + a.quantity, 0);

                    return {
                        sku: item.Product ? item.Product.productId.toString() : 'N/A',
                        orderedQty: item.quantityRequested,
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

export const scanBasketItem = async (req, res, next) => {
    try {
        const { sku } = req.body;
        const job = await PackingJob.findOne({
            where: { basketReference: req.params.basket },
            include: [{ model: Order, include: [{ model: OrderItem, include: [Product, OrderAllocation] }] }]
        });

        if (!job) return res.status(404).json({ message: 'No packing job found for this basket' });

        let allocationMatched = null;
        for (const item of job.Order.OrderItems) {
            if (item.Product && item.Product.productId.toString() === sku) {
                const alloc = item.OrderAllocations.find(a => a.picked && !a.packed);
                if (alloc) {
                    alloc.packed = true;
                    await alloc.save();

                    job.packedQuantity += alloc.quantity;
                    job.packStatus = 'in_progress';
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

export const completeBasketPacking = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const basket = req.params.basket;
        const job = await PackingJob.findOne({ where: { basketReference: basket, packStatus: 'pending' }, transaction });

        if (!job) {
            await transaction.rollback();
            return res.status(404).json({ message: 'No packing job found for this basket' });
        }

        const orderId = job.orderId;

        await OrderAllocation.update(
            { packed: true },
            {
                where: {
                    shopifyOrderNumber: orderId,
                    picked: true
                },
                transaction
            }
        );

        job.packStatus = 'completed';
        job.completeAt = new Date();
        job.packerId = req.user.id;
        await job.save({ transaction });

        await Order.update(
            { status: 'delivered' },
            { where: { shopifyOrderNumber: orderId }, transaction }
        );

        await transaction.commit();
        res.json({ message: 'Basket packing completed' });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};
