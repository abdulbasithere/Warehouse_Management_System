import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const InboundVehicleDetail = sequelize.define('InboundVehicleDetail', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    shipmentNumber: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    vehicleNumber: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    driverName: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    driverContact: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    deliveryNumber: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    vehicleTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    timeIn: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    timeOut: {
        type: DataTypes.STRING(20),
        allowNull: true
    }
}, {
    tableName: 'InboundVehicleDetails',
    timestamps: true,
    indexes: [
        { name: 'idx_ivd_shipment', fields: ['shipmentNumber'] }
    ]
});

InboundVehicleDetail.associate = (models) => {
    InboundVehicleDetail.belongsTo(models.InboundShipment, { foreignKey: 'shipmentNumber' });
    InboundVehicleDetail.belongsTo(models.VehicleType, { foreignKey: 'vehicleTypeId' });
    InboundVehicleDetail.hasMany(models.InboundShipmentItem, { foreignKey: 'vehicleDetailId' });
};

export default InboundVehicleDetail;
