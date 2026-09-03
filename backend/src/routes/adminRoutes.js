const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/rbac');

// All Admin routes require authenticated Admin role
router.use(verifyToken);
router.use(verifyRole(['Admin']));

// User management endpoints
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Audit logs & System stats
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/stats', adminController.getSystemStats);

module.exports = router;
