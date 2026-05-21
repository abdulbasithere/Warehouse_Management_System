import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const RolePermission = sequelize.define('RolePermission', {
    roleId: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    permissionId: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'RolePermissions',
    timestamps: true
});

RolePermission.associate = (models) => {
    RolePermission.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
    RolePermission.belongsTo(models.Permission, { foreignKey: 'permissionId', as: 'permission' });
};

export default RolePermission;
