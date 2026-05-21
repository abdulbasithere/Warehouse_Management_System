const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
    getShelfLocations,
    getShelfLocationById,
    createShelfLocation,
    updateShelfLocation,
    deleteShelfLocation,
    bulkCreateShelfLocations,
    getCrossDockShelves
} = require('../controllers/shelfLocationController');

router.get('/cross-dock', getCrossDockShelves);
router.get('/', getShelfLocations);
router.get('/:id', getShelfLocationById);
router.post('/', createShelfLocation);
router.put('/:id', updateShelfLocation);
router.delete('/:id', deleteShelfLocation);
router.post('/bulk-create', upload.single('file'), bulkCreateShelfLocations);

module.exports = router;
