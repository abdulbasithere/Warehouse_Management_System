'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ProductVariants', {
            productVariantId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            variantId: {
                type: Sequelize.STRING(50),
                allowNull: false
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
            color: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            size: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            uoMId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'UnitsOfMeasure',
                    key: 'uoMId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            variancePercentage: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 10
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },

        });
        await queryInterface.addIndex('ProductVariants', {
            name: 'idx_productvariant_lookup',
            fields: ['variantId', 'color', 'size'],
        });
        await queryInterface.addIndex('ProductVariants', {
            name: 'idx_pv_product',
            fields: ['productId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ProductVariants');
    }
};
