import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const Warehouse = sequelize.define('Warehouse', {
    warehouseId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    warehouseName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    zip: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    longitude: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    latitude: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Warehouses',
    timestamps: false
});

Warehouse.associate = (models) => {
    Warehouse.hasMany(models.InventoryLocation, { foreignKey: 'warehouseId' });
    Warehouse.hasMany(models.PurchaseOrder, { foreignKey: 'receivingWarehouseId' });
    Warehouse.hasMany(models.ShelfLocation, { foreignKey: 'warehouseId' });
    Warehouse.hasMany(models.TransferOrder, { as: 'OutgoingTransfers', foreignKey: 'fromWarehouseId' });
    Warehouse.hasMany(models.TransferOrder, { as: 'IncomingTransfers', foreignKey: 'toWarehouseId' });
};

export default Warehouse;
