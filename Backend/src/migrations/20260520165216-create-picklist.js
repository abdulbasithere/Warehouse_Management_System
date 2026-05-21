'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PickList', {
            pickListId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            pickStatus: {
                type: Sequelize.ENUM('open', 'in_progress', 'completed'),
                defaultValue: 'open'
            },
            totalQuantity: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false
            },
            totalOrder: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            assignPickerId: {
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
            completedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },

        });
        await queryInterface.addIndex('PickList', {
            name: 'idx_pl_status',
            fields: ['pickStatus'],
        });
        await queryInterface.addIndex('PickList', {
            name: 'idx_pl_picker',
            fields: ['assignPickerId'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('PickList');
    }
};
