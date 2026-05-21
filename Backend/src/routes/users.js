const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    deactivateUser,
    activateUser,
    resetPassword,
    bulkCreateUsers
} = require('../controllers/userController');

// TODO: Add admin-only middleware
router.get('/', getAllUsers);
router.post('/bulk-create', upload.single('file'), bulkCreateUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

// Role-specific actions
router.patch('/:id/deactivate', deactivateUser);
router.patch('/:id/activate', activateUser);
router.post('/:id/reset-password', resetPassword);

module.exports = router;