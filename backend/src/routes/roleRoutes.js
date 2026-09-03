const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const verifyToken = require('../middlewares/auth');

router.use(verifyToken);
router.get('/', roleController.getRoles);
router.get('/permissions', roleController.getPermissions);

module.exports = router;
