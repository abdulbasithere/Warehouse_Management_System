'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ProductReceiptHeaders', {
            receiptId: {
                type: Sequelize.STRING(100),
                primaryKey: true
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
            vendorId: {
                type: Sequelize.STRING(50),
                allowNull: false,
                references: {
                    model: 'Suppliers',
                    key: 'supplierId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            receivingDate: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },

        });
        await queryInterface.addIndex('ProductReceiptHeaders', {
            name: 'idx_prh_shipment',
            fields: ['shipmentNumber'],
        });
        await queryInterface.addIndex('ProductReceiptHeaders', {
            name: 'idx_prh_vendor',
            fields: ['vendorId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ProductReceiptHeaders');
    }
};
