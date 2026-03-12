'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('OrderAllocations', {
            orderAllocationId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            shopifyOrderNumber: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            orderItemId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            shelfId: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            productId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            picked: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            packed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            pickListId: {
                type: Sequelize.INTEGER,
                allowNull: true
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('OrderAllocations');
    }
};