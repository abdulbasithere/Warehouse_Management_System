import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const InventoryLocation = sequelize.define('InventoryLocation', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    productVariantId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    shelfId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    putawayId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    supplierId: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    referenceNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    inventoryType: {
        type: DataTypes.ENUM('Normal', 'Refusal', 'Excess', 'Damage'),
        allowNull: false,
        defaultValue: 'Normal'
    },
    quantityAvailable: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0
    },
    quantityReserved: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0
    },
    receivedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'InventoryLocations',
    timestamps: false,
    indexes: [
        { name: 'idx_invloc_variant', fields: ['productVariantId'] },
        { name: 'idx_invloc_shelf', fields: ['shelfId'] },
        { name: 'idx_invloc_putaway', fields: ['putawayId'] },
        { name: 'idx_invloc_warehouse', fields: ['warehouseId'] },
        { name: 'idx_invloc_supplier', fields: ['supplierId'] },
        { name: 'idx_invloc_type', fields: ['inventoryType'] },
        { name: 'idx_invloc_received', fields: ['receivedAt'] },
        { name: 'idx_invloc_variant_qty', fields: ['productVariantId', 'quantityAvailable'] }
    ]
});

InventoryLocation.associate = (models) => {
    InventoryLocation.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId' });
    InventoryLocation.belongsTo(models.ShelfLocation, { foreignKey: 'shelfId' });
    InventoryLocation.belongsTo(models.Putaway, { foreignKey: 'putawayId' });
    InventoryLocation.belongsTo(models.Warehouse, { foreignKey: 'warehouseId' });
    InventoryLocation.belongsTo(models.Supplier, { foreignKey: 'supplierId' });
};

export default InventoryLocation;

