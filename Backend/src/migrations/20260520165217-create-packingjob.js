'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PackingJob', {
            packingId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            orderId: {
                type: Sequelize.STRING(50),
                allowNull: false,
                references: {
                    model: 'Orders',
                    key: 'shopifyOrderNumber'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            packStatus: {
                type: Sequelize.ENUM('pending', 'in_progress', 'completed'),
                defaultValue: 'pending'
            },
            packedQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                defaultValue: 0
            },
            totalQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false
            },
            basketReference: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            packerId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'userId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            completeAt: {
                type: Sequelize.DATE,
                allowNull: true
            },

        });
        await queryInterface.addIndex('PackingJob', {
            name: 'idx_pj_order',
            fields: ['orderId'],
        });
        await queryInterface.addIndex('PackingJob', {
            name: 'idx_pj_basket',
            fields: ['basketReference'],
        });
        await queryInterface.addIndex('PackingJob', {
            name: 'idx_pj_status',
            fields: ['packStatus'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('PackingJob');
    }
};
