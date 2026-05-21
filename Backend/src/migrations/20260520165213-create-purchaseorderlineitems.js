'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PurchaseOrderLineItems', {
            lineItemId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
            quantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false
            },
            receiveQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0,
            },
            unitPrice: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            subtotal: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            productId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Products',
                    key: 'productId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },

        });
        await queryInterface.addIndex('PurchaseOrderLineItems', {
            name: 'idx_poli_po',
            fields: ['purchaseOrderId'],
        });
        await queryInterface.addIndex('PurchaseOrderLineItems', {
            name: 'idx_poli_variant',
            fields: ['productVariantId'],
        });
        await queryInterface.addIndex('PurchaseOrderLineItems', {
            name: 'idx_poli_product',
            fields: ['productId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('PurchaseOrderLineItems');
    }
};
