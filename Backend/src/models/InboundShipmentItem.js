import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const InboundShipmentItem = sequelize.define('InboundShipmentItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    shipmentNumber: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    packageType: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    packageQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true
    },
    itemNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    purchaseOrderId: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    vehicleDetailId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Partial', 'Fully Parked'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    parkedQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'InboundShipmentItems',
    timestamps: false,
    indexes: [
        { name: 'idx_isi_shipment', fields: ['shipmentNumber'] },
        { name: 'idx_isi_po', fields: ['purchaseOrderId'] },
        { name: 'idx_isi_vehicle', fields: ['vehicleDetailId'] }
    ]
});

InboundShipmentItem.associate = (models) => {
    InboundShipmentItem.belongsTo(models.InboundShipment, { foreignKey: 'shipmentNumber' });
    InboundShipmentItem.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    InboundShipmentItem.belongsTo(models.InboundVehicleDetail, { foreignKey: 'vehicleDetailId' });
    InboundShipmentItem.hasMany(models.InboundShipmentParking, { foreignKey: 'shipmentItemId' });
    InboundShipmentItem.hasMany(models.InboundShipmentItemDetail, { foreignKey: 'shipmentItemId' });
};

export default InboundShipmentItem;
