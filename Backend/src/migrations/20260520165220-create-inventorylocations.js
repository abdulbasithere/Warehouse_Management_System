'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('InventoryLocations', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            productVariantId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'ProductVariants',
                    key: 'productVariantId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            shelfId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'ShelfLocations',
                    key: 'id'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            putawayId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Putaway',
                    key: 'putawayId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            warehouseId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Warehouses',
                    key: 'warehouseId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            supplierId: {
                type: Sequelize.STRING(50),
                allowNull: true,
                references: {
                    model: 'Suppliers',
                    key: 'supplierId'
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION'
            },
            referenceNumber: {
                type: Sequelize.STRING(100),
                allowNull: true,
                unique: true
            },
            inventoryType: {
                type: Sequelize.ENUM('Normal', 'Refusal', 'Excess', 'Damage'),
                allowNull: false,
                defaultValue: 'Normal'
            },
            quantityAvailable: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            quantityReserved: {
                type: Sequelize.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0
            },
            receivedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },

        });
        await queryInterface.addIndex('InventoryLocations', {
            name: 'idx_invloc_variant',
            fields: ['productVariantId'],
        });
        await queryInterface.addIndex('InventoryLocations', {
            name: 'idx_invloc_shelf',
            fields: ['shelfId'],
        });
        await queryInterface.addIndex('InventoryLocations', {
            name: 'idx_invloc_putaway',
            fields: ['putawayId'],
        });
        await queryInterface.addIndex('InventoryLocations', {
            name: 'idx_invloc_warehouse',
            fields: ['warehouseId'],
        });
        await queryInterface.addIndex('InventoryLocations', {
            name: 'idx_invloc_supplier',
            fields: ['supplierId'],
        });
        await queryInterface.addIndex('InventoryLocations', {
            name: 'idx_invloc_type',
            fields: ['inventoryType'],
        });
        await queryInterface.addIndex('InventoryLocations', {
            name: 'idx_invloc_received',
            fields: ['receivedAt'],
        });
        await queryInterface.addIndex('InventoryLocations', {
            name: 'idx_invloc_variant_qty',
            fields: ['productVariantId', 'quantityAvailable'],
        });

    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('InventoryLocations');
    }
};
