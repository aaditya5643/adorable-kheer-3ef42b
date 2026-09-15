const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Exams
router.get('/exams', gradeController.getExams);
router.post('/exams', requireRoles('admin'), gradeController.createExam);

// Grading sheet for teachers
router.get('/class/:classId/subject/:subjectId', requireRoles('admin', 'teacher'), gradeController.getGradesByClassAndSubject);
router.post('/batch', requireRoles('admin', 'teacher'), gradeController.recordGradesBatch);

// Official report card
router.get('/report-card/:studentId?', gradeController.getStudentReportCard);

module.exports = router;
