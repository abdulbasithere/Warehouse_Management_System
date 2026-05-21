import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const TransferOrderLine = sequelize.define('TransferOrderLine', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    transferOrderId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    productVariantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    },
    shippedQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0
    },
    receivedQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0
    },
    packageType: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    packageQuantity: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true
    }
}, {
    tableName: 'TransferOrderLines',
    timestamps: false,
    indexes: [
        { name: 'idx_tol_to', fields: ['transferOrderId'] },
        { name: 'idx_tol_variant', fields: ['productVariantId'] }
    ]
});

TransferOrderLine.associate = (models) => {
    TransferOrderLine.belongsTo(models.TransferOrder, { foreignKey: 'transferOrderId' });
    TransferOrderLine.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId' });
};

export default TransferOrderLine;
