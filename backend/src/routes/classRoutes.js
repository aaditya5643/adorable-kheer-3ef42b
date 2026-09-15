const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', classController.getAllClasses);
router.get('/:id', classController.getClassById);
router.get('/:id/roster', classController.getClassRoster);

// Admin-only class creation and subject allocation
router.post('/', requireRoles('admin'), classController.createClass);
router.post('/:id/subjects', requireRoles('admin'), classController.addSubjectToClass);

module.exports = router;
