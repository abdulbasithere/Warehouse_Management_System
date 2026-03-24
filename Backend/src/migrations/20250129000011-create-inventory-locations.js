'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('InventoryLocations', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            productID: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            variantID: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            shelfId: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            putawayId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            quantityAvailable: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            quantityReserved: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            recievedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addConstraint('InventoryLocations', {
            fields: ['productID', 'variantID', 'shelfId', 'putawayId'],
            type: 'unique',
            name: 'unique_product_variant_shelf_putaway'
        });
    },

    async down(queryInterface, Sequelize) {
        // Drop constraints first, then the table
        await queryInterface.removeConstraint('InventoryLocations', 'unique_product_variant_shelf_putaway');
        await queryInterface.dropTable('InventoryLocations');
    }
};