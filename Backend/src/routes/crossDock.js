const express = require('express');
const router = express.Router();
const {
    getCrossDockLinesByShipment,
    updateScannedQuantity,
    updatePlannedQuantity
} = require('../controllers/crossDockController');

// Get all cross dock plan lines for a specific shipment
router.get('/lines/:shipmentNumber', getCrossDockLinesByShipment);
router.put('/scan', updateScannedQuantity);
router.put('/planned-quantity', updatePlannedQuantity);

module.exports = router;
