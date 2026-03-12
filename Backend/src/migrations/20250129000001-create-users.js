// migrations/20250129000001-create-users.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            userId: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            fullName: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(120),
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            userRole: {
                type: Sequelize.ENUM('admin', 'manager', 'picker', 'packer', 'viewer'),
                allowNull: false,
                defaultValue: 'viewer'
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Users');
    }
};