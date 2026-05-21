import { InventoryLocation, OrderAllocation, OrderItem, ShelfLocation } from '../models/setupModels.js';
import { Op } from 'sequelize';
import sequelize from '../utils/db.js';

export const createOrderItemWithReservation = async (orderItemData, transaction) => {
    const { shopifyOrderNumber, productId, quantityRequested } = orderItemData;

    const orderItem = await OrderItem.create({
        shopifyOrderNumber,
        productId,
        quantityRequested,
        quantityAllocated: 0
    }, { transaction });

    const inventory = await InventoryLocation.findAll({
        where: {
            productId: productId,
            quantityAvailable: { [Op.gt]: sequelize.col('quantityReserved') }
        },
        include: [{ model: ShelfLocation, attributes: ['warehouseId'] }],
        order: [['receivedAt', 'ASC']],
        transaction
    });

    let remaining = quantityRequested;
    let totalAllocated = 0;

    for (const loc of inventory) {
        if (remaining <= 0) break;

        const avail = loc.quantityAvailable - loc.quantityReserved;
        const allocate = Math.min(remaining, avail);

        if (allocate > 0) {
            loc.quantityReserved += allocate;
            await loc.save({ transaction });

            await OrderAllocation.create({
                shopifyOrderNumber,
                orderItemId: orderItem.orderItemId,
                shelfId: loc.shelfId,
                productId: productId,
                quantity: allocate,
                picked: false,
                packed: false,
                warehouseId: loc.ShelfLocation ? loc.ShelfLocation.warehouseId : null
            }, { transaction });

            totalAllocated += allocate;
            remaining -= allocate;
        }
    }

    orderItem.quantityAllocated = totalAllocated;
    await orderItem.save({ transaction });

    return {
        orderItem,
        fullyAllocated: totalAllocated === quantityRequested
    };
};
