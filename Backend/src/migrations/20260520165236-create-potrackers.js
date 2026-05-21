'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PoTrackers', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            purchaseOrderId: {
                type: Sequelize.STRING(100),
                allowNull: false,
                references: {
                    model: 'PurchaseOrders',
                    key: 'purchaseOrderId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            trackerStatus: {
                type: Sequelize.ENUM('Shipment Arrived', 'In Process', 'GRN Process', 'Partial Closed', 'Closed', 'Cancelled', 'Move to Sample', 'Pending a Merchant End', 'Pending at Supply Chain'),
                allowNull: true
            },
            trackerSubStatus: {
                type: Sequelize.ENUM('Stock placed in Receiving Rack', 'Stock placed in Department', 'Pending due to Documentation', 'Partial Received from China Carry', 'Pending for Weight', 'Partial Received from Supplier End', 'Pending to Process', 'Pending for Sampling', 'Handover to Admin', 'On Packing', 'On Partial Barcoding', 'On Barcoding', 'On Distribution', 'On Scanning', 'On Sorting', 'Pending due to Network Issue', 'On Security Verification', 'On Audit Verification', 'Document handover for GRN', 'Pending at MSO End', 'GRN Posted', 'China Partial Received', 'Receiving WH Issue', 'Urgent Dispatch', 'Hand Over to Audit', 'Hand Over to Merchant', 'PO/TO Cancel', 'Stock Returned', 'Physical Stock Moved', 'Physical Stock not Moved', 'TO Or PO need to be updated', 'Q.C Issue found and hold by merchant', 'PO, Bill & Physical Stock not match', 'Over Delivery (Need Child PO)', 'Mix Stock Receive', 'Partial Barcoded', 'Wrong Barcoded', 'Price Updated', 'Packing Accessories not available', 'Partial Received', 'Due to Vendor not available for Live Receiving', 'Dispatch not Receive on Time', 'Change in Dispatch'),
                allowNull: true
            },
            departmentReceiver: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'userId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            withSupplier: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            verifiedByLp: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            verifiedByAudit: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            ConsiderDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            responsibleSupervisor: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'userId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            SampleMovementDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            packer: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'userId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            googleLens: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: false
            },
            parkLocation: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            ShipmentConsiderDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            ChinaCarry: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            billFrom: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            invoiceSubmittedDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            CommittedDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            billSubmittedDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            editLines: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            SignatureRequired: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            brand: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            division: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            merchandiser: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            department: {
                type: Sequelize.STRING(255),
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
        await queryInterface.dropTable('PoTrackers');
    }
};
