import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(120),
        allowNull: true,
        validate: { isEmail: true }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Users',
    timestamps: true
});

User.associate = (models) => {
    User.hasMany(models.PickList, { foreignKey: 'assignPickerId', as: 'assignedPicklists' });
    User.hasMany(models.PackingJob, { foreignKey: 'packerId', as: 'packingJobs' });
    User.hasMany(models.InboundShipmentParking, { foreignKey: 'parkedBy' });
    User.hasMany(models.TransferOrder, { foreignKey: 'createdBy', as: 'transferOrders' });

    User.belongsToMany(models.Role, {
        through: models.UserRole,
        foreignKey: 'userId',
        as: 'roles'
    });
};

export default User;
