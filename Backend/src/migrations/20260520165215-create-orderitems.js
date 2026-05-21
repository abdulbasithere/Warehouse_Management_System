'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('OrderItems', {
            shopifyOrderNumber: {
                type: Sequelize.STRING(50),
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'Orders',
                    key: 'shopifyOrderNumber'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            orderItemId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            productId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Products',
                    key: 'productId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            quantityRequested: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false
            },
            quantityAllocated: {
                type: Sequelize.DECIMAL(20, 2),
                defaultValue: 0
            },

        });
        await queryInterface.addIndex('OrderItems', {
            name: 'idx_oi_product',
            fields: ['productId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('OrderItems');
    }
};
