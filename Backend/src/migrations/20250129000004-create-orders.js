// migrations/20250129000004-create-orders.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Orders', {
            shopifyOrderNumber: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING(50)
            },
            customerName: {
                type: Sequelize.STRING(100),
                allowNull: false,
                defaultValue: 'Unknown Customer'
            },
            customerEmail: {
                type: Sequelize.STRING(120),
                allowNull: false,
                defaultValue: 'no-reply@example.com',
                validate: { isEmail: true }
            },
            shippingAddress: {
                type: Sequelize.TEXT,
                allowNull: false,
                defaultValue: 'No Address'
            },
            orderTotalAmount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
            },
            totalUnitsCount: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            allocationStatus: {
                type: Sequelize.ENUM('AVAILABLE', 'PARTIAL-AVAILABLE', 'NOT-AVAILABLE'),
                defaultValue: 'AVAILABLE'
            },
            orderDate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('GETDATE')
            },
            trackingNumber: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            awbUrl: {
                type: Sequelize.STRING(500),
                allowNull: true,
            },
            basketRefrence: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('new', 'picking', 'packing', 'delivered', 'returned'),
                defaultValue: 'new'
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('Orders');
    }
};