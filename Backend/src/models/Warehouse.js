const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Warehouse = sequelize.define('Warehouse', {
    WarehouseID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    CompanyName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    City: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        allowNull: false,
        defaultValue: 'Active'
    },
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Warehouses',
    timestamps: false
});

Warehouse.associate = (models) => {
    Warehouse.hasMany(models.InventoryLocation, { foreignKey: 'WarehouseID' });
    Warehouse.hasMany(models.PurchaseOrder, { foreignKey: 'ReceivingWarehouseID' });
    Warehouse.hasMany(models.ShelfLocation, { foreignKey: 'WarehouseId' });
};

module.exports = Warehouse;