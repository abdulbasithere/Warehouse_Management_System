const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const InboundShipmentItem = sequelize.define('InboundShipmentItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    inboundShipmentId: {
        type: DataTypes.INTEGER,
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
    InboundShipmentItem.belongsTo(models.InboundShipment, { foreignKey: 'inboundShipmentId' });
    InboundShipmentItem.belongsTo(models.ShelfLocation, { foreignKey: 'locationId' });
};

module.exports = InboundShipmentItem;
