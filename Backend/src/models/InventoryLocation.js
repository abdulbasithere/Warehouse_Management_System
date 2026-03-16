const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const InventoryLocation = sequelize.define('InventoryLocation', {
    Id: {
        type: DataTypes.BIGINT,           // Changed to BIGINT for future-proofing (safer at very large scale)
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    VariantID: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ShelfID: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    PutawayId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    QuantityAvailable: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    QuantityReserved: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    RecievedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'InventoryLocations',
    timestamps: false
});

InventoryLocation.associate = (models) => {
    InventoryLocation.belongsTo(models.Product, { foreignKey: 'ProductID' });
    InventoryLocation.belongsTo(models.ProductVariant, { foreignKey: 'VariantID' });
    InventoryLocation.belongsTo(models.ShelfLocation, { foreignKey: 'ShelfID' });
    InventoryLocation.belongsTo(models.Putaway, { foreignKey: 'PutawayId' });
};

module.exports = InventoryLocation;