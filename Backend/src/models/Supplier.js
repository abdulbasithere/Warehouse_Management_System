const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Supplier = sequelize.define('Supplier', {
    SupplierID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    Name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    ShortName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    City: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Phone: {
        type: DataTypes.STRING(20),
        allowNull: true
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
    tableName: 'Suppliers',
    timestamps: false
});

Supplier.associate = (models) => {
    Supplier.hasMany(models.PurchaseOrder, { foreignKey: 'SupplierID' });
};

module.exports = Supplier;