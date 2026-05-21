import { InboundShipment, InboundShipmentItem, InboundShipmentAttachment, InboundShipmentParking, InboundVehicleDetail, Warehouse, PurchaseOrder, CrossDockPlan, ProductVariant, Supplier, VehicleType, ShelfLocation } from '../models/setupModels.js';
import xlsx from 'xlsx';
import fs from 'fs';
import sequelize from '../utils/db.js';
import { Op } from 'sequelize';

export const getAllInboundShipments = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 20,
            search = '',
            purchaseOrderId = '',
            date,
            vendorName
        } = req.query;

        const offset = (page - 1) * pageSize;

        const shipmentWhere = {};
        const supplierWhere = {};
        const itemWhere = {};

        if (date) {
            shipmentWhere.createdAt = {
                [Op.between]: [
                    new Date(new Date(date).setHours(0, 0, 0, 0)),
                    new Date(new Date(date).setHours(23, 59, 59, 999))
                ]
            };
        }

        if (search) {
            shipmentWhere.shipmentNumber = { [Op.like]: `%${search}%` };
        }

        if (vendorName) {
            supplierWhere.name = { [Op.like]: `%${vendorName}%` };
        }

        if (purchaseOrderId) {
            itemWhere.purchaseOrderId = { [Op.like]: `%${purchaseOrderId}%` };
        }

        const { count, rows: shipments } = await InboundShipment.findAndCountAll({
            where: shipmentWhere,
            attributes: ['shipmentNumber', 'status', 'createdAt', 'warehouseId', 'supplierId'],
            include: [
                {
                    model: Warehouse,
                    attributes: ['warehouseName']
                },
                {
                    model: Supplier,
                    attributes: ['name'],
                    where: Object.keys(supplierWhere).length ? supplierWhere : undefined,
                    required: Object.keys(supplierWhere).length > 0
                },
                {
                    model: InboundShipmentItem,
                    attributes: [],
                    where: Object.keys(itemWhere).length ? itemWhere : undefined,
                    required: Object.keys(itemWhere).length > 0
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            distinct: true
        });

        const formattedShipments = shipments.map(shipment => ({
            status: shipment.status,
            createdAt: shipment.createdAt,
            warehouseName: shipment.Warehouse ? shipment.Warehouse.warehouseName : '-',
            shipmentNumber: shipment.shipmentNumber,
            supplierName: shipment.Supplier ? shipment.Supplier.name : '-'
        }));

        res.json({
            data: formattedShipments,
            total: count,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });

    } catch (error) {
        console.error('Error fetching inbound shipments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getInboundShipmentDetail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Shipment Number is required'
            });
        }

        const shipment = await InboundShipment.findOne({
            where: { shipmentNumber: id },
            attributes: [
                'shipmentNumber', 'warehouseId', 'supplierId', 'invoiceQuantity',
                'arrivalDate', 'isPlanned', 'isBarcoded', 'isQualityCheck',
                'remark', 'emails', 'totalDeliveries', 'status', 'createdAt'
            ],
            include: [
                {
                    model: Warehouse,
                    attributes: ['warehouseId', 'warehouseName']
                },
                {
                    model: InboundShipmentItem,
                    attributes: ['id', 'packageType', 'packageQuantity', 'itemNumber', 'purchaseOrderId', 'status', 'parkedQuantity']
                },
                {
                    model: InboundShipmentAttachment,
                    attributes: ['id', 'fileName', 'filePath', 'fileType', 'createdAt']
                },
                {
                    model: InboundVehicleDetail,
                    attributes: ['id', 'shipmentNumber', 'vehicleNumber', 'driverName', 'driverContact', 'deliveryNumber', 'vehicleTypeId', 'timeIn', 'timeOut'],
                    include: [
                        {
                            model: VehicleType,
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: InboundShipmentParking,
                    attributes: ['id', 'shelfId', 'quantity', 'notes', 'parkedBy', 'parkedAt', 'endTime', 'warehouseId', 'shipmentItemId'],
                    include: [
                        {
                            model: ShelfLocation,
                            attributes: ['id', 'shelfId', 'aisle', 'shelfLevel', 'basket', 'currentOccupancy']
                        }
                    ]
                }
            ]
        });

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: `Inbound Shipment with number ${id} not found`
            });
        }

        const shipmentData = shipment.get({ plain: true });

        const response = {
            ...shipmentData,

            items: (shipmentData.InboundShipmentItems || []).map(item => ({
                id: item.id,
                packageType: item.packageType,
                packageQuantity: item.packageQuantity,
                itemNumber: item.itemNumber,
                purchaseOrderId: item.purchaseOrderId,
                status: item.status || null,
                parkedQuantity: item.parkedQuantity ?? 0
            })),

            attachments: (shipmentData.InboundShipmentAttachments || []).map(att => ({
                id: att.id,
                name: att.fileName,
                path: att.filePath,
                type: att.fileType,
                createdAt: att.createdAt
            })),

            vehicles: (shipmentData.InboundVehicleDetails || []).map(v => ({
                ...v,
                vehicleTypeName: v.VehicleType?.name || null
            })),

            // ShelfLocation PK is shelfId (nvarchar) in DB — p.shelfId is already the shelf code string
            parkingRows: (shipmentData.InboundShipmentParkings || []).map(p => ({
                id: p.id,
                shelfId: p.ShelfLocation?.shelfId || p.shelfId,
                aisle: p.ShelfLocation?.aisle || null,
                shelfLevel: p.ShelfLocation?.shelfLevel || null,
                basket: p.ShelfLocation?.basket || null,
                currentOccupancy: p.ShelfLocation?.currentOccupancy ?? null,
                quantity: p.quantity,
                notes: p.notes,
                parkedBy: p.parkedBy,
                parkedAt: p.parkedAt,
                endTime: p.endTime,
                warehouseId: p.warehouseId,
                shipmentItemId: p.shipmentItemId
            })),

            emails: shipmentData.emails
                ? (typeof shipmentData.emails === 'string'
                    ? shipmentData.emails.split(',').map(e => e.trim())
                    : shipmentData.emails)
                : []
        };

        // Remove raw nested arrays to clean the response
        delete response.InboundShipmentItems;
        delete response.InboundShipmentAttachments;
        delete response.InboundVehicleDetails;
        delete response.InboundShipmentParkings;

        res.status(200).json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('=== Error in getInboundShipmentDetail ===');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);

        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching shipment details',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const createInboundShipment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            warehouseId,
            invoiceQuantity,
            shipmentNumber,
            arrivalDate,
            isPlanned,
            isBarcoded,
            remark,
            emails,
            status,
            items,
            attachments,
            vehicles
        } = req.body;

        if (!warehouseId || !invoiceQuantity || !shipmentNumber || !arrivalDate) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!items || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'At least 1 PO item is required' });
        }

        const shipment = await InboundShipment.create({
            warehouseId,
            invoiceQuantity,
            shipmentNumber,
            arrivalDate,
            isPlanned,
            isBarcoded,
            remark,
            emails: Array.isArray(emails) ? emails.join(',') : emails,
            status: status || 'pending'
        }, { transaction });

        if (items && items.length > 0) {
            const shipmentItems = items.map((item, index) => ({
                shipmentNumber,
                packageType: item.packageType,
                packageQuantity: item.packageQty,
                itemNumber: index + 1
            }));
            await InboundShipmentItem.bulkCreate(shipmentItems, { transaction });
        }

        if (attachments && attachments.length > 0) {
            const shipmentAttachments = attachments.map(att => ({
                shipmentNumber,
                fileName: att.name,
                filePath: att.path,
                fileType: att.type
            }));
            await InboundShipmentAttachment.bulkCreate(shipmentAttachments, { transaction });
        }

        if (vehicles && vehicles.length > 0) {
            const shipmentVehicles = vehicles.map(v => ({
                ...v,
                shipmentNumber
            }));
            await InboundVehicleDetail.bulkCreate(shipmentVehicles, { transaction });
        }

        await transaction.commit();
        res.status(201).json(shipment);
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating inbound shipment:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const updateInboundShipment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const {
            warehouseId,
            invoiceQuantity,
            shipmentNumber,
            arrivalDate,
            isPlanned,
            isBarcoded,
            isQualityCheck,
            remark,
            emails,
            status,
            items,
            vehicles
        } = req.body;

        const shipment = await InboundShipment.findOne({ where: { shipmentNumber: id } });
        if (!shipment) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Inbound Shipment not found' });
        }

        await shipment.update({
            warehouseId,
            invoiceQuantity,
            shipmentNumber,
            arrivalDate,
            isPlanned,
            isBarcoded,
            isQualityCheck,
            remark,
            emails: Array.isArray(emails) ? emails.join(',') : emails,
            status: status || shipment.status
        }, { transaction });

        if (items) {
            await InboundShipmentItem.destroy({ where: { shipmentNumber: id }, transaction });
            const shipmentItems = items.map((item, index) => ({
                shipmentNumber: id,
                packageType: item.packageType,
                packageQuantity: item.packageQty,
                itemNumber: index + 1
            }));
            await InboundShipmentItem.bulkCreate(shipmentItems, { transaction });
        }

        if (vehicles) {
            await InboundVehicleDetail.destroy({ where: { shipmentNumber: id }, transaction });
            const shipmentVehicles = vehicles.map(v => ({
                ...v,
                shipmentNumber: id
            }));
            await InboundVehicleDetail.bulkCreate(shipmentVehicles, { transaction });
        }

        await transaction.commit();
        res.json({ message: 'Shipment updated successfully', shipment });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating inbound shipment:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const deleteInboundShipment = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await InboundShipment.destroy({ where: { shipmentNumber: id } });
        if (!result) return res.status(404).json({ message: 'Shipment not found' });
        res.json({ message: 'Shipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting inbound shipment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const parkInboundShipment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { shipmentNumber, shelfId, quantity, notes, parkedBy, parkedAt, endTime, itemNumber } = req.body;

        if (!shipmentNumber || !shelfId) {
            const err = new Error('Shipment Number and Shelf ID are required');
            err.statusCode = 400;
            throw err;
        }

        if (quantity === undefined || quantity === null) {
            const err = new Error('Quantity is required');
            err.statusCode = 400;
            throw err;
        }

        if (!itemNumber) {
            const err = new Error('Item Number is required');
            err.statusCode = 400;
            throw err;
        }

        // 1. Verify shipment exists
        const shipment = await InboundShipment.findByPk(shipmentNumber, {
            attributes: ['shipmentNumber'],
            transaction: t
        });
        if (!shipment) {
            const err = new Error(`Shipment ${shipmentNumber} not found`);
            err.statusCode = 404;
            throw err;
        }

        // 2. Find the exact item row by shipmentNumber + itemNumber
        const item = await InboundShipmentItem.findOne({
            where: { shipmentNumber, itemNumber },
            attributes: ['id', 'itemNumber', 'packageQuantity', 'parkedQuantity', 'status'],
            transaction: t
        });

        if (!item) {
            const err = new Error(`Item ${itemNumber} not found in shipment ${shipmentNumber}`);
            err.statusCode = 404;
            throw err;
        }

        // 3. Validate quantity being parked doesn't exceed remaining
        const currentParkedQty = item.parkedQuantity || 0;
        const newParkedQty = currentParkedQty + quantity;

        if (item.packageQuantity && newParkedQty > item.packageQuantity) {
            const remaining = item.packageQuantity - currentParkedQty;
            const err = new Error(
                `Cannot park ${quantity} units. Only ${remaining} unit(s) remaining out of ${item.packageQuantity} total for item ${itemNumber}`
            );
            err.statusCode = 400;
            throw err;
        }

        // 4. Determine new status based on quantities
        let newStatus = 'Partial';
        if (item.packageQuantity && newParkedQty >= item.packageQuantity) {
            newStatus = 'Fully Parked';
        }

        // 5. Update the item's parked quantity and status
        await item.update({
            parkedQuantity: newParkedQty,
            status: newStatus
        }, { transaction: t });

        // 6. Create the parking entry
        const parkingEntry = await InboundShipmentParking.create({
            shipmentNumber,
            shelfId,
            quantity,
            notes,
            parkedBy: parkedBy || (req.user ? req.user.id : null),
            parkedAt: parkedAt || new Date(),
            endTime,
            shipmentItemId: item.id
        }, { transaction: t });

        // 7. Fetch the full parking entry with item details for response
        const result = await InboundShipmentParking.findByPk(parkingEntry.id, {
            attributes: ['id', 'shipmentNumber', 'shelfId', 'quantity', 'notes', 'parkedBy', 'parkedAt', 'endTime', 'shipmentItemId'],
            include: [{
                model: InboundShipmentItem,
                attributes: ['id', 'itemNumber', 'packageQuantity', 'parkedQuantity', 'status']
            }],
            transaction: t
        });

        await t.commit();

        res.status(201).json({
            message: 'Inbound shipment parked successfully',
            parkingEntry: result
        });

    } catch (error) {
        if (t.finished !== 'commit' && t.finished !== 'rollback') {
            try {
                await t.rollback();
            } catch (rollbackError) {
                console.warn('Rollback skipped (already ended):', rollbackError.message);
            }
        }

        console.error('Error parking inbound shipment:', error);
        const status = error.statusCode || 500;
        res.status(status).json({ message: error.message || 'Internal server error' });
    }
};

