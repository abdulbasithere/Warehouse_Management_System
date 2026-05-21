'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('InboundShipmentAttachments', {
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
            fileName: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            filePath: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            fileType: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },

        });
        await queryInterface.addIndex('InboundShipmentAttachments', {
            name: 'idx_isa_shipment',
            fields: ['shipmentNumber'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('InboundShipmentAttachments');
    }
};
