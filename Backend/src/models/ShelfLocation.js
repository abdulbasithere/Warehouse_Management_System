const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const ShelfLocation = sequelize.define('ShelfLocation', {
    ShelfId: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false
    },
    CurrentOccupancy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    Aisle: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    ShelfLevel: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    Basket: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'ShelfLocations',
    timestamps: false
});

ShelfLocation.associate = (models) => {
    ShelfLocation.hasMany(models.InventoryLocation, { foreignKey: 'ShelfID' });
};

module.exports = ShelfLocation;