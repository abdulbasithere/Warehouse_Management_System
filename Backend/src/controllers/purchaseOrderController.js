import { PurchaseOrder, Supplier, PurchaseOrderLineItem, ProductVariant, Product, Warehouse, PurchaseOrderActivity, User, InboundShipment, UnitsOfMeasure, PoTracker, InboundShipmentItem, InboundVehicleDetail } from '../models/setupModels.js';
import { Op } from 'sequelize';
import sequelize from '../utils/db.js';

export const getAllPurchaseOrders = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 20,
            purchaseOrderId,
            createdDate,
            warehouseName,
            vendorName
        } = req.query;

        const offset = (page - 1) * pageSize;
        const poWhere = {};
        const supplierWhere = {};
        const warehouseWhere = {};

        // Filter by Purchase Order ID
        if (purchaseOrderId) {
            poWhere.purchaseOrderId = { [Op.like]: `%${purchaseOrderId}%` };
        }

        // Filter by Created Date (full day range)
        if (createdDate) {
            poWhere.createdAt = {
                [Op.between]: [
                    new Date(new Date(createdDate).setHours(0, 0, 0, 0)),
                    new Date(new Date(createdDate).setHours(23, 59, 59, 999))
                ]
            };
        }

        // Filter by Warehouse Name
        if (warehouseName) {
            warehouseWhere.warehouseName = { [Op.like]: `%${warehouseName}%` };
        }

        // Filter by Vendor Name (on Supplier model)
        if (vendorName) {
            supplierWhere.name = { [Op.like]: `%${vendorName}%` };
        }

        const { count, rows: pos } = await PurchaseOrder.findAndCountAll({
            where: poWhere,
            attributes: ['purchaseOrderId', 'expectedDate', 'crossDockFlag', 'purchaseOrderQuantity', 'totalProducts', 'status', 'createdAt'],
            include: [
                {
                    model: Supplier,
                    attributes: ['name'],
                    where: Object.keys(supplierWhere).length ? supplierWhere : undefined,
                    required: Object.keys(supplierWhere).length > 0
                },
                {
                    model: Warehouse,
                    attributes: ['warehouseName'],
                    where: Object.keys(warehouseWhere).length ? warehouseWhere : undefined,
                    required: Object.keys(warehouseWhere).length > 0
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            distinct: true
        });

        const formattedPos = pos.map(po => ({
            purchaseOrderId: po.purchaseOrderId,
            vendorName: po.Supplier ? po.Supplier.name : '-',
            expectedDate: po.expectedDate,
            allocationPlan: po.crossDockFlag ? 'ALLOCATED' : 'PENDING',
            totalQty: po.purchaseOrderQuantity,
            items: po.totalProducts,
            status: po.status,
            warehouseName: po.Warehouse ? po.Warehouse.warehouseName : '-',
            createdAt: po.createdAt
        }));

        res.json({
            data: formattedPos,
            total: count,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPurchaseOrderByNumber = async (req, res) => {
    try {
        const { poNumber } = req.params;
        const po = await PurchaseOrder.findOne({
            where: { purchaseOrderId: poNumber },
            attributes: [
                'purchaseOrderId', 'supplierId', 'status', 'totalProducts',
                'totalAmount', 'purchaseOrderQuantity', 'supplierBillQuantity',
                'supplierBillNumber', 'receivingWarehouseId', 'expectedDate',
                'arrivalDate', 'createdAt', 'tags', 'notes', 'crossDockFlag', 'inboundShipment'
            ],
            include: [
                { model: Supplier, attributes: ['name'] },
                {
                    model: PurchaseOrderLineItem,
                    attributes: ['lineItemId', 'purchaseOrderId', 'productVariantId', 'quantity', 'receiveQuantity', 'unitPrice', 'subtotal', 'productId'],
                    include: [
                        {
                            model: ProductVariant,
                            attributes: ['variantId', 'color', 'size'],
                            include: [
                                { model: Product, attributes: ['name'] },
                                { model: UnitsOfMeasure, attributes: ['unitName'] }
                            ]
                        }
                    ]
                },
                { model: Warehouse, attributes: ['warehouseName'] }
            ]
        });

        if (!po) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        res.json(po);
    } catch (error) {
        console.error('Error fetching purchase order details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePurchaseOrder = async (req, res) => {
    try {
        const { poNumber } = req.params;
        const updateData = req.body;

        const po = await PurchaseOrder.findOne({
            where: { purchaseOrderId: poNumber },
            include: [{ model: PoTracker, attributes: ['trackerSubStatus'] }]
        });
        if (!po) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        // Map totalUnits to purchaseOrderQuantity if provided
        if (updateData.totalUnits !== undefined && updateData.purchaseOrderQuantity === undefined) {
            updateData.purchaseOrderQuantity = updateData.totalUnits;
        }

        // List of fields that can be updated
        const allowedFields = [
            'totalProducts', 'totalAmount', 'purchaseOrderQuantity',
            'expectedDate', 'tags', 'notes', 'crossDockFlag',
            'supplierBillQuantity', 'supplierBillNumber', 'arrivalDate'
        ];

        let hasChanges = false;
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                po[field] = updateData[field];
                hasChanges = true;
            }
        });

        if (hasChanges) {
            await po.save();

            // Create activity log for the update
            await PurchaseOrderActivity.create({
                purchaseOrderId: po.purchaseOrderId,
                status: po.status,
                subStatus: po.PoTracker?.trackerSubStatus || null,
                userId: req.user ? req.user.id : null,
                remarks: updateData.remarks || 'Purchase Order updated'
            });
        }

        // Fetch updated PO with activities
        const updatedPo = await PurchaseOrder.findOne({
            where: { purchaseOrderId: poNumber },
            attributes: [
                'purchaseOrderId', 'status', 'totalProducts', 'totalAmount',
                'purchaseOrderQuantity', 'expectedDate', 'tags', 'notes',
                'crossDockFlag', 'supplierBillQuantity', 'supplierBillNumber', 'arrivalDate', 'createdAt'
            ],
            include: [
                {
                    model: PurchaseOrderActivity,
                    attributes: ['id', 'status', 'subStatus', 'remarks', 'createdAt'],
                    include: [{ model: User, attributes: ['fullName'] }]
                }
            ],
            order: [[PurchaseOrderActivity, 'createdAt', 'DESC']]
        });

        res.json(updatedPo);
    } catch (error) {
        console.error('Error updating purchase order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createPurchaseOrderActivity = async (req, res) => {
    try {
        const { poNumber } = req.params;
        const { status, subStatus, remarks } = req.body;

        const po = await PurchaseOrder.findOne({
            where: { purchaseOrderId: poNumber },
            attributes: ['purchaseOrderId', 'status'],
            include: [{ model: PoTracker, attributes: ['trackerSubStatus'] }]
        });

        if (!po) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        const activity = await PurchaseOrderActivity.create({
            purchaseOrderId: poNumber,
            status: status || po.status,
            subStatus: subStatus || po.PoTracker?.trackerSubStatus,
            userId: req.user ? req.user.id : null,
            remarks
        });

        // Update PoTracker status and subStatus instead of PurchaseOrder status
        if (po.PoTracker) {
            if (status) po.PoTracker.trackerStatus = status;
            if (subStatus) po.PoTracker.trackerSubStatus = subStatus;
            await po.PoTracker.save();
        } else {
            // If PoTracker doesn't exist, create it
            await PoTracker.create({
                purchaseOrderId: poNumber,
                trackerStatus: status,
                trackerSubStatus: subStatus
            });
        }

        res.status(201).json(activity);
    } catch (error) {
        console.error('Error creating purchase order activity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPOTrackerData = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 20,
            search = '',
            date,
            trackerStatus
        } = req.query;

        const offset = (page - 1) * pageSize;

        const poWhere = {};
        const trackerWhere = {};

        if (date) {
            poWhere.createdAt = {
                [Op.between]: [
                    new Date(new Date(date).setHours(0, 0, 0, 0)),
                    new Date(new Date(date).setHours(23, 59, 59, 999))
                ]
            };
        }
        if (search) {
            poWhere.purchaseOrderId = { [Op.like]: `%${search}%` };
        }

        if (trackerStatus) {
            trackerWhere.trackerStatus = { [Op.like]: `%${trackerStatus}%` };
        }

        const { count, rows: pos } = await PurchaseOrder.findAndCountAll({
            where: poWhere,
            attributes: ['purchaseOrderId', 'expectedDate', 'purchaseOrderQuantity', 'createdAt'],
            include: [
                {
                    model: Supplier,
                    attributes: ['name']
                },
                {
                    model: Warehouse,
                    attributes: ['warehouseName']
                },
                {
                    model: PoTracker,
                    attributes: ['trackerStatus'],
                    where: Object.keys(trackerWhere).length ? trackerWhere : undefined,
                    required: Object.keys(trackerWhere).length > 0
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            distinct: true
        });

        const formattedPOs = pos.map(po => ({
            poNumber: po.purchaseOrderId,
            Vendor: po.Supplier?.name || 'Unknown',
            ExptectedDate: po.expectedDate,
            TotalQuantity: po.purchaseOrderQuantity,
            Status: po.PoTracker?.trackerStatus || "None",
            Warhouse: po.Warehouse?.warehouseName || 'Unknown',
            createdAt: po.createdAt
        }));

        res.json({
            data: {
                PurchaseOrders: formattedPOs,
                total: count,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }
        });

    } catch (error) {
        console.error('Error fetching PO tracker data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPOTrackerDetails = async (req, res) => {
    try {
        const { poNumber: rawPoNumber } = req.params;
        const poNumber = rawPoNumber ? rawPoNumber.trim() : rawPoNumber;

        const po = await PurchaseOrder.findOne({
            where: { purchaseOrderId: poNumber },
            attributes: [
                'purchaseOrderId', 'totalProducts', 'purchaseOrderQuantity', 'totalAmount',
                'createdAt', 'expectedDate', 'status', 'tags', 'notes', 'crossDockFlag',
                'inboundShipment', 'supplierBillQuantity', 'supplierBillNumber', 'arrivalDate'
            ],
            include: [
                { model: Supplier, attributes: ['name'] },
                { model: Warehouse, attributes: ['warehouseName'] },
                {
                    model: PoTracker,
                    attributes: [
                        'trackerStatus', 'trackerSubStatus', 'departmentReceiver',
                        'withSupplier', 'verifiedByLp', 'verifiedByAudit',
                        'ConsiderDate', 'responsibleSupervisor', 'SampleMovementDate',
                        'packer', 'googleLens', 'parkLocation', 'ShipmentConsiderDate',
                        'ChinaCarry', 'billFrom', 'invoiceSubmittedDate', 'CommittedDate',
                        'billSubmittedDate', 'editLines', 'SignatureRequired',
                        'brand', 'division', 'merchandiser', 'department'
                    ]
                },
                {
                    model: InboundShipment,
                    attributes: ['shipmentNumber', 'status', 'totalDeliveries', 'arrivalDate'],
                    include: [
                        {
                            model: InboundVehicleDetail,
                            attributes: ['id', 'vehicleNumber', 'driverName', 'driverContact', 'deliveryNumber', 'vehicleTypeId', 'timeIn', 'timeOut']
                        }
                    ]
                },
                {
                    model: InboundShipmentItem,
                    where: { purchaseOrderId: poNumber },
                    required: false,
                    attributes: ['id', 'shipmentNumber', 'packageType', 'packageQuantity', 'itemNumber', 'purchaseOrderId', 'vehicleDetailId', 'status', 'parkedQuantity'],
                    include: [
                        {
                            model: InboundVehicleDetail,
                            attributes: ['id', 'vehicleNumber', 'driverName', 'driverContact', 'deliveryNumber', 'timeIn', 'timeOut']
                        }
                    ]
                },
                {
                    model: PurchaseOrderActivity,
                    attributes: ['id', 'status', 'subStatus', 'remarks', 'createdAt'],
                    include: [{ model: User, attributes: ['fullName', 'userId'] }]
                }
            ],
            order: [[PurchaseOrderActivity, 'createdAt', 'DESC']]
        });

        if (!po) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        const poJson = po.toJSON();
        const tracker = poJson.PoTracker || {};
        const shipment = poJson.InboundShipment || {};
        const shipmentItems = poJson.InboundShipmentItems || [];

        const response = {
            // ── Purchase Order fields ────────────────────────────────
            poNumber: po.purchaseOrderId,
            totalProducts: po.totalProducts,
            totalUnits: po.purchaseOrderQuantity,
            totalAmount: po.totalAmount,
            orderDate: po.createdAt
                ? new Date(po.createdAt).toISOString().split('T')[0]
                : null,
            expectedDate: po.expectedDate,
            status: po.status,
            tags: po.tags || null,
            notes: po.notes || null,
            crossDockFlag: po.crossDockFlag,
            inboundShipment: po.inboundShipment || null,
            supplierBillQuantity: po.supplierBillQuantity || null,
            supplierBillNumber: po.supplierBillNumber || null,
            arrivalDate: po.arrivalDate || null,

            // ── Related entities ─────────────────────────────────────
            vendor: po.Supplier?.name || null,
            warehouse: po.Warehouse?.warehouseName || null,

            // ── Inbound Shipment fields ──────────────────────────────
            division: tracker.division || null,
            brand: tracker.brand || null,
            merchandiser: tracker.merchandiser || null,
            totalDeliveries: shipment.totalDeliveries ?? null,
            shipmentArrivalDate: shipment.arrivalDate || null,
            shipmentNumber: shipment.shipmentNumber || null,
            shipmentStatus: shipment.status || null,
            vehicleDetails: shipment.InboundVehicleDetails || [],

            // ── PO Tracker fields ────────────────────────────────────
            trackerStatus: tracker.trackerStatus || null,
            trackerSubStatus: tracker.trackerSubStatus || null,
            departmentReceiver: tracker.departmentReceiver || null,
            withSupplier: tracker.withSupplier ?? null,
            verifiedByLp: tracker.verifiedByLp ?? null,
            verifiedByAudit: tracker.verifiedByAudit ?? null,
            consideredDate: tracker.ConsiderDate || null,
            responsibleSupervisor: tracker.responsibleSupervisor || null,
            sampleMovementDate: tracker.SampleMovementDate || null,
            packer: tracker.packer || null,
            googleLens: tracker.googleLens ?? null,
            parkLocation: tracker.parkLocation || null,
            shipmentConsiderDate: tracker.ShipmentConsiderDate || null,
            chinaCarry: tracker.ChinaCarry || null,
            billFrom: tracker.billFrom || null,
            invoiceSubmittedDate: tracker.invoiceSubmittedDate || null,
            committedDate: tracker.CommittedDate || null,
            billSubmittedDate: tracker.billSubmittedDate || null,
            editLines: tracker.editLines ?? null,
            merchandiserName: tracker.merchandiser || null,
            signatureRequired: tracker.SignatureRequired ?? false,
            department: tracker.department || null,

            // ── Shipment items (filtered by this PO) ─────────────────
            shipmentItems,

            // ── Activities ──────────────────────────────────────────
            activities: poJson.PurchaseOrderActivities || []
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching PO tracker details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePOStatus = async (req, res) => {
    try {
        const { poNumber } = req.params;
        const { status } = req.body;

        const po = await PurchaseOrder.findOne({
            where: { purchaseOrderId: poNumber },
            attributes: ['purchaseOrderId', 'status']
        });
        if (!po) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        if (status) po.status = status;

        await po.save();

        // Create activity log
        await PurchaseOrderActivity.create({
            purchaseOrderId: po.purchaseOrderId,
            status: status || po.status,
            userId: req.user ? req.user.id : null
        });

        res.json({ message: 'PO status updated successfully', po });
    } catch (error) {
        console.error('Error updating PO status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePOTrackerDetails = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { poNumber } = req.params;
        const data = req.body;

        if (!poNumber) {
            await transaction.rollback();
            return res.status(400).json({ message: 'PO Number is required' });
        }

        // Find or Create PoTracker for this PO
        let [tracker, created] = await PoTracker.findOrCreate({
            where: { purchaseOrderId: poNumber },
            defaults: { purchaseOrderId: poNumber },
            transaction
        });

        // Map incoming data fields to PoTracker model fields
        const updateData = {
            trackerStatus: data.trackerStatus,
            trackerSubStatus: data.trackerSubStatus,
            departmentReceiver: data.departmentReceiver,
            withSupplier: data.withSupplier,
            verifiedByLp: data.verifiedByLp,
            verifiedByAudit: data.verifiedByAudit,
            ConsiderDate: data.consideredDate,
            responsibleSupervisor: data.responsibleSupervisor,
            SampleMovementDate: data.sampleMovementDate,
            packer: data.packer,
            googleLens: data.googleLens,
            parkLocation: data.parkLocation,
            ShipmentConsiderDate: data.shipmentConsiderDate,
            ChinaCarry: data.chinaCarry,
            billFrom: data.billFrom,
            invoiceSubmittedDate: data.invoiceSubmittedDate,
            CommittedDate: data.committedDate,
            billSubmittedDate: data.billSubmittedDate,
            editLines: data.editLines,
            SignatureRequired: data.signatureRequired !== undefined ? (data.signatureRequired === true || data.signatureRequired === 'true') : undefined,
            brand: data.brand,
            division: data.division,
            merchandiser: data.merchandiser !== undefined ? data.merchandiser : data.merchandiserName,
            department: data.department
        };

        // Remove undefined fields so they don't overwrite with null unless explicitly sent
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        await tracker.update(updateData, { transaction });

        await transaction.commit();

        res.json({
            message: 'PO Tracker details updated successfully',
            data: tracker
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error updating PO tracker details:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
