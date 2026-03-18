'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Suppliers', {
            supplierId: {
                type: Sequelize.STRING(50),
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            shortName: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            city: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            phone: {
                type: Sequelize.STRING(20),
                allowNull: true
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
        await queryInterface.dropTable('Suppliers');
    }
};
