'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ProductBarcodes', {
            variantId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            barcode: {
                type: Sequelize.STRING(80),
                allowNull: false
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
