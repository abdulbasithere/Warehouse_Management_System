'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // OrderItems → ShopifyOrderNumber (Orders) – cascade makes sense for line items
        await queryInterface.addConstraint('OrderItems', {
            fields: ['ShopifyOrderNumber'],
            type: 'foreign key',
            name: 'fk_orderitems_orders',
            references: {
                table: 'Orders',
                field: 'ShopifyOrderNumber'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // OrderItems → productid (Products) – prevent delete if used in orders
        await queryInterface.addConstraint('OrderItems', {
            fields: ['productid'],
            type: 'foreign key',
            name: 'fk_orderitems_products',
            references: {
                table: 'Products',
                field: 'ProductId'
            },
            onUpdate: 'CASCADE'
            // onDelete omitted → defaults to NO ACTION (prevent delete)
        });

        // PickList → AssginPickerId (Users) – nullable → SET NULL ok
        await queryInterface.addConstraint('PickList', {
            fields: ['AssginPickerId'],
            type: 'foreign key',
            name: 'fk_picklist_user',
            references: {
                table: 'Users',
                field: 'UserId'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        // OrderAllocations → ShopifyOrderNumber and OrderItemid (OrderItems) – composite FK
        await queryInterface.addConstraint('OrderAllocations', {
            fields: ['ShopifyOrderNumber', 'OrderItemid'],
            type: 'foreign key',
            name: 'fk_orderallocations_orderitems',
            references: {
                table: 'OrderItems',
                fields: ['ShopifyOrderNumber', 'OrderItemid']
            },
            onDelete: 'NO ACTION', // Changed from CASCADE to avoid multiple cascade paths (Orders -> OrderItems -> OrderAllocations)
            onUpdate: 'CASCADE'
        });

        // OrderAllocations → ShelfId
        await queryInterface.addConstraint('OrderAllocations', {
            fields: ['ShelfId'],
            type: 'foreign key',
            name: 'fk_orderallocations_shelf',
            references: {
                table: 'ShelfLocations',
                field: 'ShelfId'
            },
            onUpdate: 'CASCADE'
        });

        // OrderAllocations → ProductID
        await queryInterface.addConstraint('OrderAllocations', {
            fields: ['ProductID'],
            type: 'foreign key',
            name: 'fk_orderallocations_product',
            references: {
                table: 'Products',
                field: 'ProductId'
            },
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });

        // PackingJob → OrderId – cascade (packing jobs tied to order)
        await queryInterface.addConstraint('PackingJob', {
            fields: ['OrderId'],
            type: 'foreign key',
            name: 'fk_packingjob_order',
            references: {
                table: 'Orders',
                field: 'ShopifyOrderNumber'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // PackingJob → Packerid – nullable → SET NULL ok
        await queryInterface.addConstraint('PackingJob', {
            fields: ['Packerid'],
            type: 'foreign key',
            name: 'fk_packingjob_user',
            references: {
                table: 'Users',
                field: 'UserId'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        // Putaway → ProductId – prevent delete
        await queryInterface.addConstraint('Putaway', {
            fields: ['ProductId'],
            type: 'foreign key',
            name: 'fk_putaway_product',
            references: {
                table: 'Products',
                field: 'ProductId'
            },
            onUpdate: 'CASCADE'
        });

        // Putaway → AssignedPickerId (Users)
        await queryInterface.addConstraint('Putaway', {
            fields: ['AssignedPickerId'],
            type: 'foreign key',
            name: 'fk_putaway_user',
            references: {
                table: 'Users',
                field: 'UserId'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        // InventoryLocations → ProductID – cascade (inventory tied to product)
        await queryInterface.addConstraint('InventoryLocations', {
            fields: ['ProductID'],
            type: 'foreign key',
            name: 'fk_inventory_product',
            references: {
                table: 'Products',
                field: 'ProductId'
            },
            onDelete: 'NO ACTION', // Changed from CASCADE to avoid multiple cascade paths (Products -> Putaway -> InventoryLocations)
            onUpdate: 'CASCADE'
        });

        // InventoryLocations → ShelfID – cascade (location tied to shelf)
        await queryInterface.addConstraint('InventoryLocations', {
            fields: ['ShelfID'],
            type: 'foreign key',
            name: 'fk_inventory_shelf',
            references: {
                table: 'ShelfLocations',
                field: 'ShelfId'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // OrderAllocations → PickList
        await queryInterface.addConstraint('OrderAllocations', {
            fields: ['pickListId'],
            type: 'foreign key',
            name: 'fk_orderallocations_picklist',
            references: {
                table: 'PickList',
                field: 'PicklistId'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        // InventoryLocations → PutawayId
        await queryInterface.addConstraint('InventoryLocations', {
            fields: ['PutawayId'],
            type: 'foreign key',
            name: 'fk_inventory_putaway',
            references: {
                table: 'Putaway',
                field: 'PutawayId'
            },
            onDelete: 'NO ACTION', // Changed from CASCADE to avoid multiple cascade paths (Products -> Putaway -> InventoryLocations)
            onUpdate: 'NO ACTION'
        });


        // Add foreign key constraints
        await queryInterface.addConstraint('InventoryAdjustments', {
            fields: ['ProductID'],
            type: 'foreign key',
            name: 'fk_inventoryadjustments_product',
            references: {
                table: 'Products',
                field: 'ProductId'
            },
            onUpdate: 'CASCADE'
        });

        await queryInterface.addConstraint('InventoryAdjustments', {
            fields: ['ShelfID'],
            type: 'foreign key',
            name: 'fk_inventoryadjustments_shelf',
            references: {
                table: 'ShelfLocations',
                field: 'ShelfId'
            },
            onUpdate: 'CASCADE'
        });

        await queryInterface.addConstraint('InventoryAdjustments', {
            fields: ['AdjustedBy'],
            type: 'foreign key',
            name: 'fk_inventoryadjustments_user',
            references: {
                table: 'Users',
                field: 'UserId'
            },
            onUpdate: 'CASCADE'
        });
    },

    async down(queryInterface) {
        await queryInterface.removeConstraint('InventoryLocations', 'fk_inventory_putaway');
        await queryInterface.removeConstraint('OrderAllocations', 'fk_orderallocations_picklist');
        await queryInterface.removeConstraint('InventoryLocations', 'fk_inventory_shelf');
        await queryInterface.removeConstraint('InventoryLocations', 'fk_inventory_product');
        await queryInterface.removeConstraint('Putaway', 'fk_putaway_user');
        await queryInterface.removeConstraint('Putaway', 'fk_putaway_product');
        await queryInterface.removeConstraint('PackingJob', 'fk_packingjob_user');
        await queryInterface.removeConstraint('PackingJob', 'fk_packingjob_order');
        await queryInterface.removeConstraint('OrderAllocations', 'fk_orderallocations_product');
        await queryInterface.removeConstraint('OrderAllocations', 'fk_orderallocations_shelf');
        await queryInterface.removeConstraint('OrderAllocations', 'fk_orderallocations_orderitems');
        await queryInterface.removeConstraint('PickList', 'fk_picklist_user');
        await queryInterface.removeConstraint('OrderItems', 'fk_orderitems_products');
        await queryInterface.removeConstraint('OrderItems', 'fk_orderitems_orders');
        await queryInterface.removeConstraint('InventoryAdjustments', 'fk_inventoryadjustments_user');
        await queryInterface.removeConstraint('InventoryAdjustments', 'fk_inventoryadjustments_shelf');
        await queryInterface.removeConstraint('InventoryAdjustments', 'fk_inventoryadjustments_product');
    }
};