const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const ProductBarcode = sequelize.define('ProductBarcode', {
    VariantID: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Barcode: {
        type: DataTypes.STRING(80),
        allowNull: false
    },
    IsPrimary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    IsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'ProductBarcodes',
    timestamps: false
});

ProductBarcode.associate = (models) => {
    ProductBarcode.belongsTo(models.ProductVariant, {
        foreignKey: 'VariantID',
        onDelete: 'CASCADE'
    });
};

module.exports = ProductBarcode;