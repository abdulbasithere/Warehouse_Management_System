const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    bulkCreateProducts
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Bulk actions
router.post('/bulk-delete', bulkDeleteProducts);
router.post('/bulk-create', upload.single('file'), bulkCreateProducts);

module.exports = router;