const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/overview', requireRoles('admin'), reportController.getAdminOverview);

module.exports = router;
