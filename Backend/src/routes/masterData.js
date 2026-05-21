const express = require('express');
const router = express.Router();
const {
    getAllDepartments,
    createDepartment,
    deleteDepartment,
    getAllVehicleTypes,
    createVehicleType,
    deleteVehicleType
} = require('../controllers/masterDataController');

// Departments
router.get('/departments', getAllDepartments);
router.post('/departments', createDepartment);
router.delete('/departments/:id', deleteDepartment);

// Vehicle Types
router.get('/vehicle-types', getAllVehicleTypes);
router.post('/vehicle-types', createVehicleType);
router.delete('/vehicle-types/:id', deleteVehicleType);

module.exports = router;
