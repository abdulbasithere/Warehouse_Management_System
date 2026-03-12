const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const PackingJob = sequelize.define('PackingJob', {
    Packingid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    OrderId: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    PackStatus: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
        defaultValue: 'pending'
    },
    PackedQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    TotalQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    BasketRefrence: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Packerid: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Removed: ConsignmentNumber

    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    CompleteAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'PackingJob',
    timestamps: false
});

PackingJob.associate = (models) => {
    PackingJob.belongsTo(models.Order, { foreignKey: 'OrderId' });
    PackingJob.belongsTo(models.User, { foreignKey: 'Packerid', as: 'packer' });
};

module.exports = PackingJob;