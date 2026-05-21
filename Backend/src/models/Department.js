import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'Departments',
    timestamps: true
});

Department.associate = (models) => {
    // Removed InboundShipment association since department is now a string
};

export default Department;
