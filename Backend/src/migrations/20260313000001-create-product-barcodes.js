'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ProductBarcodes', {
            barcodeId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            variantId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            barcode: {
                type: Sequelize.STRING(80),
                allowNull: false
            },
            isPrimary: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('GETDATE')
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ProductBarcodes');
    }
};
