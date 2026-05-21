import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const InboundShipmentAttachment = sequelize.define('InboundShipmentAttachment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    shipmentNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    fileName: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
    timestamps: false,
    indexes: [
        { name: 'idx_isa_shipment', fields: ['shipmentNumber'] }
    ]
});

InboundShipmentAttachment.associate = (models) => {
    InboundShipmentAttachment.belongsTo(models.InboundShipment, { foreignKey: 'shipmentNumber' });
};

export default InboundShipmentAttachment;
