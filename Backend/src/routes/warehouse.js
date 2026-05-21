const express = require('express');
const router = express.Router();
const {
    getAllWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse
} = require('../controllers/warehouseController');

router.get('/', getAllWarehouses);
router.get('/:id', getWarehouseById);
router.post('/', createWarehouse);
router.patch('/:id', updateWarehouse);
router.delete('/:id', deleteWarehouse);

module.exports = router;
