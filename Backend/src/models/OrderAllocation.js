import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const OrderAllocation = sequelize.define('OrderAllocation', {
    orderAllocationId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    shopifyOrderNumber: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    orderItemId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    shelfId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    picked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    packed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    pickListId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'OrderAllocations',
    timestamps: false,
    indexes: [
        { name: 'idx_oa_order', fields: ['shopifyOrderNumber'] },
        { name: 'idx_oa_picklist', fields: ['pickListId'] },
        { name: 'idx_oa_product', fields: ['productId'] },
        { name: 'idx_oa_shelf', fields: ['shelfId'] },
        { name: 'idx_oa_status', fields: ['picked', 'packed'] },
        { name: 'idx_oa_warehouse', fields: ['warehouseId'] }
    ]
});

OrderAllocation.associate = (models) => {
    OrderAllocation.belongsTo(models.Order, { foreignKey: 'shopifyOrderNumber' });
    OrderAllocation.belongsTo(models.OrderItem, { foreignKey: 'orderItemId', targetKey: 'orderItemId' });
    OrderAllocation.belongsTo(models.ShelfLocation, { foreignKey: 'shelfId' });
    OrderAllocation.belongsTo(models.Product, { foreignKey: 'productId' });
    OrderAllocation.belongsTo(models.PickList, { foreignKey: 'pickListId' });
    OrderAllocation.belongsTo(models.Warehouse, { foreignKey: 'warehouseId' });
};

export default OrderAllocation;
