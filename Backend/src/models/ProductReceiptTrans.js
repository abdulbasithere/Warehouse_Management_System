import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const ProductReceiptTrans = sequelize.define('ProductReceiptTrans', {
    receiptLineId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    receiptId: {
        type: DataTypes.STRING(100), // Link to Header
        allowNull: false
    },
    purchaseOrderId: {
        type: DataTypes.STRING(100), // Traceability for Vendor
        allowNull: false
    },
    productVariantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantityReceived: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Accepted', 'Refused'),
        allowNull: false
    }
}, {
    tableName: 'ProductReceiptTrans',
    timestamps: false,
    indexes: [
        { name: 'idx_prt_receipt', fields: ['receiptId'] },
        { name: 'idx_prt_po', fields: ['purchaseOrderId'] },
        { name: 'idx_prt_variant', fields: ['productVariantId'] }
    ]
});

ProductReceiptTrans.associate = (models) => {
    ProductReceiptTrans.belongsTo(models.ProductReceiptHeader, { foreignKey: 'receiptId' });
    ProductReceiptTrans.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    ProductReceiptTrans.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId' });
};

export default ProductReceiptTrans;
