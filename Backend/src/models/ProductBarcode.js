const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const ProductBarcode = sequelize.define('ProductBarcode', {
    VariantID: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Barcode: {
        type: DataTypes.STRING(80),
        allowNull: false
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
        foreignKey: ['ProductID', 'VariantID'],
        onDelete: 'CASCADE'
    });
};

module.exports = ProductBarcode;