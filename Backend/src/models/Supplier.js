import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const Supplier = sequelize.define('Supplier', {
    supplierId: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Suppliers',
    timestamps: false
});

Supplier.associate = (models) => {
    Supplier.hasMany(models.PurchaseOrder, { foreignKey: 'supplierId' });
    Supplier.hasMany(models.InboundShipment, { foreignKey: 'supplierId' });
};

export default Supplier;