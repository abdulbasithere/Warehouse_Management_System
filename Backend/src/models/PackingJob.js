import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const PackingJob = sequelize.define('PackingJob', {
    packingId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    packStatus: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
        defaultValue: 'pending'
    },
    packedQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        defaultValue: 0
    },
    totalQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    basketReference: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    packerId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    completeAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'PackingJob',
    timestamps: false,
    indexes: [
        { name: 'idx_pj_order', fields: ['orderId'] },
        { name: 'idx_pj_basket', fields: ['basketReference'] },
        { name: 'idx_pj_status', fields: ['packStatus'] }
    ]
});

PackingJob.associate = (models) => {
    PackingJob.belongsTo(models.Order, { foreignKey: 'orderId' });
    PackingJob.belongsTo(models.User, { foreignKey: 'packerId', as: 'packer' });
};

export default PackingJob;
