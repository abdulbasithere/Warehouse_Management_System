// migrations/20250129000002-create-shelf-locations.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ShelfLocations', {
            shelfId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING(100)
            },
            currentOccupancy: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('GETDATE')
            },
            aisle: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            shelfLevel: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            basket: {
                type: Sequelize.STRING(50),
                allowNull: true
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('ShelfLocations');
    }
};