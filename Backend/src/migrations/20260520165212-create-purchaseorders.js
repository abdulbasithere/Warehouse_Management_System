'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PurchaseOrders', {
            purchaseOrderId: {
                type: Sequelize.STRING(100),
                primaryKey: true,
                allowNull: false
            },
            supplierId: {
                type: Sequelize.STRING(50),
                allowNull: false,
                references: {
                    model: 'Suppliers',
                    key: 'supplierId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            status: {
                type: Sequelize.ENUM('Pending', 'In Process', 'Received', 'Canceled', 'Open Order'),
                allowNull: false,
                defaultValue: 'Pending'
            },
            totalProducts: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            totalAmount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            purchaseOrderQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false
            },
            supplierBillQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: true
            },
            supplierBillNumber: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            receivingWarehouseId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Warehouses',
                    key: 'warehouseId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            expectedDate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            arrivalDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            tags: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            crossDockFlag: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            inboundShipment: {
                type: Sequelize.STRING(100),
                allowNull: true,
                references: {
                    model: 'InboundShipments',
                    key: 'shipmentNumber'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },

        });
        await queryInterface.addIndex('PurchaseOrders', {
            name: 'idx_po_supplier',
            fields: ['supplierId'],
        });
        await queryInterface.addIndex('PurchaseOrders', {
            name: 'idx_po_status',
            fields: ['status'],
        });
        await queryInterface.addIndex('PurchaseOrders', {
            name: 'idx_po_warehouse',
            fields: ['receivingWarehouseId'],
        });
        await queryInterface.addIndex('PurchaseOrders', {
            name: 'idx_po_created',
            fields: ['createdAt'],
        });
        await queryInterface.addIndex('PurchaseOrders', {
            name: 'idx_po_crossdock',
            fields: ['crossDockFlag'],
        });
        await queryInterface.addIndex('PurchaseOrders', {
            name: 'idx_po_inbound',
            fields: ['inboundShipment'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('PurchaseOrders');
    }
};
