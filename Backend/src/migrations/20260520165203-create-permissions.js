'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Permissions', {
            permissionId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            permissionName: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            module: {
                type: Sequelize.STRING(100),
                allowNull: true
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
        await queryInterface.dropTable('Permissions');
    }
};
