const express = require('express');
const router = express.Router();
const zohoController = require('../controllers/zohoController');
const verifyToken = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/rbac');

// All Zoho routes require valid portal JWT authentication
router.use(verifyToken);

// List authorized Zoho services for current user
router.get('/apps', zohoController.getAuthorizedApps);

// Zoho People: accessible by Admin and HR
router.get('/people', verifyRole(['Admin', 'HR']), zohoController.getPeopleData);

// Zoho CRM: accessible by Admin and Sales
router.get('/crm', verifyRole(['Admin', 'Sales']), zohoController.getCrmData);

// Zoho Desk: accessible by Admin and Support
router.get('/desk', verifyRole(['Admin', 'Support']), zohoController.getDeskData);

// Zoho Books: accessible by Admin and Finance
router.get('/books', verifyRole(['Admin', 'Finance']), zohoController.getBooksData);

// Diagnostic test: Admin only
router.get('/test-connection', verifyRole(['Admin']), zohoController.testConnection);

module.exports = router;
