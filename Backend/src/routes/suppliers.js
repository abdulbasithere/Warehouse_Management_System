const express = require('express');
const router = express.Router();
// const { protect } = require('../middleware/auth');
const {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
} = require('../controllers/supplierController');

// router.use(protect);

router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.post('/', createSupplier);
router.patch('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

module.exports = router;
