const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', purchaseOrderController.getAllPurchaseOrders);
router.get('/tracker/data', purchaseOrderController.getPOTrackerData);
router.get('/tracker/details/:poNumber', purchaseOrderController.getPOTrackerDetails);
router.get('/:poNumber', purchaseOrderController.getPurchaseOrderByNumber);
router.patch('/:poNumber', purchaseOrderController.updatePurchaseOrder);
router.patch('/:poNumber/status', purchaseOrderController.updatePOStatus);
router.patch('/tracker/details/:poNumber', purchaseOrderController.updatePOTrackerDetails);
router.post('/:poNumber/activities', purchaseOrderController.createPurchaseOrderActivity);

module.exports = router;

