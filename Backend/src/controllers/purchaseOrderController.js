const { PurchaseOrder, Supplier, PurchaseOrderLineItem, ProductVariant, Product, Warehouse } = require('../models/setupModels');

const getAllPurchaseOrders = async (req, res) => {
    try {
        const pos = await PurchaseOrder.findAll({
            include: [
                { model: Supplier, attributes: ['Name'] },
                { model: Warehouse, attributes: ['CompanyName'] }
            ],
            order: [['CreateDate', 'DESC']]
        });
        res.json(pos);
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getPurchaseOrderByNumber = async (req, res) => {
    try {
        const { poNumber } = req.params;
        const po = await PurchaseOrder.findOne({
            where: { Number: poNumber },
            include: [
                { model: Supplier, attributes: ['Name'] },
                {
                    model: PurchaseOrderLineItem,
                    include: [
                        {
                            model: ProductVariant,
                            include: [{ model: Product, attributes: ['Name'] }]
                        }
                    ]
                },
                { model: Warehouse, attributes: ['CompanyName'] }
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

const updatePurchaseOrderStatus = async (req, res) => {
    try {
        const { poNumber } = req.params;
        const { status } = req.body;

        const po = await PurchaseOrder.findOne({ where: { Number: poNumber } });
        if (!po) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        po.Status = status;
        await po.save();

        res.json({ message: 'Purchase Order status updated successfully', po });
    } catch (error) {
        console.error('Error updating purchase order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllPurchaseOrders,
    getPurchaseOrderByNumber,
    updatePurchaseOrderStatus
};
