import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const CrossDockPlan = sequelize.define('CrossDockPlan', {
    planId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    productVariantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    plannedQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    scannedQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('Pending', 'In_Progress', 'Completed', 'Scanned'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    supplierId: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    barcode: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    inventoryType: {
        type: DataTypes.ENUM('Normal', 'Damage', 'Refusal'),
        allowNull: false,
        defaultValue: 'Normal'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'CrossDockPlan',
    timestamps: true,
    indexes: [
        { name: 'idx_cdp_shipment', fields: ['shipmentNumber'] },
        { name: 'idx_cdp_po', fields: ['purchaseOrderId'] },
        { name: 'idx_cdp_variant', fields: ['productVariantId'] },
        { name: 'idx_cdp_warehouse', fields: ['warehouseId'] },
        { name: 'idx_cdp_status', fields: ['status'] },
        { name: 'idx_cdp_supplier', fields: ['supplierId'] },
        { name: 'idx_cdp_composite_lookup', fields: ['shipmentNumber', 'purchaseOrderId', 'warehouseId', 'productVariantId'] }
    ]
});

CrossDockPlan.associate = (models) => {
    CrossDockPlan.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    CrossDockPlan.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId' });
    CrossDockPlan.belongsTo(models.Warehouse, { foreignKey: 'warehouseId' });
    CrossDockPlan.belongsTo(models.Supplier, { foreignKey: 'supplierId' });
};

export default CrossDockPlan;
