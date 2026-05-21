'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('TransferOrders', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            transferNumber: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            fromWarehouseId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Warehouses',
                    key: 'warehouseId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            toWarehouseId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Warehouses',
                    key: 'warehouseId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            status: {
                type: Sequelize.ENUM('Created', 'Shipped', 'Received', 'Cancelled'),
                allowNull: false,
                defaultValue: 'Created'
            },
            transferDate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            shippedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            receivedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            remarks: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            createdBy: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'userId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },

        });
        await queryInterface.addIndex('TransferOrders', {
            name: 'idx_to_from_wh',
            fields: ['fromWarehouseId'],
        });
        await queryInterface.addIndex('TransferOrders', {
            name: 'idx_to_to_wh',
            fields: ['toWarehouseId'],
        });
        await queryInterface.addIndex('TransferOrders', {
            name: 'idx_to_status',
            fields: ['status'],
        });
        await queryInterface.addIndex('TransferOrders', {
            name: 'idx_to_date',
            fields: ['transferDate'],
        });
        await queryInterface.addIndex('TransferOrders', {
            name: 'idx_to_number',
            fields: ['transferNumber'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('TransferOrders');
    }
};
