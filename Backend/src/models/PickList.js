import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const PickList = sequelize.define('PickList', {
    pickListId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pickStatus: {
        type: DataTypes.ENUM('open', 'in_progress', 'completed'),
        defaultValue: 'open'
    },
    totalQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    totalOrder: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assignPickerId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'PickList',
    timestamps: false,
    indexes: [
        { name: 'idx_pl_status', fields: ['pickStatus'] },
        { name: 'idx_pl_picker', fields: ['assignPickerId'] }
    ]
});

PickList.associate = (models) => {
    PickList.belongsTo(models.User, { foreignKey: 'assignPickerId', as: 'picker' });
    PickList.hasMany(models.OrderAllocation, { foreignKey: 'pickListId' });
};

export default PickList;
