'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('InboundShipmentItemDetails', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            shipmentItemId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'InboundShipmentItems',
                    key: 'id'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            shipmentNumber: {
                type: Sequelize.STRING(100),
                allowNull: false
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
            expectedQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false
            },

        });
        await queryInterface.addIndex('InboundShipmentItemDetails', {
            name: 'idx_isid_shipment',
            fields: ['shipmentNumber'],
        });
        await queryInterface.addIndex('InboundShipmentItemDetails', {
            name: 'idx_isid_po',
            fields: ['purchaseOrderId'],
        });
        await queryInterface.addIndex('InboundShipmentItemDetails', {
            name: 'idx_isid_product',
            fields: ['productId'],
        });
        await queryInterface.addIndex('InboundShipmentItemDetails', {
            name: 'idx_isid_variant',
            fields: ['productVariantId'],
        });
        await queryInterface.addIndex('InboundShipmentItemDetails', {
            name: 'idx_isid_scan_lookup',
            fields: ['shipmentNumber', 'purchaseOrderId', 'productVariantId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('InboundShipmentItemDetails');
    }
};
