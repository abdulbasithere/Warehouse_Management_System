const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAllPickLists,
    getPickListDetail,
    createPickList,
    assignBasket,
    scanPickItem,
    finalizePickList
} = require('../controllers/picklistController');

router.get('/', protect, getAllPickLists);
router.post('/', protect, createPickList);
router.get('/:id', protect, getPickListDetail);
router.post('/:id/assign-basket', protect, assignBasket);
router.post('/:id/scan', protect, scanPickItem);
router.post('/:id/finalize', protect, finalizePickList);

module.exports = router;