'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Products', {
            productId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            category: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            weight: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            trackBatch: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            trackSerial: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            trackExpiry: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
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
        await queryInterface.addIndex('Products', {
            name: 'idx_products_name',
            fields: ['name'],
        });
        await queryInterface.addIndex('Products', {
            name: 'idx_products_category',
            fields: ['category'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Products');
    }
};
