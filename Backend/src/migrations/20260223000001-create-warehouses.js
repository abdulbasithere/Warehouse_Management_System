'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Warehouses', {
            warehouseId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            companyName: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            city: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('Active', 'Inactive'),
                allowNull: false,
                defaultValue: 'Active'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('GETDATE')
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Warehouses');
    }
};
