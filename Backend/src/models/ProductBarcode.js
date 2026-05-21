import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const ProductBarcode = sequelize.define('ProductBarcode', {
    productVariantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    barcode: {
        type: DataTypes.STRING(80),
        primaryKey: true,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'ProductBarcodes',
    timestamps: false,
    indexes: [
        { name: 'idx_pb_variant', fields: ['productVariantId'] },
        { name: 'idx_pb_barcode', fields: ['barcode'], unique: true }
    ]
});

ProductBarcode.associate = (models) => {
    ProductBarcode.belongsTo(models.ProductVariant, {
        foreignKey: 'productVariantId',
        onDelete: 'CASCADE'
    });
    ProductBarcode.belongsTo(models.Product, {
        foreignKey: 'productId'
    });
};

export default ProductBarcode;
