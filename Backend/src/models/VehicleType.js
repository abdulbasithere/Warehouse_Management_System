import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const VehicleType = sequelize.define('VehicleType', {
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
    tableName: 'VehicleTypes',
    timestamps: true
});

VehicleType.associate = (models) => {
    VehicleType.hasMany(models.InboundVehicleDetail, { foreignKey: 'vehicleTypeId' });
};

export default VehicleType;
