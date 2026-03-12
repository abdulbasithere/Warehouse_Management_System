const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Order = sequelize.define('Order', {
    ShopifyOrderNumber: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    OrderTotalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    TotalUnitsCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    AllocationStatus: {
        type: DataTypes.ENUM('AVAILABLE', 'PARTIAL-AVAILABLE', 'NOT-AVAILABLE'),
        defaultValue: 'AVAILABLE'
    },
    OrderDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    Status: {
        type: DataTypes.ENUM('new', 'picking', 'packing', 'delivered', 'returned'),
        defaultValue: 'new'
    },
    customerName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    customerEmail: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: { isEmail: true }
    },
    shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    trackingNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    awbUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: { isUrl: true }
    },
    BasketRefrence: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'Orders',
    timestamps: false
});

Order.associate = (models) => {
    Order.hasMany(models.OrderItem, { foreignKey: 'ShopifyOrderNumber' });
    Order.hasMany(models.PackingJob, { foreignKey: 'OrderId' });
};

module.exports = Order;