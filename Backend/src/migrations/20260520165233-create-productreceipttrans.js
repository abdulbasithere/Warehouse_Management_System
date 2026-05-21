'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ProductReceiptTrans', {
            receiptLineId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            receiptId: {
                type: Sequelize.STRING(100),
                allowNull: false,
                references: {
                    model: 'ProductReceiptHeaders',
                    key: 'receiptId'
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
            quantityReceived: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('Accepted', 'Refused'),
                allowNull: false
            },

        });
        await queryInterface.addIndex('ProductReceiptTrans', {
            name: 'idx_prt_receipt',
            fields: ['receiptId'],
        });
        await queryInterface.addIndex('ProductReceiptTrans', {
            name: 'idx_prt_po',
            fields: ['purchaseOrderId'],
        });
        await queryInterface.addIndex('ProductReceiptTrans', {
            name: 'idx_prt_variant',
            fields: ['productVariantId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ProductReceiptTrans');
    }
};
