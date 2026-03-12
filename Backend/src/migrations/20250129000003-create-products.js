// migrations/20250129000003-create-products.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Products', {
            productId: {
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING(150),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('GETDATE')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Products');
    }
};