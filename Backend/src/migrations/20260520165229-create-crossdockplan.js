'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('CrossDockPlan', {
            planId: {
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
            purchaseOrderId: {
                type: Sequelize.STRING(100),
                allowNull: false,
                references: {
                    model: 'PurchaseOrders',
                    key: 'purchaseOrderId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            productVariantId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'ProductVariants',
                    key: 'productVariantId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            warehouseId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Warehouses',
                    key: 'warehouseId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            plannedQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false
            },
            scannedQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            status: {
                type: Sequelize.ENUM('Pending', 'In_Progress', 'Completed', 'Scanned'),
                allowNull: false,
                defaultValue: 'Pending'
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
            barcode: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            inventoryType: {
                type: Sequelize.ENUM('Normal', 'Damage', 'Refusal'),
                allowNull: false,
                defaultValue: 'Normal'
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
        await queryInterface.addIndex('CrossDockPlan', {
            name: 'idx_cdp_shipment',
            fields: ['shipmentNumber'],
        });
        await queryInterface.addIndex('CrossDockPlan', {
            name: 'idx_cdp_po',
            fields: ['purchaseOrderId'],
        });
        await queryInterface.addIndex('CrossDockPlan', {
            name: 'idx_cdp_variant',
            fields: ['productVariantId'],
        });
        await queryInterface.addIndex('CrossDockPlan', {
            name: 'idx_cdp_warehouse',
            fields: ['warehouseId'],
        });
        await queryInterface.addIndex('CrossDockPlan', {
            name: 'idx_cdp_status',
            fields: ['status'],
        });
        await queryInterface.addIndex('CrossDockPlan', {
            name: 'idx_cdp_supplier',
            fields: ['supplierId'],
        });
        await queryInterface.addIndex('CrossDockPlan', {
            name: 'idx_cdp_composite_lookup',
            fields: ['shipmentNumber', 'purchaseOrderId', 'warehouseId', 'productVariantId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('CrossDockPlan');
    }
};
