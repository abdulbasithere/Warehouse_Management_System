const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createTransferOrder,
    shipOrder,
    receiveOrder,
    cancelOrder,
    getAllTransferOrders,
    getTransferOrderById
} = require('../controllers/transferOrderController');

// All routes require authentication
router.use(protect);

router.get('/', getAllTransferOrders);
router.get('/:id', getTransferOrderById);
router.post('/', createTransferOrder);
router.post('/:id/ship', shipOrder);
router.post('/:id/receive', receiveOrder);
router.post('/:id/cancel', cancelOrder);

module.exports = router;
