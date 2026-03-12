const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAllPutaways,
    getPutawayDetail,
    createPutaway,
    // scanPutawayItem,
    bulkCreatePutaways,
    assignPickerToPutaway,
    completePutawayTask
} = require('../controllers/putawayController');

router.use(protect);

router.get('/', getAllPutaways);
router.post('/', createPutaway);
router.post('/bulk', bulkCreatePutaways);
router.patch('/assign-picker', assignPickerToPutaway);
router.get('/:id', getPutawayDetail);
// router.post('/:id/scan', scanPutawayItem);
router.patch('/:id/complete', completePutawayTask);

module.exports = router;