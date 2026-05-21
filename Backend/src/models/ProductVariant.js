import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const ProductVariant = sequelize.define('ProductVariant', {
    productVariantId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    variantId: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    color: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    size: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    uoMId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    variancePercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10.00
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'ProductVariants',
    timestamps: false,
    indexes: [
        {
            name: 'idx_productvariant_lookup',
            fields: ['variantId', 'color', 'size']
        },
        {
            name: 'idx_pv_product',
            fields: ['productId']
        }
    ]
});

ProductVariant.associate = (models) => {
    ProductVariant.belongsTo(models.Product, { foreignKey: 'productId' });
    ProductVariant.hasMany(models.InventoryLocation, { foreignKey: 'productVariantId' });
    ProductVariant.belongsTo(models.UnitsOfMeasure, { foreignKey: 'uoMId' });
    ProductVariant.hasMany(models.PurchaseOrderLineItem, { foreignKey: 'productVariantId' });
    ProductVariant.hasMany(models.ProductBarcode, { foreignKey: 'productVariantId' });
    ProductVariant.hasMany(models.CrossDockPlan, { foreignKey: 'productVariantId' });
    ProductVariant.hasMany(models.TransferOrderLine, { foreignKey: 'productVariantId' });
};

export default ProductVariant;
