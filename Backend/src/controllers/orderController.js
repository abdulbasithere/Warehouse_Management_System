import { Order, OrderItem, Product, InventoryLocation, OrderAllocation, Putaway } from '../models/setupModels.js';
import { Op } from 'sequelize';
import sequelize from '../utils/db.js';
import { createOrderItemWithReservation } from './orderLineController.js';

export const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 25, search = '', status = '' } = req.query;
        const offset = (page - 1) * pageSize;

        const where = {};
        if (search) {
            where[Op.or] = [
                { shopifyOrderNumber: { [Op.like]: `%${search}%` } },
                { customerName: { [Op.like]: `%${search}%` } }
            ];
        }
        if (status && status !== 'ALL') {
            where.allocationStatus = status.toLowerCase();
        }

        const { count, rows } = await Order.findAndCountAll({
            where,
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['orderDate', 'DESC']]
        });

        const mappedOrders = rows.map(order => ({
            saleOrderNumber: order.shopifyOrderNumber,
            orderTotalAmount: parseFloat(order.orderTotalAmount),
            totalUnitsCount: order.totalUnitsCount,
            allocationStatus: order.allocationStatus.toUpperCase(),
            orderDate: order.orderDate,
            status: order.status
        }));

        res.json({ data: mappedOrders, total: count });
    } catch (error) {
        next(error);
    }
};

export const getOrderDetail = async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const mappedOrder = {
            saleOrderNumber: order.shopifyOrderNumber,
            orderTotalAmount: parseFloat(order.orderTotalAmount),
            totalUnitsCount: order.totalUnitsCount,
            allocationStatus: order.allocationStatus.toUpperCase(),
            status: order.status,
            trackingNumber: order.trackingNumber,
            awbUrl: order.awbUrl,
            customer: {
                name: order.customerName,
                email: order.customerEmail,
            },
            shippingAddress: {
                street: order.shippingAddress,
            },
            items: order.OrderItems.map(item => ({
                id: item.orderItemId,
                sku: item.Product ? item.Product.productId : 'N/A',
                name: item.Product ? item.Product.name : 'Unknown',
                quantity: item.quantityRequested,
                allocated: item.quantityAllocated,
                price: item.Product ? item.Product.productPrice : 0,
                allocationStatus: item.quantityAllocated >= item.quantityRequested ? 'ALLOCATED' : 'PARTIAL'
            }))
        };

        res.json(mappedOrder);
    } catch (error) {
        next(error);
    }
};

export const insertOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const ordersData = req.body;

        const results = [];

        for (const orderData of ordersData) {
            const {
                shopifyOrderNumber,
                orderTotalAmount,
                totalUnitsCount,
                customerName,
                customerEmail,
                shippingAddress,
                items
            } = orderData;

            const [order, created] = await Order.findOrCreate({
                where: { shopifyOrderNumber },
                defaults: {
                    orderTotalAmount,
                    totalUnitsCount,
                    customerName,
                    customerEmail,
                    shippingAddress,
                    allocationStatus: 'available'
                },
                transaction
            });

            if (!created) {
                results.push({ shopifyOrderNumber, status: 'skipped (already exists)' });
                continue;
            }

            let allItemsAllocated = true;
            let anyItemAllocated = false;

            for (const itemData of items) {
                const { productId, quantityRequested } = itemData;
                const { fullyAllocated } = await createOrderItemWithReservation({
                    shopifyOrderNumber,
                    productId,
                    quantityRequested
                }, transaction);

                if (!fullyAllocated) allItemsAllocated = false;
                if (fullyAllocated || (itemData.quantityAllocated > 0)) anyItemAllocated = true;
            }

            let finalStatus = 'not-available';
            if (allItemsAllocated) {
                finalStatus = 'available';
            } else if (anyItemAllocated) {
                finalStatus = 'partial-available';
            }

            order.allocationStatus = finalStatus;
            await order.save({ transaction });

            results.push({ shopifyOrderNumber, status: 'inserted', allocationStatus: finalStatus });
        }

        await transaction.commit();
        res.status(201).json({ message: 'Orders processed successfully', results });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

export const getOrderByNumber = async (req, res, next) => {
    try {
        const { orderNumber } = req.params;
        const order = await Order.findOne({
            where: { shopifyOrderNumber: orderNumber },
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const mappedOrder = {
            saleOrderNumber: order.shopifyOrderNumber,
            orderTotalAmount: parseFloat(order.orderTotalAmount),
            totalUnitsCount: order.totalUnitsCount,
            allocationStatus: order.allocationStatus.toUpperCase(),
            status: order.status,
            customer: {
                name: order.customerName,
                email: order.customerEmail,
            },
            items: order.OrderItems.map(item => ({
                id: item.orderItemId,
                sku: item.Product ? item.Product.productId : 'N/A',
                name: item.Product ? item.Product.name : 'Unknown',
                quantity: item.quantityRequested
            }))
        };

        res.json(mappedOrder);
    } catch (error) {
        next(error);
    }
};

export const processReturn = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { orderNumber } = req.params;
        const order = await Order.findOne({
            where: { shopifyOrderNumber: orderNumber },
            include: [{
                model: OrderItem,
                include: [Product]
            }],
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'returned') {
            await transaction.rollback();
            return res.status(400).json({ message: 'Order is already marked as returned' });
        }

        order.status = 'returned';
        await order.save({ transaction });

        const putawayPromises = order.OrderItems.map(item => {
            return Putaway.create({
                productId: item.Product ? item.Product.productId : item.productId,
                totalUnits: item.quantityRequested,
                putawayStatus: 'pending',
                putawayQuantity: 0
            }, { transaction });
        });

        await Promise.all(putawayPromises);

        await transaction.commit();
        res.json({ message: 'Return processed successfully and putaway tasks created' });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};
