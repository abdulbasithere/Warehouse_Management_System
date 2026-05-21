'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('RolePermissions', {
            roleId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: true,
                unique: true,
                references: {
                    model: 'Roles',
                    key: 'roleId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            permissionId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: true,
                unique: true,
                references: {
                    model: 'Permissions',
                    key: 'permissionId'
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
        await queryInterface.dropTable('RolePermissions');
    }
};
