const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const InboundShipment = sequelize.define('InboundShipment', {
    warehouseId: {
        type: DataTypes.INTEGER,
    },
    purchaseOrderId: {
        type: DataTypes.STRING(100),
    },
    invoiceQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    shipmentNumber: {
        type: DataTypes.STRING(100),
        primaryKey: true
    },
    vehicleNumber: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    contactNumber: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    driverName: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    poQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    arrivalDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    timeIn: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    timeOut: {
        type: DataTypes.STRING(20),
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
    remark: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    emails: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('received', 'pending', 'in_transit', 'draft'),
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
    timestamps: false
});

InboundShipment.associate = (models) => {
    InboundShipment.belongsTo(models.Warehouse, { foreignKey: 'warehouseId' });
    InboundShipment.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    InboundShipment.hasMany(models.InboundShipmentItem, { foreignKey: 'inboundShipmentId' });
    InboundShipment.hasMany(models.InboundShipmentAttachment, { foreignKey: 'inboundShipmentId' });
};

module.exports = InboundShipment;
