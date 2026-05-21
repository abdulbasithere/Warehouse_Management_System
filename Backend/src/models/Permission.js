import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const Permission = sequelize.define('Permission', {
    permissionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    permissionName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    module: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'Permissions',
    timestamps: true
});

Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
        through: models.RolePermission,
        foreignKey: 'permissionId',
        as: 'roles'
    });
};

export default Permission;
