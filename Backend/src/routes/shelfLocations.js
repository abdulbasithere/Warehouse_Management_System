const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
    getShelfLocations,
    createShelfLocation,
    bulkCreateShelfLocations
} = require('../controllers/shelfLocationController');

router.get('/', getShelfLocations);
router.post('/', createShelfLocation);
router.post('/bulk-create', upload.single('file'), bulkCreateShelfLocations);

module.exports = router;
