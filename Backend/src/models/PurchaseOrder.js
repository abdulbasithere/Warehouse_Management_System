import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const PurchaseOrder = sequelize.define('PurchaseOrder', {
    purchaseOrderId: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false
    },
    supplierId: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In Process', 'Received', 'Canceled', 'Open Order'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    totalProducts: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    purchaseOrderQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    supplierBillQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true
    },
    supplierBillNumber: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    receivingWarehouseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expectedDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    arrivalDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    tags: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    crossDockFlag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    inboundShipment: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
}, {
    tableName: 'PurchaseOrders',
    timestamps: false,
    indexes: [
        { name: 'idx_po_supplier', fields: ['supplierId'] },
        { name: 'idx_po_status', fields: ['status'] },
        { name: 'idx_po_warehouse', fields: ['receivingWarehouseId'] },
        { name: 'idx_po_created', fields: ['createdAt'] },
        { name: 'idx_po_crossdock', fields: ['crossDockFlag'] },
        { name: 'idx_po_inbound', fields: ['inboundShipment'] }
    ]
});

PurchaseOrder.associate = (models) => {
    PurchaseOrder.belongsTo(models.InboundShipment, {
        foreignKey: 'inboundShipment',  // PurchaseOrders ka column
        targetKey: 'shipmentNumber'      // InboundShipments ka PK
    });
    PurchaseOrder.belongsTo(models.Supplier, { foreignKey: 'supplierId' });
    PurchaseOrder.belongsTo(models.Warehouse, { foreignKey: 'receivingWarehouseId' });
    PurchaseOrder.hasMany(models.PurchaseOrderLineItem, { foreignKey: 'purchaseOrderId' });
    PurchaseOrder.hasMany(models.PurchaseOrderActivity, { foreignKey: 'purchaseOrderId' });
    PurchaseOrder.hasMany(models.InboundShipmentItem, { foreignKey: 'purchaseOrderId' });
    PurchaseOrder.hasOne(models.PoTracker, { foreignKey: 'purchaseOrderId' });
};


export default PurchaseOrder;
