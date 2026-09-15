const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', requireRoles('admin'), feeController.getAllFees);
router.get('/student/:studentId?', feeController.getStudentFees);
router.post('/:id/pay', requireRoles('admin', 'parent', 'student'), feeController.payFee);

module.exports = router;
