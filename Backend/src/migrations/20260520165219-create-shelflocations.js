'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ShelfLocations', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            shelfId: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            currentOccupancy: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            aisle: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            shelfLevel: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            basket: {
                type: Sequelize.STRING(50),
                allowNull: true
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
        await queryInterface.addIndex('ShelfLocations', {
            name: 'idx_shelf_warehouse_unique',
            fields: ['warehouseId', 'shelfId'],
            unique: true
        });
        await queryInterface.addIndex('ShelfLocations', {
            name: 'idx_shelf_warehouse',
            fields: ['warehouseId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ShelfLocations');
    }
};
