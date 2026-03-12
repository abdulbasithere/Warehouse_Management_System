const { Order, OrderItem, Product, InventoryLocation, OrderAllocation } = require('../models/setupModels');
const { Op } = require('sequelize');
const sequelize = require('../utils/db');
const { createOrderItemWithReservation } = require('./orderLineController');

const getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10, search = '', status = '' } = req.query;
        const offset = (page - 1) * pageSize;

        const where = {};
        if (search) {
            where[Op.or] = [
                { ShopifyOrderNumber: { [Op.like]: `%${search}%` } },
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
            order: [['OrderDate', 'DESC']]
        });

        const mappedOrders = rows.map(order => ({
            saleOrderNumber: order.ShopifyOrderNumber,
            orderTotalAmount: parseFloat(order.OrderTotalAmount),
            totalUnitsCount: order.TotalUnitsCount,
            allocationStatus: order.AllocationStatus.toUpperCase(),
            orderDate: order.OrderDate,
            status: order.Status
        }));

        res.json({ data: mappedOrders, total: count });
    } catch (error) {
        next(error);
    }
};

const getOrderDetail = async (req, res, next) => {
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
            saleOrderNumber: order.ShopifyOrderNumber,
            orderTotalAmount: parseFloat(order.OrderTotalAmount),
            totalUnitsCount: order.TotalUnitsCount,
            allocationStatus: order.AllocationStatus.toUpperCase(),
            status: order.Status,
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
                id: item.OrderItemid,
                sku: item.Product ? item.Product.ProductId : 'N/A',
                name: item.Product ? item.Product.ProductName : 'Unknown',
                quantity: item.QuantityRequested,
                allocated: item.QuantityAllocated,
                price: item.Product ? item.Product.ProductPrice : 0,
                allocationStatus: item.QuantityAllocated >= item.QuantityRequested ? 'ALLOCATED' : 'PARTIAL'
            }))
        };

        res.json(mappedOrder);
    } catch (error) {
        next(error);
    }
};

const insertOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const ordersData = req.body; // Expecting an array of orders

        const results = [];

        for (const orderData of ordersData) {
            const {
                ShopifyOrderNumber,
                OrderTotalAmount,
                TotalUnitsCount,
                customerName,
                customerEmail,
                shippingAddress,
                items // Array of items
            } = orderData;

            // 1. Create or Find Order
            const [order, created] = await Order.findOrCreate({
                where: { ShopifyOrderNumber },
                defaults: {
                    OrderTotalAmount,
                    TotalUnitsCount,
                    customerName,
                    customerEmail,
                    shippingAddress,
                    AllocationStatus: 'available' // Default
                },
                transaction
            });

            if (!created) {
                // If order exists, you might want to skip or handle updates
                results.push({ ShopifyOrderNumber, status: 'skipped (already exists)' });
                continue;
            }

            let allItemsAllocated = true;
            let anyItemAllocated = false;

            // 2. Insert Items with Reservation
            for (const itemData of items) {
                const { productid, QuantityRequested } = itemData;
                const { fullyAllocated } = await createOrderItemWithReservation({
                    ShopifyOrderNumber,
                    productid,
                    QuantityRequested
                }, transaction);

                if (!fullyAllocated) allItemsAllocated = false;
                if (fullyAllocated || (itemData.QuantityAllocated > 0)) anyItemAllocated = true;
            }

            // 3. Update Order Allocation Status
            let finalStatus = 'not-available';
            if (allItemsAllocated) {
                finalStatus = 'available';
            } else if (anyItemAllocated) {
                finalStatus = 'partial-available';
            }

            order.AllocationStatus = finalStatus;
            await order.save({ transaction });

            results.push({ ShopifyOrderNumber, status: 'inserted', allocationStatus: finalStatus });
        }

        await transaction.commit();
        res.status(201).json({ message: 'Orders processed successfully', results });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const getOrderByNumber = async (req, res, next) => {
    try {
        const { orderNumber } = req.params;
        const order = await Order.findOne({
            where: { ShopifyOrderNumber: orderNumber },
            include: [{
                model: OrderItem,
                include: [Product]
            }]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const mappedOrder = {
            saleOrderNumber: order.ShopifyOrderNumber,
            orderTotalAmount: parseFloat(order.OrderTotalAmount),
            totalUnitsCount: order.TotalUnitsCount,
            allocationStatus: order.AllocationStatus.toUpperCase(),
            status: order.Status,
            customer: {
                name: order.customerName,
                email: order.customerEmail,
            },
            items: order.OrderItems.map(item => ({
                id: item.OrderItemid,
                sku: item.Product ? item.Product.ProductId : 'N/A',
                name: item.Product ? item.Product.ProductName : 'Unknown',
                quantity: item.QuantityRequested
            }))
        };

        res.json(mappedOrder);
    } catch (error) {
        next(error);
    }
};

const processReturn = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { orderNumber } = req.params;
        const order = await Order.findOne({
            where: { ShopifyOrderNumber: orderNumber },
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

        if (order.Status === 'returned') {
            await transaction.rollback();
            return res.status(400).json({ message: 'Order is already marked as returned' });
        }

        // Update Order Status
        order.Status = 'returned';
        await order.save({ transaction });

        // Create Putaway tasks for each item
        const putawayPromises = order.OrderItems.map(item => {
            return Putaway.create({
                ProductId: item.Product ? item.Product.ProductId : item.productid,
                TotalUnits: item.QuantityRequested,
                PutawayStatus: 'pending',
                PutawayQuantity: 0
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

module.exports = {
    getAllOrders,
    getOrderDetail,
    insertOrder,
    getOrderByNumber,
    processReturn
};
