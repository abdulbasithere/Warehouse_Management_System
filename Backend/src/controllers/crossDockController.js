import { CrossDockPlan, ProductVariant, Warehouse, ProductBarcode } from '../models/setupModels.js';

export const getCrossDockLinesByShipment = async (req, res) => {
    try {
        const { shipmentNumber } = req.params;

        const lines = await CrossDockPlan.findAll({
            where: { shipmentNumber },
            attributes: [
                'planId',
                'purchaseOrderId',
                'productVariantId',
                'plannedQuantity',
                'scannedQuantity',
                'status',
                'barcode'
            ],
            include: [
                {
                    model: ProductVariant,
                    attributes: ['variantId', 'color', 'size'],
                    include: [
                        {
                            model: ProductBarcode,
                            attributes: ['barcode', 'isActive', 'description'],
                            where: { isActive: true },   // inactive barcodes filter out
                            required: false              // LEFT JOIN — barcode na ho toh bhi aaye
                        }
                    ]
                },
                {
                    model: Warehouse,
                    attributes: ['warehouseName']
                }
            ],
            order: [['createdAt', 'ASC']],
            raw: false   // explicitly false — nested includes ke liye zaroori
        });

        if (!lines.length) {
            return res.status(404).json({ message: 'No cross dock lines found for this shipment' });
        }

        const uniquePOs = new Set();

        const formattedLines = lines.map(line => {
            if (line.purchaseOrderId) uniquePOs.add(line.purchaseOrderId);

            return {
                crossDockPlanId: line.planId,
                productVariantId: line.productVariantId,
                variantId: line.ProductVariant?.variantId ?? null,
                color: line.ProductVariant?.color ?? null,
                size: line.ProductVariant?.size ?? null,
                barcodes: line.ProductVariant?.ProductBarcodes ?? [],
                warehouseName: line.Warehouse?.warehouseName ?? null,
                plannedQuantity: line.plannedQuantity,
                scannedQuantity: line.scannedQuantity,
                status: line.status,
                purchaseOrderId: line.purchaseOrderId,  // frontend ko chahiye ho toh
                barcode: line.barcode ?? ''
            };
        });

        res.json({
            shipmentNumber,
            purchaseOrders: Array.from(uniquePOs),
            totalLines: formattedLines.length,
            lines: formattedLines
        });

    } catch (error) {
        console.error('Error fetching cross dock lines:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateScannedQuantity = async (req, res) => {
    try {
        const {
            shipmentNumber,
            purchaseOrderId,
            warehouseName,
            productVariantId,
            scannedQuantity
        } = req.body;

        if (!shipmentNumber || !purchaseOrderId || !warehouseName || !productVariantId) {
            return res.status(400).json({ message: 'Missing required identification fields' });
        }

        if (scannedQuantity === undefined) {
            return res.status(400).json({ message: 'Scanned quantity is required' });
        }

        const warehouse = await Warehouse.findOne({ where: { warehouseName }, attributes: ['warehouseId'] });
        if (!warehouse) {
            return res.status(404).json({ message: `Warehouse '${warehouseName}' not found` });
        }

        const plan = await CrossDockPlan.findOne({
            where: {
                shipmentNumber,
                purchaseOrderId,
                warehouseId: warehouse.warehouseId,
                productVariantId
            },
            attributes: ['planId', 'shipmentNumber', 'purchaseOrderId', 'productVariantId', 'plannedQuantity', 'scannedQuantity', 'status']
        });

        if (!plan) {
            return res.status(404).json({ message: 'Cross dock plan line not found' });
        }

        let newStatus = 'Pending';
        if (scannedQuantity >= plan.plannedQuantity) {
            newStatus = 'Scanned';
        }

        await plan.update({
            scannedQuantity,
            status: newStatus
        });

        res.json({
            message: 'Scanned quantity updated successfully',
            plan: {
                shipmentNumber: plan.shipmentNumber,
                purchaseOrderId: plan.purchaseOrderId,
                productVariantId: plan.productVariantId,
                scannedQuantity: plan.scannedQuantity,
                status: plan.status
            }
        });
    } catch (error) {
        console.error('Error updating scanned quantity:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const updatePlannedQuantity = async (req, res) => {
    try {
        const {
            purchaseOrderId,
            warehouseName,
            productVariantId,
            plannedQuantity,
            scannedQuantity,
            shipmentNumber
        } = req.body;

        if (!purchaseOrderId || !warehouseName || !productVariantId || !shipmentNumber) {
            return res.status(400).json({ message: 'Missing required identification fields' });
        }

        const warehouse = await Warehouse.findOne({ where: { warehouseName }, attributes: ['warehouseId'] });
        if (!warehouse) {
            return res.status(404).json({ message: `Warehouse '${warehouseName}' not found` });
        }

        const plan = await CrossDockPlan.findOne({
            where: {
                purchaseOrderId,
                warehouseId: warehouse.warehouseId,
                productVariantId,
                shipmentNumber
            },
            attributes: ['planId', 'shipmentNumber', 'purchaseOrderId', 'productVariantId', 'plannedQuantity', 'scannedQuantity', 'status']
        });

        if (!plan) {
            return res.status(404).json({ message: 'Cross dock plan line not found' });
        }

        // Determine new values (use body values if provided, otherwise existing values)
        const newPlanned = plannedQuantity !== undefined ? parseInt(plannedQuantity) : plan.plannedQuantity;
        const newScanned = scannedQuantity !== undefined ? parseInt(scannedQuantity) : plan.scannedQuantity;

        // Validation: Planned must be >= Scanned
        if (newPlanned < newScanned) {
            return res.status(400).json({
                message: `Planned quantity (${newPlanned}) cannot be less than scanned quantity (${newScanned})`
            });
        }

        await plan.update({
            plannedQuantity: newPlanned,
            scannedQuantity: newScanned,
            status: 'Pending'
        });

        res.json({
            message: 'Cross dock plan updated successfully',
            plan: {
                shipmentNumber: plan.shipmentNumber,
                purchaseOrderId: plan.purchaseOrderId,
                productVariantId: plan.productVariantId,
                plannedQuantity: plan.plannedQuantity,
                scannedQuantity: plan.scannedQuantity,
                status: plan.status
            }
        });
    } catch (error) {
        console.error('Error updating cross dock plan:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


