import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const PurchaseOrderLineItem = sequelize.define('PurchaseOrderLineItem', {
    lineItemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    purchaseOrderId: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    productVariantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    receiveQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0
    },
    unitPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'PurchaseOrderLineItems',
    timestamps: false,
    indexes: [
        { name: 'idx_poli_po', fields: ['purchaseOrderId'] },
        { name: 'idx_poli_variant', fields: ['productVariantId'] },
        { name: 'idx_poli_product', fields: ['productId'] }
    ]
});

PurchaseOrderLineItem.associate = (models) => {
    PurchaseOrderLineItem.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    PurchaseOrderLineItem.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId' });
    PurchaseOrderLineItem.belongsTo(models.Product, { foreignKey: 'productId' });
};

export default PurchaseOrderLineItem;
