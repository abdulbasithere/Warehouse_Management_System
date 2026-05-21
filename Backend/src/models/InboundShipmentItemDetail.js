import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const InboundShipmentItemDetail = sequelize.define('InboundShipmentItemDetail', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    shipmentItemId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    shipmentNumber: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    purchaseOrderId: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    productId: {
        // DE-NORMALIZED: Fast product-level lookup aur dashboard queries ke liye
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productVariantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    expectedQuantity: {
        // Asal Ordered Qty (Strictly for finance/audit)
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
}, {
    tableName: 'InboundShipmentItemDetails',
    timestamps: false,
    indexes: [
        { name: 'idx_isid_shipment', fields: ['shipmentNumber'] },
        { name: 'idx_isid_po', fields: ['purchaseOrderId'] },
        { name: 'idx_isid_product', fields: ['productId'] }, 
        { name: 'idx_isid_variant', fields: ['productVariantId'] },
        { name: 'idx_isid_scan_lookup', fields: ['shipmentNumber', 'purchaseOrderId', 'productVariantId'] }
    ]
});

InboundShipmentItemDetail.associate = (models) => {
    InboundShipmentItemDetail.belongsTo(models.InboundShipmentItem, { foreignKey: 'shipmentItemId' });
    InboundShipmentItemDetail.belongsTo(models.Product, { foreignKey: 'productId' });
    InboundShipmentItemDetail.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId' });
    InboundShipmentItemDetail.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
};

export default InboundShipmentItemDetail;
