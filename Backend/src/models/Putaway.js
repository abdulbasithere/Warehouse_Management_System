const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Putaway = sequelize.define('Putaway', {
    PutawayId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TotalUnits: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    PutawayStatus: {
        type: DataTypes.ENUM('pending', 'completed', 'in-progress'),
        defaultValue: 'pending'
    },
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    CompletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    AssignedPickerId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    PutawayQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ProductId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    tableName: 'Putaway',
    timestamps: false
});

Putaway.associate = (models) => {
    Putaway.belongsTo(models.Product, { foreignKey: 'ProductId' });
    Putaway.belongsTo(models.User, { foreignKey: 'AssignedPickerId', as: 'Picker' });
};

module.exports = Putaway;