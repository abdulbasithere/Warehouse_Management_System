// migrations/20250129000008-create-packing-jobs.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PackingJob', {
            packingId: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            orderId: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            packStatus: {
                type: Sequelize.ENUM('pending', 'in_progress', 'completed'),
                defaultValue: 'pending'
            },
            packedQuantity: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            totalQuantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            basketRefrence: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            packerId: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('GETDATE')
            },
            completeAt: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('PackingJob');
    }
};