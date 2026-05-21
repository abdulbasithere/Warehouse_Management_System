'use strict';

/** @type {import('sequelize-cli').Migration} */
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
                allowNull: false
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
            quantity: {
                type: Sequelize.DECIMAL(20, 2),
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
                allowNull: true,
                references: {
                    model: 'PickList',
                    key: 'pickListId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
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
        await queryInterface.addIndex('OrderAllocations', {
            name: 'idx_oa_order',
            fields: ['shopifyOrderNumber'],
        });
        await queryInterface.addIndex('OrderAllocations', {
            name: 'idx_oa_picklist',
            fields: ['pickListId'],
        });
        await queryInterface.addIndex('OrderAllocations', {
            name: 'idx_oa_product',
            fields: ['productId'],
        });
        await queryInterface.addIndex('OrderAllocations', {
            name: 'idx_oa_shelf',
            fields: ['shelfId'],
        });
        await queryInterface.addIndex('OrderAllocations', {
            name: 'idx_oa_status',
            fields: ['picked', 'packed'],
        });
        await queryInterface.addIndex('OrderAllocations', {
            name: 'idx_oa_warehouse',
            fields: ['warehouseId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('OrderAllocations');
    }
};
