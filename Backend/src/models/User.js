const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');  // adjust path if needed

const User = sequelize.define('User', {
    UserId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    FullName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    Password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    userRole: {
        type: DataTypes.ENUM('admin', 'manager', 'picker', 'packer'),
        allowNull: false,
        defaultValue: 'picker'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'Users',
    timestamps: false
});

User.associate = (models) => {
    User.hasMany(models.PickList, { foreignKey: 'AssginPickerId', as: 'assignedPicklists' });
    User.hasMany(models.PackingJob, { foreignKey: 'Packerid', as: 'packingJobs' });
};

module.exports = User;