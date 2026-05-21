import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const InboundShipmentParking = sequelize.define('InboundShipmentParking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    shipmentNumber: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    shelfId: {
        // INTEGER FK -> ShelfLocations.id (the new auto-increment PK)
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    parkedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    parkedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    shipmentItemId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'InboundShipmentParking',
    timestamps: false,
    indexes: [
        { name: 'idx_isp_shipment', fields: ['shipmentNumber'] },
        { name: 'idx_isp_shelf', fields: ['shelfId'] },
        { name: 'idx_isp_warehouse', fields: ['warehouseId'] }
    ]
});

InboundShipmentParking.associate = (models) => {
    InboundShipmentParking.belongsTo(models.InboundShipment, { foreignKey: 'shipmentNumber' });
    InboundShipmentParking.belongsTo(models.ShelfLocation, { foreignKey: 'shelfId', targetKey: 'id' });
    InboundShipmentParking.belongsTo(models.User, { foreignKey: 'parkedBy' });
    InboundShipmentParking.belongsTo(models.Warehouse, { foreignKey: 'warehouseId' });
    InboundShipmentParking.belongsTo(models.InboundShipmentItem, { foreignKey: 'shipmentItemId' });
};

export default InboundShipmentParking;
