'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('InboundShipments', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            warehouseId: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            purchaseOrderId: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            token: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            invoiceQuantity: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            shipmentNumber: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            vehicleNumber: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            contactNumber: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            driverName: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            poQuantity: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            arrivalDate: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            timeIn: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            timeOut: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            isPlanned: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            isBarcoded: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            remark: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            emails: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('received', 'pending', 'in_transit', 'draft'),
                allowNull: false,
                defaultValue: 'pending'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('GETDATE')
            }
        });

        await queryInterface.createTable('InboundShipmentItems', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            inboundShipmentId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            packageType: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            packageQuantity: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            locationId: {
                type: Sequelize.STRING(100),
                allowNull: true
            }
        });

        await queryInterface.createTable('InboundShipmentAttachments', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            inboundShipmentId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            fileName: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            filePath: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            fileType: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('GETDATE')
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('InboundShipmentAttachments');
        await queryInterface.dropTable('InboundShipmentItems');
        await queryInterface.dropTable('InboundShipments');
    }
};
