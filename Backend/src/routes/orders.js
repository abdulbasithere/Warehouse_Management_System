const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderDetail, insertOrder, getOrderByNumber, processReturn } = require('../controllers/orderController');

router.get('/', getAllOrders);
router.post('/insert', insertOrder);
router.get('/search/:orderNumber', getOrderByNumber);
router.post('/:orderNumber/return', processReturn);
router.get('/:id', getOrderDetail);

module.exports = router;