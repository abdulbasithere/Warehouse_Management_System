const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/auth');
const {
    getAllInboundShipments,
    getInboundShipmentDetail,
    createInboundShipment,
    updateInboundShipment,
    deleteInboundShipment,
    uploadCrossDockPlan,
    parkInboundShipment,
    processCrossDockPlan,
    createCrossDockTransferOrders
} = require('../controllers/inboundShipmentController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// router.use(protect);

router.get('/', getAllInboundShipments);
router.get('/:id', getInboundShipmentDetail);
router.post('/', createInboundShipment);
router.put('/:id', updateInboundShipment);
router.delete('/:id', deleteInboundShipment);
router.post('/upload-cross-dock-plan', upload.single('file'), uploadCrossDockPlan);
router.post('/park', parkInboundShipment);
router.post('/process-cross-dock-plan', processCrossDockPlan);
router.post('/create-cross-dock-transfer-orders', createCrossDockTransferOrders);

module.exports = router;
