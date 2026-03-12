const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const OrderItem = sequelize.define('OrderItem', {
    ShopifyOrderNumber: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    OrderItemid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productid: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    QuantityRequested: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    QuantityAllocated: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'OrderItems',
    timestamps: false
});

OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'ShopifyOrderNumber' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'productid' });
    OrderItem.hasMany(models.OrderAllocation, { foreignKey: 'OrderItemid', sourceKey: 'OrderItemid' });
};

module.exports = OrderItem;