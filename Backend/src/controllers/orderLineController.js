const { InventoryLocation, OrderAllocation, OrderItem } = require('../models/setupModels');
const { Op } = require('sequelize');
const sequelize = require('../utils/db');

const createOrderItemWithReservation = async (orderItemData, transaction) => {
    const { ShopifyOrderNumber, productid, QuantityRequested } = orderItemData;

    // 1. Create OrderItem record
    const orderItem = await OrderItem.create({
        ShopifyOrderNumber,
        productid,
        QuantityRequested,
        QuantityAllocated: 0
    }, { transaction });

    // 2. Find available inventory (FIFO: oldest received first)
    const inventory = await InventoryLocation.findAll({
        where: {
            ProductID: productid,
            QuantityAvailable: { [Op.gt]: sequelize.col('QuantityReserved') }
        },
        order: [['RecievedAt', 'ASC']],
        transaction
    });

    let remaining = QuantityRequested;
    let totalAllocated = 0;

    for (const loc of inventory) {
        if (remaining <= 0) break;

        const avail = loc.QuantityAvailable - loc.QuantityReserved;
        const allocate = Math.min(remaining, avail);

        if (allocate > 0) {
            // Reserve in inventory
            loc.QuantityReserved += allocate;
            await loc.save({ transaction });

            // Create allocation record
            await OrderAllocation.create({
                ShopifyOrderNumber,
                OrderItemid: orderItem.OrderItemid,
                ShelfId: loc.ShelfID,
                ProductID: productid,
                Quantity: allocate,
                Picked: false,
                Packed: false
            }, { transaction });

            totalAllocated += allocate;
            remaining -= allocate;
        }
    }

    // 3. Update OrderItem
    orderItem.QuantityAllocated = totalAllocated;
    await orderItem.save({ transaction });

    return {
        orderItem,
        fullyAllocated: totalAllocated === QuantityRequested
    };
};
module.exports = {
    createOrderItemWithReservation
};
