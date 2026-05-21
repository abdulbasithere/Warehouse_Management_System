import { PickList, OrderAllocation, Product, ShelfLocation, User, Order, PackingJob } from '../models/setupModels.js';
import { Op } from 'sequelize';
import sequelize from '../utils/db.js';

export const getAllPickLists = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 25 } = req.query;
        const offset = (page - 1) * pageSize;

        const where = {
            pickStatus: 'open'
        };
        if (req.user.role === 'picker') {
            where.assignPickerId = req.user.id;
        }

        const { count, rows } = await PickList.findAndCountAll({
            where,
            include: [{ model: OrderAllocation }],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const mappedPicklists = rows.map(pl => {
            const pickedQty = pl.OrderAllocations
                ? pl.OrderAllocations.reduce((sum, a) => sum + (a.picked ? a.quantity : 0), 0)
                : 0;

            return {
                id: pl.pickListId,
                pickingListNumber: `PL-${pl.pickListId.toString().padStart(4, '0')}`,
                status: pl.pickStatus.toUpperCase(),
                pickedQuantity: pickedQty,
                totalQuantity: pl.totalQuantity,
                totalOrders: pl.totalOrder
            };
        });

        res.json({ data: mappedPicklists, total: count });
    } catch (error) {
        next(error);
    }
};

export const getPickListDetail = async (req, res, next) => {
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

        if (req.user.role === 'picker' && pl.assignPickerId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to view this picklist' });
        }

        const mappedDetail = {
            pickList: {
                id: pl.pickListId,
                pickingListNumber: `PL-${pl.pickListId.toString().padStart(4, '0')}`,
                status: pl.pickStatus.toUpperCase(),
                pickedQuantity: pl.pickQuantity || 0,
                totalQuantity: pl.totalQuantity,
                totalOrders: pl.totalOrder
            },
            items: pl.OrderAllocations.map(item => ({
                id: item.orderAllocationId,
                sku: item.Product ? item.Product.productId.toString() : 'N/A',
                itemName: item.Product ? item.Product.name : 'Unknown',
                requiredQty: item.quantity,
                pickedQty: item.picked ? item.quantity : 0,
                shelfLocation: item.ShelfLocation ? `${item.ShelfLocation.aisle}-${item.ShelfLocation.shelfLevel}-${item.ShelfLocation.basket}` : 'N/A',
                aisle: item.ShelfLocation ? item.ShelfLocation.aisle : '',
                shelfLevel: item.ShelfLocation ? item.ShelfLocation.shelfLevel : '',
                orderNumber: item.shopifyOrderNumber,
                basketReference: item.Order ? item.Order.basketReference : null
            }))
        };

        res.json(mappedDetail);
    } catch (error) {
        next(error);
    }
};

export const createPickList = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { ids, assignedPickerId } = req.body;

        const allocations = await OrderAllocation.findAll({
            where: {
                shopifyOrderNumber: ids,
                pickListId: null
            },
            transaction
        });

        if (allocations.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'No unassigned items found for these orders' });
        }

        const totalQty = allocations.reduce((sum, item) => sum + item.quantity, 0);

        const newPL = await PickList.create({
            pickStatus: 'open',
            totalQuantity: totalQty,
            totalOrder: ids.length,
            assignPickerId: assignedPickerId
        }, { transaction });

        await OrderAllocation.update(
            { pickListId: newPL.pickListId },
            {
                where: { orderAllocationId: allocations.map(a => a.orderAllocationId) },
                transaction
            }
        );

        await Order.update(
            { status: 'picking' },
            {
                where: { shopifyOrderNumber: ids },
                transaction
            }
        );
        await transaction.commit();
        res.status(201).json({ id: newPL.pickListId });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export const assignBasket = async (req, res, next) => {
    try {
        const { basket, orderNumber } = req.body;
        const pl = await PickList.findByPk(req.params.id);
        if (!pl) return res.status(404).json({ message: 'PickList not found' });

        if (orderNumber) {
            await Order.update(
                { basketReference: basket },
                { where: { shopifyOrderNumber: orderNumber } }
            );
        }

        pl.pickStatus = 'in_progress';
        await pl.save();

        res.json({ message: 'Basket assigned' });
    } catch (error) {
        next(error);
    }
};

export const scanPickItem = async (req, res, next) => {
    try {
        const { sku } = req.body;
        const pl = await PickList.findByPk(req.params.id, {
            include: [{ model: OrderAllocation, include: [Product] }]
        });

        if (!pl) return res.status(404).json({ message: 'PickList not found' });

        const item = pl.OrderAllocations.find(i => i.Product && i.Product.productId.toString() === sku && !i.picked);
        if (!item) return res.status(400).json({ message: 'Item not found in picklist or already picked' });

        item.picked = true;
        await item.save();

        const currentPicked = pl.OrderAllocations.filter(a => a.picked).reduce((sum, a) => sum + a.quantity, 0);
        if (currentPicked >= pl.totalQuantity) {
            pl.pickStatus = 'completed';
            pl.completedAt = new Date();
        }
        await pl.save();

        res.json({ message: 'Item picked' });
    } catch (error) {
        next(error);
    }
};

export const finalizePickList = async (req, res, next) => {
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

        if (pl.pickStatus === 'completed') {
            await transaction.rollback();
            return res.status(400).json({ message: 'PickList is already completed' });
        }

        pl.pickStatus = 'completed';
        pl.completedAt = new Date();
        await pl.save({ transaction });

        await OrderAllocation.update(
            { picked: true },
            { where: { pickListId: id }, transaction }
        );

        const allocations = await OrderAllocation.findAll({
            where: { pickListId: id },
            include: [Order],
            transaction
        });

        const ordersInPicklist = [...new Set(allocations.map(a => a.shopifyOrderNumber))];

        for (const orderNumber of ordersInPicklist) {
            const orderAllocations = allocations.filter(a => a.shopifyOrderNumber === orderNumber);
            const totalQty = orderAllocations.reduce((sum, a) => sum + a.quantity, 0);

            const orderBasket = orderAllocations[0].Order ? orderAllocations[0].Order.basketReference : null;

            if (!orderBasket) {
                continue;
            }

            const existingJob = await PackingJob.findOne({
                where: { orderId: orderNumber, basketReference: orderBasket },
                transaction
            });

            if (!existingJob) {
                await PackingJob.create({
                    orderId: orderNumber,
                    packStatus: 'pending',
                    packedQuantity: 0,
                    totalQuantity: totalQty,
                    basketReference: orderBasket,
                    createdAt: new Date()
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
