const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Batch attendance marking by teacher or admin
router.post('/batch', requireRoles('admin', 'teacher'), attendanceController.markBatch);

// Get class attendance sheet for a specific date
router.get('/class/:classId', requireRoles('admin', 'teacher'), attendanceController.getClassAttendanceByDate);

// Get attendance history for a student
router.get('/student/:studentId?', attendanceController.getStudentAttendance);

// Overall attendance statistics
router.get('/overview', requireRoles('admin'), attendanceController.getOverviewStats);

module.exports = router;
