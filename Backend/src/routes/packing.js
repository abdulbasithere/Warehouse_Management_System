const express = require('express');
const router = express.Router();
const {
    getPackingQueue,
    getPackingJobDetail,
    scanPackItem,
    completePacking,
    fetchBasketPacking,
    scanBasketItem,
    completeBasketPacking
} = require('../controllers/packingController');

router.get('/queue', getPackingQueue);
router.get('/job/:so', getPackingJobDetail);
router.post('/job/:so/scan', scanPackItem);
router.post('/job/:so/complete', completePacking);

router.get('/basket/:basket', fetchBasketPacking);
router.post('/basket/:basket/scan', scanBasketItem);
router.post('/basket/:basket/complete', completeBasketPacking);

module.exports = router;