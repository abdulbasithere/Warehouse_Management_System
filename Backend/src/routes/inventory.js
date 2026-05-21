const express = require('express');
const router = express.Router();
const { createAdjustment, getAdjustments } = require('../controllers/inventoryAdjustmentController');
const { protect, authorize } = require('../middleware/auth');

// Middleware to ensure only MASTER (admin) can access these routes
router.use(protect);
router.use(authorize('MASTER'));

router.post('/adjust', createAdjustment);
router.get('/history', getAdjustments);

module.exports = router;
