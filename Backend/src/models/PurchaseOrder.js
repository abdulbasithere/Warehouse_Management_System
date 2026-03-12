const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
    PurchaseOrderID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    SupplierID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Status: {
        type: DataTypes.ENUM('Pending', 'Received', 'Partial', 'Canceled'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    TotalProducts: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    TotalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    TotalUnits: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ReceivingWarehouseID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ExpectedDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    CreateDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    Tags: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    CrossDockFlag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'PurchaseOrders',
    timestamps: false
});

PurchaseOrder.associate = (models) => {
    PurchaseOrder.belongsTo(models.Supplier, { foreignKey: 'SupplierID' });
    PurchaseOrder.belongsTo(models.Warehouse, { foreignKey: 'ReceivingWarehouseID' });
    PurchaseOrder.hasMany(models.PurchaseOrderLineItem, { foreignKey: 'PurchaseOrderID' });
    // → later: hasMany Receiving, hasMany CrossDockWorkflow
};

module.exports = PurchaseOrder;