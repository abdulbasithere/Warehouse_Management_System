const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const OrderAllocation = sequelize.define('OrderAllocation', {
    OrderAllocationId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ShopifyOrderNumber: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    OrderItemid: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ShelfId: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Picked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    Packed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    pickListId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'OrderAllocations',
    timestamps: false
});

OrderAllocation.associate = (models) => {
    OrderAllocation.belongsTo(models.Order, { foreignKey: 'ShopifyOrderNumber' });
    OrderAllocation.belongsTo(models.OrderItem, { foreignKey: 'OrderItemid', targetKey: 'OrderItemid' });
    OrderAllocation.belongsTo(models.ShelfLocation, { foreignKey: 'ShelfId' });
    OrderAllocation.belongsTo(models.Product, { foreignKey: 'ProductID' });
    OrderAllocation.belongsTo(models.PickList, { foreignKey: 'pickListId' });
};

module.exports = OrderAllocation;