export const uploadCrossDockPlan = async (req, res) => {
    try {
        if (!req.file) {
            console.error('No file uploaded');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { shipmentNumber } = req.body;
        if (!shipmentNumber) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'shipmentNumber is required' });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (rows.length === 0) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Excel file is empty' });
        }

        const headers = Object.keys(rows[0]);
        // Updated fixedHeaders to include 'purchaseOrder', 'po/to', 'varaintid', and 'barcode' and handle case-insensitivity
        const fixedHeadersLower = ['purchaseorder', 'variantId', 'size', 'color', 'barcode'];
        const warehouseColumns = headers.filter(h => !fixedHeadersLower.includes(h.toLowerCase().trim()) && h.toLowerCase().trim() !== 'warehouseid');

        const allWarehouses = await Warehouse.findAll({ attributes: ['warehouseId', 'warehouseName'] });
        const warehouseMap = {};
        allWarehouses.forEach(w => {
            warehouseMap[w.warehouseName.toLowerCase().trim()] = w.warehouseId;
        });

        const plansToCreate = [];

        // Helper to find value in row regardless of key case
        const getRowVal = (row, keys) => {
            const foundKey = Object.keys(row).find(k => keys.map(key => key.toLowerCase()).includes(k.toLowerCase().trim()));
            return foundKey ? row[foundKey] : null;
        };

        // Pre-fetch all PO supplierIds for denormalization
        const poSupplierMap = {};

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Extract values using robust lookup
            const purchaseOrderId = getRowVal(row, ['purchaseOrder', 'purchaseOrderId', 'PO/TO'])?.toString();
            const variantIdInput = getRowVal(row, ['variantId', 'varaintId'])?.toString();
            const size = getRowVal(row, ['size'])?.toString();
            const color = getRowVal(row, ['color'])?.toString();
            const barcode = getRowVal(row, ['barcode'])?.toString();

            if (!purchaseOrderId || !variantIdInput) {
                continue;
            }

            // Fetch and cache supplierId from PurchaseOrder for denormalization
            if (!poSupplierMap[purchaseOrderId]) {
                const po = await PurchaseOrder.findByPk(purchaseOrderId, { attributes: ['supplierId'] });
                poSupplierMap[purchaseOrderId] = po ? po.supplierId : null;
            }
            const supplierId = poSupplierMap[purchaseOrderId];
            const variant = await ProductVariant.findOne({
                where: {
                    variantId: variantIdInput.trim(),
                    color: color ? color.trim() : '',
                    size: size ? size.trim() : ''
                },
                attributes: ['productVariantId']
            });

            if (!variant) {
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    message: `Row ${i + 1}: Variant not found`,
                    details: {
                        row: i + 1,
                        variantId: variantIdInput.trim(),
                        color: color ? color.trim() : null,
                        size: size ? size.trim() : null
                    }
                });
            }

            if (row['warehouseId']) {
                const qty = parseInt(row['plannedQuantity'] || row['quantity'] || row['qty'] || 0);
                if (!isNaN(qty) && qty > 0) {
                    plansToCreate.push({
                        shipmentNumber,
                        purchaseOrderId,
                        productVariantId: variant.productVariantId,
                        warehouseId: parseInt(row['warehouseId']),
                        plannedQuantity: qty,
                        status: 'Pending',
                        supplierId,
                        barcode: barcode ? barcode.trim() : ''
                    });
                }
            } else {
                warehouseColumns.forEach(wName => {
                    const qty = parseInt(row[wName]);
                    const wId = warehouseMap[wName.toLowerCase().trim()];

                    if (wId && !isNaN(qty) && qty > 0) {
                        plansToCreate.push({
                            shipmentNumber,
                            purchaseOrderId,
                            productVariantId: variant.productVariantId,
                            warehouseId: wId,
                            plannedQuantity: qty,
                            status: 'Pending',
                            supplierId,
                            barcode: barcode ? barcode.trim() : ''
                        });
                    }
                });
            }
        }

        if (plansToCreate.length > 0) {
            await CrossDockPlan.bulkCreate(plansToCreate);
            // Update crossDockFlag to true for all involved Purchase Orders
            const uniquePoIds = [...new Set(plansToCreate.map(p => p.purchaseOrderId))];
            await PurchaseOrder.update(
                { crossDockFlag: true },
                { where: { purchaseOrderId: uniquePoIds } }
            );
        }

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.json({
            message: 'Cross Dock Plan uploaded successfully',
            recordsProcessed: rows.length,
            recordsInserted: plansToCreate.length
        });

    } catch (error) {
        console.error('Error in uploadCrossDockPlan:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const processCrossDockPlan = async (req, res) => {
    try {
        const { shipmentNumber } = req.body;
        if (!shipmentNumber) {
            return res.status(400).json({ message: 'shipmentNumber is required' });
        }

        const result = await sequelize.query(
            'EXEC [dbo].[sp_ProcessCrossDockPlan] @shipmentNumber = :shipmentNumber',
            {
                replacements: { shipmentNumber },
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({ message: 'Cross Dock Plan Processed successfully', data: result });
    } catch (error) {
        console.error('Error Process cross dock plan:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const createCrossDockTransferOrders = async (req, res) => {
    try {
        const { purchaseOrderId } = req.body;
        if (!purchaseOrderId) {
            return res.status(400).json({ message: 'purchaseOrderId is required' });
        }

        const result = await sequelize.query(
            'EXEC [dbo].[sp_CreateCrossDockTransferOrders] @purchaseOrderId = :purchaseOrderId',
            {
                replacements: { purchaseOrderId },
                type: sequelize.QueryTypes.SELECT
            }
        );

        res.json({ message: 'Cross Dock Transfer Orders created successfully', data: result });
    } catch (error) {
        console.error('Error creating cross dock transfer orders:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
