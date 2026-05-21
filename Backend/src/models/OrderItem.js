import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const OrderItem = sequelize.define('OrderItem', {
    shopifyOrderNumber: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    orderItemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantityRequested: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    quantityAllocated: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0
    }
}, {
    tableName: 'OrderItems',
    timestamps: false,
    indexes: [
        { name: 'idx_oi_product', fields: ['productId'] }
    ]
});

OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'shopifyOrderNumber' });
    OrderItem.belongsTo(models.Product, { foreignKey: 'productId' });
    OrderItem.hasMany(models.OrderAllocation, { foreignKey: 'orderItemId', sourceKey: 'orderItemId' });
};

export default OrderItem;
