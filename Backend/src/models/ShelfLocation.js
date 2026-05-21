import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const ShelfLocation = sequelize.define('ShelfLocation', {
    // Auto-increment integer PK — allows same shelfId name across multiple warehouses
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    shelfId: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    currentOccupancy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    aisle: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    shelfLevel: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    basket: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'ShelfLocations',
    timestamps: false,
    indexes: [
        // Composite unique — same shelfId code can exist in different warehouses
        { name: 'idx_shelf_warehouse_unique', unique: true, fields: ['warehouseId', 'shelfId'] },
        { name: 'idx_shelf_warehouse', fields: ['warehouseId'] }
    ]
});

ShelfLocation.associate = (models) => {
    ShelfLocation.hasMany(models.InventoryLocation, { foreignKey: 'shelfId' });
    ShelfLocation.belongsTo(models.Warehouse, { foreignKey: 'warehouseId' });
};

export default ShelfLocation;
