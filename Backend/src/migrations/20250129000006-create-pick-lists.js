// migrations/20250129000006-create-pick-lists.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PickList', {
            pickListId: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            pickStatus: {
                type: Sequelize.ENUM('open', 'in_progress', 'completed'),
                defaultValue: 'open'
            },
            pickQuantity: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            totalQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            totalOrder: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            assignPickerId: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('GETDATE')
            },
            completedAt: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('PickList');
    }
};