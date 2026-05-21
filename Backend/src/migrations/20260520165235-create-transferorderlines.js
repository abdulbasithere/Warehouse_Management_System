'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('TransferOrderLines', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            transferOrderId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'TransferOrders',
                    key: 'id'
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
            shippedQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            receivedQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            packageType: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            packageQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: true
            },

        });
        await queryInterface.addIndex('TransferOrderLines', {
            name: 'idx_tol_to',
            fields: ['transferOrderId'],
        });
        await queryInterface.addIndex('TransferOrderLines', {
            name: 'idx_tol_variant',
            fields: ['productVariantId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('TransferOrderLines');
    }
};
