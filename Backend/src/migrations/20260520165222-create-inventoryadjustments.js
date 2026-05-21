'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('InventoryAdjustments', {
            adjustmentId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
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
            shelfId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'ShelfLocations',
                    key: 'id'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            adjustmentQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false
            },
            reason: {
                type: Sequelize.ENUM('excess', 'short', 'other'),
                allowNull: false
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            adjustedBy: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'userId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            adjustmentDate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            warehouseId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Warehouses',
                    key: 'warehouseId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },

        });
        await queryInterface.addIndex('InventoryAdjustments', {
            name: 'idx_ia_product',
            fields: ['productId'],
        });
        await queryInterface.addIndex('InventoryAdjustments', {
            name: 'idx_ia_shelf',
            fields: ['shelfId'],
        });
        await queryInterface.addIndex('InventoryAdjustments', {
            name: 'idx_ia_date',
            fields: ['adjustmentDate'],
        });
        await queryInterface.addIndex('InventoryAdjustments', {
            name: 'idx_ia_warehouse',
            fields: ['warehouseId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('InventoryAdjustments');
    }
};
