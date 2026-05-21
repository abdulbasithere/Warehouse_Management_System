import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const TransferOrder = sequelize.define('TransferOrder', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    transferNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    fromWarehouseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    toWarehouseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Created', 'Shipped', 'Received', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Created'
    },
    transferDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    shippedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    receivedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    remarks: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true
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
    tableName: 'TransferOrders',
    timestamps: true,
    indexes: [
        { name: 'idx_to_from_wh', fields: ['fromWarehouseId'] },
        { name: 'idx_to_to_wh', fields: ['toWarehouseId'] },
        { name: 'idx_to_status', fields: ['status'] },
        { name: 'idx_to_date', fields: ['transferDate'] },
        { name: 'idx_to_number', fields: ['transferNumber'] }
    ]
});

TransferOrder.associate = (models) => {
    TransferOrder.belongsTo(models.Warehouse, { as: 'FromWarehouse', foreignKey: 'fromWarehouseId' });
    TransferOrder.belongsTo(models.Warehouse, { as: 'ToWarehouse', foreignKey: 'toWarehouseId' });
    TransferOrder.belongsTo(models.User, { as: 'Creator', foreignKey: 'createdBy' });
    TransferOrder.hasMany(models.TransferOrderLine, { foreignKey: 'transferOrderId', as: 'Lines' });
};

export default TransferOrder;
