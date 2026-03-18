'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PurchaseOrderLineItems', {
            lineItemId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            purchaseOrderId: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            variantId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            color: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            size: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            quantity: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            quantityRecieved: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.0
            },
            quantityScanned: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.0
            },
            status: {
                type: Sequelize.ENUM('Open', 'Partial', 'Received', 'OverReceived', 'Canceled'),
                allowNull: false,
                defaultValue: 'Open'
            },
            unitPrice: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            subtotal: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            uoMId: {
                type: Sequelize.INTEGER,
                allowNull: false
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('PurchaseOrderLineItems');
    }
};
