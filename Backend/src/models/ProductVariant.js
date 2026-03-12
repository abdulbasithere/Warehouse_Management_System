const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const ProductVariant = sequelize.define('ProductVariant', {
    VariantID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    SKU: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    Color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Size: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    TrackBatch: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    TrackSerial: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    TrackExpiry: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    UpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'ProductVariants',
    timestamps: false
});

ProductVariant.associate = (models) => {
    ProductVariant.belongsTo(models.Product, { foreignKey: 'ProductID' });
    ProductVariant.hasMany(models.InventoryLocation, { foreignKey: 'VariantID' });
    ProductVariant.hasMany(models.UnitsOfMeasure, { foreignKey: 'VariantID' });
    ProductVariant.hasMany(models.PurchaseOrderLineItem, { foreignKey: 'VariantID' });
    // → later: OrderItem, Putaway, etc. can point here instead of old ProductId
};

module.exports = ProductVariant;