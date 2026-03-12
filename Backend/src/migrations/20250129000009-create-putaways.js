// migrations/20250129000009-create-putaways.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Putaway', {
            putawayId: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            totalUnits: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            putawayStatus: {
                type: Sequelize.ENUM('pending', 'completed', 'in-progress'),
                defaultValue: 'pending'
            },
            productId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            putawayQuantity: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            assignedPickerId: {
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
        await queryInterface.dropTable('Putaway');
    }
};