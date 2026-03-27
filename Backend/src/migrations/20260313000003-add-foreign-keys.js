'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addConstraint('OrderItems', {
            fields: ['shopifyOrderNumber'],
            type: 'foreign key',
            name: 'fk_orderitems_orders',
            references: {
                table: 'Orders',
                field: 'shopifyOrderNumber'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // OrderItems → Products (productID → productID)
        await queryInterface.addConstraint('OrderItems', {
            fields: ['productID'],
            type: 'foreign key',
            name: 'fk_orderitems_products',
            references: {
                table: 'Products',
                field: 'productID'
            },
            onUpdate: 'CASCADE'
        });

        // PickList → Users (AssginPickerId → UserId)
        await queryInterface.addConstraint('PickList', {
            fields: ['assignPickerId'],
            type: 'foreign key',
            name: 'fk_picklist_user',
            references: {
                table: 'Users',
                field: 'userId'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        // OrderAllocations → OrderItems (composite key)
        await queryInterface.addConstraint('OrderAllocations', {
            fields: ['shopifyOrderNumber', 'orderItemId'],
            type: 'foreign key',
            name: 'fk_orderallocations_orderitems',
            references: {
                table: 'OrderItems',
                fields: ['shopifyOrderNumber', 'orderItemId']
            },
            onDelete: 'NO ACTION',
            onUpdate: 'CASCADE'
        });

        // OrderAllocations → ShelfLocations
        await queryInterface.addConstraint('OrderAllocations', {
            fields: ['shelfId'],
            type: 'foreign key',
            name: 'fk_orderallocations_shelf',
            references: {
                table: 'ShelfLocations',
                field: 'shelfId'
            },
            onUpdate: 'CASCADE'
        });

        // OrderAllocations → Products
        await queryInterface.addConstraint('OrderAllocations', {
            fields: ['productID'],
            type: 'foreign key',
            name: 'fk_orderallocations_product',
            references: {
                table: 'Products',
                field: 'productID'
            },
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });

        // PackingJob → Orders
        await queryInterface.addConstraint('PackingJob', {
            fields: ['orderId'],
            type: 'foreign key',
            name: 'fk_packingjob_order',
            references: {
                table: 'Orders',
                field: 'shopifyOrderNumber'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // PackingJob → Users (packer)
        await queryInterface.addConstraint('PackingJob', {
            fields: ['packerId'],
            type: 'foreign key',
            name: 'fk_packingjob_user',
            references: {
                table: 'Users',
                field: 'userId'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        // Putaway → Products
        await queryInterface.addConstraint('Putaway', {
            fields: ['productID'],
            type: 'foreign key',
            name: 'fk_putaway_product',
            references: {
                table: 'Products',
                field: 'productID'
            },
            onUpdate: 'CASCADE'
        });

        // Putaway → Users
        await queryInterface.addConstraint('Putaway', {
            fields: ['assignedPickerId'],
            type: 'foreign key',
            name: 'fk_putaway_user',
            references: {
                table: 'Users',
                field: 'userId'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        // InventoryLocations → Products
        await queryInterface.addConstraint('InventoryLocations', {
            fields: ['productID'],
            type: 'foreign key',
            name: 'fk_inventory_product',
            references: {
                table: 'Products',
                field: 'productID'
            },
            onUpdate: 'CASCADE'
        });

        // InventoryLocations → ProductVariants
        await queryInterface.addConstraint('InventoryLocations', {
            fields: ['productID', 'variantID'],
            type: 'foreign key',
            name: 'fk_inventory_variant',
            references: {
                table: 'ProductVariants',
                fields: ['productID', 'variantID']
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // InventoryLocations → ShelfLocations
        await queryInterface.addConstraint('InventoryLocations', {
            fields: ['shelfId'],
            type: 'foreign key',
            name: 'fk_inventory_shelf',
            references: {
                table: 'ShelfLocations',
                field: 'shelfId'
            },
            onUpdate: 'CASCADE'
        });

        // InventoryLocations → Putaway
        await queryInterface.addConstraint('InventoryLocations', {
            fields: ['putawayId'],
            type: 'foreign key',
            name: 'fk_inventory_putaway',
            references: {
                table: 'Putaway',
                field: 'putawayId'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        });

        // InventoryAdjustments → Products
        await queryInterface.addConstraint('InventoryAdjustments', {
            fields: ['productID'],
            type: 'foreign key',
            name: 'fk_inventoryadjustments_product',
            references: {
                table: 'Products',
                field: 'productID'
            },
            onUpdate: 'CASCADE'
        });

        // InventoryAdjustments → ShelfLocations
        await queryInterface.addConstraint('InventoryAdjustments', {
            fields: ['shelfId'],
            type: 'foreign key',
            name: 'fk_inventoryadjustments_shelf',
            references: {
                table: 'ShelfLocations',
                field: 'shelfId'
            },
            onUpdate: 'CASCADE'
        });

        // InventoryAdjustments → Users
        await queryInterface.addConstraint('InventoryAdjustments', {
            fields: ['adjustedBy'],
            type: 'foreign key',
            name: 'fk_inventoryadjustments_user',
            references: {
                table: 'Users',
                field: 'userId'
            },
            onUpdate: 'CASCADE'
        });

        // ProductVariants → Products
        await queryInterface.addConstraint('ProductVariants', {
            fields: ['productID'],
            type: 'foreign key',
            name: 'fk_variants_product',
            references: {
                table: 'Products',
                field: 'productID'
            },
            onUpdate: 'NO ACTION'
        });

        // UnitsOfMeasure → ProductVariants
        await queryInterface.addConstraint('UnitsOfMeasure', {
            fields: ['productID', 'variantID'],
            type: 'foreign key',
            name: 'fk_uom_variant',
            references: {
                table: 'ProductVariants',
                fields: ['productID', 'variantID']
            },
            onUpdate: 'CASCADE'
        });

        // UnitsOfMeasure → self-reference (parent unit)
        await queryInterface.addConstraint('UnitsOfMeasure', {
            fields: ['parentuoMId'],
            type: 'foreign key',
            name: 'fk_uom_parent',
            references: {
                table: 'UnitsOfMeasure',
                field: 'uoMId'
            },
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });

        // PurchaseOrders → Suppliers
        await queryInterface.addConstraint('PurchaseOrders', {
            fields: ['supplierId'],
            type: 'foreign key',
            name: 'fk_po_supplier',
            references: {
                table: 'Suppliers',
                field: 'supplierId'
            },
            onUpdate: 'CASCADE'
        });

        // PurchaseOrders → Warehouses
        await queryInterface.addConstraint('PurchaseOrders', {
            fields: ['receivingWarehouseId'],
            type: 'foreign key',
            name: 'fk_po_warehouse',
            references: {
                table: 'Warehouses',
                field: 'warehouseId'
            },
            onUpdate: 'CASCADE'
        });

        // PurchaseOrderLineItems → PurchaseOrders
        await queryInterface.addConstraint('PurchaseOrderLineItems', {
            fields: ['purchaseOrderId'],
            type: 'foreign key',
            name: 'fk_poline_po',
            references: {
                table: 'PurchaseOrders',
                field: 'purchaseOrderId'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // PurchaseOrderLineItems → ProductVariants
        await queryInterface.addConstraint('PurchaseOrderLineItems', {
            fields: ['productID', 'variantID'],
            type: 'foreign key',
            name: 'fk_poline_variant',
            references: {
                table: 'ProductVariants',
                fields: ['productID', 'variantID']
            },
            onUpdate: 'CASCADE'
        });

        // PurchaseOrderLineItems → UnitsOfMeasure
        await queryInterface.addConstraint('PurchaseOrderLineItems', {
            fields: ['uoMId'],
            type: 'foreign key',
            name: 'fk_poline_uom',
            references: {
                table: 'UnitsOfMeasure',
                field: 'uoMId'
            },
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION'
        });

        await queryInterface.addConstraint('ProductBarcodes', {
            fields: ['productID', 'variantID'],
            type: 'foreign key',
            name: 'fk_barcodes_variant',
            references: {
                table: 'ProductVariants',
                fields: ['productID', 'variantID']
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // InboundShipments → Warehouses
        await queryInterface.addConstraint('InboundShipments', {
            fields: ['warehouseId'],
            type: 'foreign key',
            name: 'fk_inboundshipments_warehouse',
            references: {
                table: 'Warehouses',
                field: 'warehouseId'
            },
            onUpdate: 'CASCADE'
        });

        // InboundShipments → PurchaseOrders
        await queryInterface.addConstraint('InboundShipments', {
            fields: ['purchaseOrderId'],
            type: 'foreign key',
            name: 'fk_inboundshipments_po',
            references: {
                table: 'PurchaseOrders',
                field: 'purchaseOrderId'
            },
            onUpdate: 'NO ACTION'
        });

        // InboundShipmentItems → InboundShipments
        await queryInterface.addConstraint('InboundShipmentItems', {
            fields: ['shipmentNumber'],
            type: 'foreign key',
            name: 'fk_shipmentitems_shipment',
            references: {
                table: 'InboundShipments',
                field: 'shipmentNumber'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // InboundShipmentItems → ShelfLocations
        await queryInterface.addConstraint('InboundShipmentItems', {
            fields: ['locationId'],
            type: 'foreign key',
            name: 'fk_shipmentitems_shelf',
            references: {
                table: 'ShelfLocations',
                field: 'shelfId'
            },
            onUpdate: 'CASCADE'
        });

        // InboundShipmentAttachments → InboundShipments
        await queryInterface.addConstraint('InboundShipmentAttachments', {
            fields: ['shipmentNumber'],
            type: 'foreign key',
            name: 'fk_shipmentattachments_shipment',
            references: {
                table: 'InboundShipments',
                field: 'shipmentNumber'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // ShelfLocations → Warehouses
        await queryInterface.addConstraint('ShelfLocations', {
            fields: ['warehouseId'],
            type: 'foreign key',
            name: 'fk_shelflocations_warehouse',
            references: {
                table: 'Warehouses',
                field: 'warehouseId'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        });
    },

    async down(queryInterface) {
        await queryInterface.removeConstraint('PurchaseOrderLineItems', 'fk_poline_uom');
        await queryInterface.removeConstraint('PurchaseOrderLineItems', 'fk_poline_variant');
        await queryInterface.removeConstraint('PurchaseOrderLineItems', 'fk_poline_po');
        await queryInterface.removeConstraint('PurchaseOrders', 'fk_po_warehouse');
        await queryInterface.removeConstraint('PurchaseOrders', 'fk_po_supplier');
        await queryInterface.removeConstraint('UnitsOfMeasure', 'fk_uom_parent');
        await queryInterface.removeConstraint('UnitsOfMeasure', 'fk_uom_variant');
        await queryInterface.removeConstraint('ProductVariants', 'fk_variants_product');
        await queryInterface.removeConstraint('ProductBarcodes', 'fk_barcodes_variant');
        await queryInterface.removeConstraint('InventoryAdjustments', 'fk_inventoryadjustments_product');
        await queryInterface.removeConstraint('InventoryAdjustments', 'fk_inventoryadjustments_shelf');
        await queryInterface.removeConstraint('InventoryAdjustments', 'fk_inventoryadjustments_user');
        await queryInterface.removeConstraint('InventoryLocations', 'fk_inventory_putaway');
        await queryInterface.removeConstraint('OrderAllocations', 'fk_orderallocations_picklist');
        await queryInterface.removeConstraint('InventoryLocations', 'fk_inventory_shelf');
        await queryInterface.removeConstraint('InventoryLocations', 'fk_inventory_variant');
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

        await queryInterface.removeConstraint('InboundShipmentAttachments', 'fk_shipmentattachments_shipment');
        await queryInterface.removeConstraint('InboundShipmentItems', 'fk_shipmentitems_shelf');
        await queryInterface.removeConstraint('InboundShipmentItems', 'fk_shipmentitems_shipment');
        await queryInterface.removeConstraint('InboundShipments', 'fk_inboundshipments_po');
        await queryInterface.removeConstraint('InboundShipments', 'fk_inboundshipments_warehouse');
        await queryInterface.removeConstraint('ShelfLocations', 'fk_shelflocations_warehouse');
    }
};