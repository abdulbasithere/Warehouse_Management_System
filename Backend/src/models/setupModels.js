// src/models/setupModels.js  or index.js
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const PickList = require('./PickList');
const PackingJob = require('./PackingJob');
const Putaway = require('./Putaway');
const ShelfLocation = require('./ShelfLocation');
const InventoryLocation = require('./InventoryLocation');
const OrderAllocation = require('./OrderAllocation');
const InventoryAdjustment = require('./InventoryAdjustment');

const Warehouse = require('./Warehouse');
const ProductVariant = require('./ProductVariant');
const UnitsOfMeasure = require('./UnitsOfMeasure');
const Supplier = require('./Supplier');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderLineItem = require('./PurchaseOrderLineItem');
const ProductBarcode = require('./ProductBarcode');


const models = {
    User,
    Product,
    Warehouse,
    ProductVariant,
    UnitsOfMeasure,
    Supplier,
    PurchaseOrder,
    PurchaseOrderLineItem,
    Order,
    OrderItem,
    PickList,
    PackingJob,
    Putaway,
    ShelfLocation,
    InventoryLocation,
    OrderAllocation,
    InventoryAdjustment,
    ProductBarcode
};


// Run associations
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

module.exports = models;