const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const PickList = sequelize.define('PickList', {
    PicklistId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    PickStatus: {
        type: DataTypes.ENUM('open', 'in_progress', 'completed'),
        defaultValue: 'open'
    },
    TotalQauntity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    TotalOrder: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    AssginPickerId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    CompletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'PickList',
    timestamps: false
});

PickList.associate = (models) => {
    PickList.belongsTo(models.User, { foreignKey: 'AssginPickerId', as: 'picker' });
    PickList.hasMany(models.OrderAllocation, { foreignKey: 'pickListId' });
};

module.exports = PickList;