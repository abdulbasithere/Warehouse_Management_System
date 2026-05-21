import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const Order = sequelize.define('Order', {
    shopifyOrderNumber: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    orderTotalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    totalUnitsCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    allocationStatus: {
        type: DataTypes.ENUM('AVAILABLE', 'PARTIAL-AVAILABLE', 'NOT-AVAILABLE'),
        defaultValue: 'AVAILABLE'
    },
    orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
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
    basketReference: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'Orders',
    timestamps: false,
    indexes: [
        { name: 'idx_orders_status', fields: ['status'] },
        { name: 'idx_orders_allocation', fields: ['allocationStatus'] },
        { name: 'idx_orders_date', fields: ['orderDate'] },
        { name: 'idx_orders_basket', fields: ['basketReference'] }
    ]
});

Order.associate = (models) => {
    Order.hasMany(models.OrderItem, { foreignKey: 'shopifyOrderNumber' });
    Order.hasMany(models.PackingJob, { foreignKey: 'orderId' });
};

export default Order;
