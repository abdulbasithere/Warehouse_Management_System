const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Product = sequelize.define('Product', {
    ProductID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    Name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    UpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Products',
    timestamps: false
});

Product.associate = (models) => {
    Product.hasMany(models.ProductVariant, { foreignKey: 'ProductID' });
};

module.exports = Product;