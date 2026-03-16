'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PurchaseOrders', {
            purchaseOrderId: {
                type: Sequelize.STRING(100),
                primaryKey: true,
                allowNull: false
            },
            number: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            supplierId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('Pending', 'Received', 'Partial', 'Canceled'),
                allowNull: false,
                defaultValue: 'Pending'
            },
            totalProducts: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            totalAmount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            totalUnits: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            receivingWarehouseId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            expectedDate: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('GETDATE')
            },
            tags: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            crossDockFlag: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('PurchaseOrders');
    }
};
