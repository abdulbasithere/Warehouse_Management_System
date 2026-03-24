const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const UnitsOfMeasure = sequelize.define('UnitsOfMeasure', {
    UoMID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    VariantID: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    UnitName: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ConversionFactor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    ParentUoMID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    IsBaseUnit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'UnitsOfMeasure',
    timestamps: false
});

UnitsOfMeasure.associate = (models) => {
    UnitsOfMeasure.belongsTo(models.ProductVariant, { foreignKey: ['ProductID', 'VariantID'] });
    UnitsOfMeasure.belongsTo(models.UnitsOfMeasure, { as: 'Parent', foreignKey: 'ParentUoMID' });
    UnitsOfMeasure.hasMany(models.UnitsOfMeasure, { as: 'Children', foreignKey: 'ParentUoMID' });
    UnitsOfMeasure.hasMany(models.PurchaseOrderLineItem, { foreignKey: 'UoMID' });
};

module.exports = UnitsOfMeasure;