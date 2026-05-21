'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('InboundVehicleDetails', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
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
            vehicleNumber: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            driverName: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            driverContact: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            deliveryNumber: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            vehicleTypeId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'VehicleTypes',
                    key: 'id'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            timeIn: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            timeOut: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            },

        });
        await queryInterface.addIndex('InboundVehicleDetails', {
            name: 'idx_ivd_shipment',
            fields: ['shipmentNumber'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('InboundVehicleDetails');
    }
};
