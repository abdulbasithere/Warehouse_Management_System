import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const Product = sequelize.define('Product', {
    productId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    weight: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    trackBatch: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    trackSerial: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    trackExpiry: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    tableName: 'Products',
    timestamps: false,
    indexes: [
        { name: 'idx_products_name', fields: ['name'] },
        { name: 'idx_products_category', fields: ['category'] }
    ]
});

Product.associate = (models) => {
    Product.hasMany(models.ProductVariant, { foreignKey: 'productId' });
    Product.hasMany(models.ProductBarcode, { foreignKey: 'productId' });
};

export default Product;
