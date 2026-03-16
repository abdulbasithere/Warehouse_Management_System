const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const PurchaseOrderLineItem = sequelize.define('PurchaseOrderLineItem', {
    LineItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    PurchaseOrderID: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    VariantID: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    QuantityReceived: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0
    },
    QuantityScanned: {              // ← Quantity confirmed via scanning (optional intermediate step)
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0
    },
    Status: {                       // ← Line-item receiving status
        type: DataTypes.ENUM('Open', 'Partial', 'Received', 'OverReceived', 'Canceled'),
        allowNull: false,
        defaultValue: 'Open'
    },
    UnitPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    Subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    UoMID: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'PurchaseOrderLineItems',
    timestamps: false
});

PurchaseOrderLineItem.associate = (models) => {
    PurchaseOrderLineItem.belongsTo(models.PurchaseOrder, { foreignKey: 'PurchaseOrderID' });
    PurchaseOrderLineItem.belongsTo(models.ProductVariant, { foreignKey: 'VariantID' });
    PurchaseOrderLineItem.belongsTo(models.UnitsOfMeasure, { foreignKey: 'UoMID' });
};

module.exports = PurchaseOrderLineItem;