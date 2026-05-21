import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const Role = sequelize.define('Role', {
    roleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    roleName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'Roles',
    timestamps: true
});

Role.associate = (models) => {
    Role.belongsToMany(models.Permission, {
        through: models.RolePermission,
        foreignKey: 'roleId',
        as: 'permissions'
    });
    Role.belongsToMany(models.User, {
        through: models.UserRole,
        foreignKey: 'roleId',
        as: 'users'
    });
};

export default Role;
