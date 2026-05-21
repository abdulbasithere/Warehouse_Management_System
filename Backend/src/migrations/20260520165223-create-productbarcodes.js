'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ProductBarcodes', {
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
            barcode: {
                type: Sequelize.STRING(80),
                primaryKey: true,
                allowNull: false
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            description: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },

        });
        await queryInterface.addIndex('ProductBarcodes', {
            name: 'idx_pb_variant',
            fields: ['productVariantId'],
        });
        await queryInterface.addIndex('ProductBarcodes', {
            name: 'idx_pb_barcode',
            fields: ['barcode'],
            unique: true
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ProductBarcodes');
    }
};
