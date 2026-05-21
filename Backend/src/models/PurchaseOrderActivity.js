import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const PurchaseOrderActivity = sequelize.define('PurchaseOrderActivity', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    purchaseOrderId: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    subStatus: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'PurchaseOrderActivities',
    timestamps: false,
    indexes: [
        { name: 'idx_poa_po', fields: ['purchaseOrderId'] },
        { name: 'idx_poa_created', fields: ['createdAt'] }
    ]
});

PurchaseOrderActivity.associate = (models) => {
    PurchaseOrderActivity.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    PurchaseOrderActivity.belongsTo(models.User, { foreignKey: 'userId' });
};

export default PurchaseOrderActivity;
