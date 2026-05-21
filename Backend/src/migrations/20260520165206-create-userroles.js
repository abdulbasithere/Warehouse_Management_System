'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('UserRoles', {
            userRoleId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'Users',
                    key: 'userId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            roleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'Roles',
                    key: 'roleId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            warehouseId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Warehouses',
                    key: 'warehouseId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            },

        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('UserRoles');
    }
};
