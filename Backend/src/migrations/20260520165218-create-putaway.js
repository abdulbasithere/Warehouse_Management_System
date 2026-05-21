'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Putaway', {
            putawayId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            totalUnits: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            putawayStatus: {
                type: Sequelize.ENUM('pending', 'completed', 'in-progress'),
                defaultValue: 'pending'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            completedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            putawayQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                defaultValue: 0
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
            referenceId: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            referenceType: {
                type: Sequelize.ENUM('PurchaseOrder', 'TransferOrder', 'CustomerReturn', 'StockAdjustment', 'InboundShipment'),
                allowNull: false
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
        await queryInterface.addIndex('Putaway', {
            name: 'idx_putaway_product',
            fields: ['productId'],
        });
        await queryInterface.addIndex('Putaway', {
            name: 'idx_putaway_status',
            fields: ['putawayStatus'],
        });
        await queryInterface.addIndex('Putaway', {
            name: 'idx_putaway_ref',
            fields: ['referenceId', 'referenceType'],
        });
        await queryInterface.addIndex('Putaway', {
            name: 'idx_putaway_created',
            fields: ['createdAt'],
        });
        await queryInterface.addIndex('Putaway', {
            name: 'idx_putaway_warehouse',
            fields: ['warehouseId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Putaway');
    }
};
