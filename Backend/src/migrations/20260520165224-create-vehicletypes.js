'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('VehicleTypes', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
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
        await queryInterface.dropTable('VehicleTypes');
    }
};
