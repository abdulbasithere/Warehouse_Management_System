import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const UserRole = sequelize.define('UserRole', {
    userRoleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    warehouseId: {
        type: DataTypes.INTEGER,
        allowNull: true // Null means it apples to all warehouses globally
    }
}, {
    tableName: 'UserRoles',
    timestamps: true
});

UserRole.associate = (models) => {
    UserRole.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    UserRole.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
    UserRole.belongsTo(models.Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });
};

export default UserRole;
