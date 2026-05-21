'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Orders', {
            shopifyOrderNumber: {
                type: Sequelize.STRING(50),
                primaryKey: true,
                allowNull: false
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
                defaultValue: Sequelize.NOW
            },
            status: {
                type: Sequelize.ENUM('new', 'picking', 'packing', 'delivered', 'returned'),
                defaultValue: 'new'
            },
            customerName: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            customerEmail: {
                type: Sequelize.STRING(120),
                allowNull: false
            },
            shippingAddress: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            trackingNumber: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            awbUrl: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            basketReference: {
                type: Sequelize.STRING(50),
                allowNull: true
            },

        });
        await queryInterface.addIndex('Orders', {
            name: 'idx_orders_status',
            fields: ['status'],
        });
        await queryInterface.addIndex('Orders', {
            name: 'idx_orders_allocation',
            fields: ['allocationStatus'],
        });
        await queryInterface.addIndex('Orders', {
            name: 'idx_orders_date',
            fields: ['orderDate'],
        });
        await queryInterface.addIndex('Orders', {
            name: 'idx_orders_basket',
            fields: ['basketReference'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Orders');
    }
};
