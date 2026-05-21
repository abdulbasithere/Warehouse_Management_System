import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const UnitsOfMeasure = sequelize.define('UnitsOfMeasure', {
    uoMId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    unitName: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    conversionFactor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    parentUoMId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isBaseUnit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'UnitsOfMeasure',
    timestamps: false
});

UnitsOfMeasure.associate = (models) => {
    UnitsOfMeasure.hasMany(models.ProductVariant, { foreignKey: 'uoMId' });
    UnitsOfMeasure.belongsTo(models.UnitsOfMeasure, { as: 'Parent', foreignKey: 'parentUoMId' });
    UnitsOfMeasure.hasMany(models.UnitsOfMeasure, { as: 'Children', foreignKey: 'parentUoMId' });
};

export default UnitsOfMeasure;
