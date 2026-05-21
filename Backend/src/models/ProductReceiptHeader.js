import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const ProductReceiptHeader = sequelize.define('ProductReceiptHeader', {
    receiptId: {
        type: DataTypes.STRING(100), // e.g., GRN-2024-001
        primaryKey: true
    },
    shipmentNumber: {
        type: DataTypes.STRING(100), // Link to InboundShipment.js
        allowNull: false
    },
    vendorId: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    receivingDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'ProductReceiptHeaders',
    timestamps: false,
    indexes: [
        { name: 'idx_prh_shipment', fields: ['shipmentNumber'] },
        { name: 'idx_prh_vendor', fields: ['vendorId'] }
    ]
});

ProductReceiptHeader.associate = (models) => {
    ProductReceiptHeader.belongsTo(models.InboundShipment, { foreignKey: 'shipmentNumber' });
    ProductReceiptHeader.belongsTo(models.Supplier, { foreignKey: 'vendorId' });
    ProductReceiptHeader.hasMany(models.ProductReceiptTrans, { foreignKey: 'receiptId' });
};

export default ProductReceiptHeader;
