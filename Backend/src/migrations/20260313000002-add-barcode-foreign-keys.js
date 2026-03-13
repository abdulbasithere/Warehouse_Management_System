'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint('ProductBarcodes', {
            fields: ['variantId'],
            type: 'foreign key',
            name: 'fk_barcodes_variant',
            references: {
                table: 'ProductVariants',
                field: 'variantId'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('ProductBarcodes', 'fk_barcodes_variant');
    }
};
