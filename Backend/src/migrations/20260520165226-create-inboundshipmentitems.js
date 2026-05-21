'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('InboundShipmentItems', {
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
            packageType: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            packageQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: true
            },
            itemNumber: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            purchaseOrderId: {
                type: Sequelize.STRING(100),
                allowNull: true,
                references: {
                    model: 'PurchaseOrders',
                    key: 'purchaseOrderId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            vehicleDetailId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'InboundVehicleDetails',
                    key: 'id'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            status: {
                type: Sequelize.ENUM('Pending', 'Partial', 'Fully Parked'),
                allowNull: false,
                defaultValue: 'Pending'
            },
            parkedQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },

        });
        await queryInterface.addIndex('InboundShipmentItems', {
            name: 'idx_isi_shipment',
            fields: ['shipmentNumber'],
        });
        await queryInterface.addIndex('InboundShipmentItems', {
            name: 'idx_isi_po',
            fields: ['purchaseOrderId'],
        });
        await queryInterface.addIndex('InboundShipmentItems', {
            name: 'idx_isi_vehicle',
            fields: ['vehicleDetailId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('InboundShipmentItems');
    }
};
