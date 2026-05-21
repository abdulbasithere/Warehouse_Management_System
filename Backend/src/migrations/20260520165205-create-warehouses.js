'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Warehouses', {
            warehouseId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            warehouseName: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            city: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            zip: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            longitude: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            latitude: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            status: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },

        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Warehouses');
    }
};
