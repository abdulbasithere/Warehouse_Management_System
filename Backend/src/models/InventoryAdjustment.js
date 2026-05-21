import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const InventoryAdjustment = sequelize.define('InventoryAdjustment', {
    adjustmentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    shelfId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    adjustmentQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    reason: {
        type: DataTypes.ENUM(
            'excess',
            'short',
            'other'
        ),
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    adjustedBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    adjustmentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'InventoryAdjustments',
    timestamps: false,
    indexes: [
        { name: 'idx_ia_product', fields: ['productId'] },
        { name: 'idx_ia_shelf', fields: ['shelfId'] },
        { name: 'idx_ia_date', fields: ['adjustmentDate'] },
        { name: 'idx_ia_warehouse', fields: ['warehouseId'] }
    ]
});

InventoryAdjustment.associate = (models) => {
    InventoryAdjustment.belongsTo(models.Product, { foreignKey: 'productId' });
    InventoryAdjustment.belongsTo(models.ShelfLocation, { foreignKey: 'shelfId' });
    InventoryAdjustment.belongsTo(models.User, { foreignKey: 'adjustedBy' });
    InventoryAdjustment.belongsTo(models.Warehouse, { foreignKey: 'warehouseId' });
};

export default InventoryAdjustment;
