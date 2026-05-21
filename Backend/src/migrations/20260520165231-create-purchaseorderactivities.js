'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PurchaseOrderActivities', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            purchaseOrderId: {
                type: Sequelize.STRING(100),
                allowNull: false,
                references: {
                    model: 'PurchaseOrders',
                    key: 'purchaseOrderId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            status: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            subStatus: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'userId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            remarks: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },

        });
        await queryInterface.addIndex('PurchaseOrderActivities', {
            name: 'idx_poa_po',
            fields: ['purchaseOrderId'],
        });
        await queryInterface.addIndex('PurchaseOrderActivities', {
            name: 'idx_poa_created',
            fields: ['createdAt'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('PurchaseOrderActivities');
    }
};
