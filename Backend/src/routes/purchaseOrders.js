const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');

router.get('/', purchaseOrderController.getAllPurchaseOrders);
router.get('/:poNumber', purchaseOrderController.getPurchaseOrderByNumber);
router.patch('/:poNumber/status', purchaseOrderController.updatePurchaseOrderStatus);

module.exports = router;
