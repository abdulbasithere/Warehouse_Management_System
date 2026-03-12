// models/InventoryAdjustment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const InventoryAdjustment = sequelize.define('InventoryAdjustment', {
    AdjustmentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ShelfID: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    AdjustmentQuantity: {           // Can be negative (most common for shortages) or positive
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Reason: {
        type: DataTypes.ENUM(
            'excess',             // physical < system
            'short',              // physical > system
            'other'
        ),
        allowNull: false
    },
    Notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    AdjustedBy: {                   // User ID who performed/approved the adjustment
        type: DataTypes.INTEGER,
        allowNull: false
    },
    AdjustmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'InventoryAdjustments',
    timestamps: false
});

InventoryAdjustment.associate = (models) => {
    InventoryAdjustment.belongsTo(models.Product, { foreignKey: 'ProductID' });
    InventoryAdjustment.belongsTo(models.ShelfLocation, { foreignKey: 'ShelfID' });
    InventoryAdjustment.belongsTo(models.User, { foreignKey: 'AdjustedBy' });
};

module.exports = InventoryAdjustment;