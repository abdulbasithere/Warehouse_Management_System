'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('InboundShipments', {
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
            invoiceQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: true
            },
            supplierId: {
                type: Sequelize.STRING(50),
                allowNull: true,
                references: {
                    model: 'Suppliers',
                    key: 'supplierId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            shipmentNumber: {
                type: Sequelize.STRING(100),
                primaryKey: true
            },
            arrivalDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            isPlanned: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isBarcoded: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isQualityCheck: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            remark: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            emails: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            totalDeliveries: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            status: {
                type: Sequelize.ENUM('received', 'pending', 'in_transit', 'parked'),
                allowNull: false,
                defaultValue: 'pending'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },

        });
        await queryInterface.addIndex('InboundShipments', {
            name: 'idx_is_warehouse',
            fields: ['warehouseId'],
        });
        await queryInterface.addIndex('InboundShipments', {
            name: 'idx_is_supplier',
            fields: ['supplierId'],
        });
        await queryInterface.addIndex('InboundShipments', {
            name: 'idx_is_status',
            fields: ['status'],
        });
        await queryInterface.addIndex('InboundShipments', {
            name: 'idx_is_created',
            fields: ['createdAt'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('InboundShipments');
    }
};
