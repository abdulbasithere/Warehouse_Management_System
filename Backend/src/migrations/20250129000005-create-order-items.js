// migrations/20250129000005-create-order-items.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('OrderItems', {
            shopifyOrderNumber: {
                type: Sequelize.STRING(50),
                primaryKey: true,
                allowNull: false
            },
            orderItemId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            productId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            quantityRequested: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            quantityAllocated: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('OrderItems');
    }
};