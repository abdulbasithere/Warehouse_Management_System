'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Suppliers', {
            supplierId: {
                type: Sequelize.STRING(50),
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            city: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            phone: {
                type: Sequelize.STRING(20),
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

        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Suppliers');
    }
};
