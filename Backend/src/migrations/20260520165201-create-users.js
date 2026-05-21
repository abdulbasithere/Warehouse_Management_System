'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            userId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false
            },
            fullName: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(120),
                allowNull: true
            },
            phone: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            lastLogin: {
                type: Sequelize.DATE,
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
        await queryInterface.dropTable('Users');
    }
};
