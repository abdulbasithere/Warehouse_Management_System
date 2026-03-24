const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const InboundShipmentItem = sequelize.define('InboundShipmentItem', {
    shipmentNumber: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    packageType: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    packageQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    locationId: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'InboundShipmentItems',
    timestamps: false
});

InboundShipmentItem.associate = (models) => {
    InboundShipmentItem.belongsTo(models.InboundShipment, { foreignKey: 'shipmentNumber' });
    InboundShipmentItem.belongsTo(models.ShelfLocation, { foreignKey: 'locationId' });
};

module.exports = InboundShipmentItem;
