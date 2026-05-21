'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('InboundShipmentParking', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            shipmentNumber: {
                type: Sequelize.STRING(100),
                allowNull: false,
                references: {
                    model: 'InboundShipments',
                    key: 'shipmentNumber'
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
            quantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            parkedBy: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'userId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            parkedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            endTime: {
                type: Sequelize.DATE,
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
            shipmentItemId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'InboundShipmentItems',
                    key: 'id'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },

        });
        await queryInterface.addIndex('InboundShipmentParking', {
            name: 'idx_isp_shipment',
            fields: ['shipmentNumber'],
        });
        await queryInterface.addIndex('InboundShipmentParking', {
            name: 'idx_isp_shelf',
            fields: ['shelfId'],
        });
        await queryInterface.addIndex('InboundShipmentParking', {
            name: 'idx_isp_warehouse',
            fields: ['warehouseId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('InboundShipmentParking');
    }
};
