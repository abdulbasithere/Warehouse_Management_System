const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    bulkCreateProducts,
    getProducts,
    getVariants,
    getBarcodes,
    getProductById,
    getProductFullDetails,
    bulkUpdateBarcodeStatus,
    bulkCreateVariants,
    bulkCreateBarcodes
} = require('../controllers/productController');

// router.get('/', getAllProducts);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

router.get('/', getProducts);
router.get('/variants', getVariants);
router.get('/barcodes', getBarcodes);
router.get('/:id', getProductById);
router.get('/:id/info', getProductFullDetails);
// Bulk actions
router.post('/bulk-delete', bulkDeleteProducts);
router.post('/bulk-create', upload.single('file'), bulkCreateProducts);
router.post('/bulk-create-variants', upload.single('file'), bulkCreateVariants);
router.post('/bulk-create-barcodes', upload.single('file'), bulkCreateBarcodes);
router.post('/bulk-barcode-status', bulkUpdateBarcodeStatus);

module.exports = router;