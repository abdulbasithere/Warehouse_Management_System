import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const InboundShipment = sequelize.define('InboundShipment', {
    warehouseId: {
        type: DataTypes.INTEGER,
    },
    invoiceQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true
    },
    supplierId: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    shipmentNumber: {
        type: DataTypes.STRING(100),
        primaryKey: true
    },
    arrivalDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isPlanned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    isBarcoded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    isQualityCheck: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    remark: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    emails: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    totalDeliveries: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('received', 'pending', 'in_transit', 'parked'),
        allowNull: false,
        defaultValue: 'pending'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'InboundShipments',
    timestamps: false,
    indexes: [
        { name: 'idx_is_warehouse', fields: ['warehouseId'] },
        { name: 'idx_is_supplier', fields: ['supplierId'] },
        { name: 'idx_is_status', fields: ['status'] },
        { name: 'idx_is_created', fields: ['createdAt'] }
    ]
});

InboundShipment.associate = (models) => {
    InboundShipment.belongsTo(models.Warehouse, { foreignKey: 'warehouseId' });
    // InboundShipment.belongsTo(models.Department, { foreignKey: 'departmentId' });
    InboundShipment.belongsTo(models.Supplier, { foreignKey: 'supplierId' });
    InboundShipment.hasMany(models.CrossDockPlan, { foreignKey: 'shipmentNumber' });
    InboundShipment.hasMany(models.InboundShipmentItem, { foreignKey: 'shipmentNumber' });
    InboundShipment.hasMany(models.InboundShipmentAttachment, { foreignKey: 'shipmentNumber' });
    InboundShipment.hasMany(models.InboundShipmentParking, { foreignKey: 'shipmentNumber' });
    InboundShipment.hasMany(models.InboundVehicleDetail, { foreignKey: 'shipmentNumber' });
};

export default InboundShipment;
