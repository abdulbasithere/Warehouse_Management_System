'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('InventoryAdjustments', {
            adjustmentId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            productId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            shelfId: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            adjustmentQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            reason: {
                type: Sequelize.ENUM('shortage', 'overage', 'damage', 'other'),
                allowNull: false
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            adjustedBy: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            adjustmentDate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('InventoryAdjustments');
    }
};
