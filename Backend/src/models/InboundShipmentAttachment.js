const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const InboundShipmentAttachment = sequelize.define('InboundShipmentAttachment', {
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
    fileName: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    filePath: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    fileType: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'InboundShipmentAttachments',
    timestamps: false
});

InboundShipmentAttachment.associate = (models) => {
    InboundShipmentAttachment.belongsTo(models.InboundShipment, { foreignKey: 'inboundShipmentId' });
};

module.exports = InboundShipmentAttachment;
