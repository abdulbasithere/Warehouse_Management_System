import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const Putaway = sequelize.define('Putaway', {
    putawayId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    totalUnits: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    putawayStatus: {
        type: DataTypes.ENUM('pending', 'completed', 'in-progress'),
        defaultValue: 'pending'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    putawayQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    referenceId: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    referenceType: {
        type: DataTypes.ENUM('PurchaseOrder', 'TransferOrder', 'CustomerReturn', 'StockAdjustment', 'InboundShipment'),
        allowNull: false
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'Putaway',
    timestamps: false,
    indexes: [
        { name: 'idx_putaway_product', fields: ['productId'] },
        { name: 'idx_putaway_status', fields: ['putawayStatus'] },
        { name: 'idx_putaway_ref', fields: ['referenceId', 'referenceType'] },
        { name: 'idx_putaway_created', fields: ['createdAt'] },
        { name: 'idx_putaway_warehouse', fields: ['warehouseId'] }
    ]
});

Putaway.associate = (models) => {
    Putaway.belongsTo(models.Product, { foreignKey: 'productId' });
    Putaway.belongsTo(models.Warehouse, { foreignKey: 'warehouseId' });
};

export default Putaway;
