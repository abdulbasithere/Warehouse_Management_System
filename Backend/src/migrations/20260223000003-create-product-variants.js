'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ProductVariants', {
            variantId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            productId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            color: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            size: {
                type: Sequelize.STRING(50),
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
                defaultValue: Sequelize.fn('GETDATE')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ProductVariants');
    }
};
