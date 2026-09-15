const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);

// List faculty
router.get('/', requireRoles('admin', 'teacher'), teacherController.getAllTeachers);

// Logged-in teacher's assigned classes
router.get('/my-classes', requireRoles('teacher'), teacherController.getMyClasses);

// Detail of a teacher
router.get('/:id', teacherController.getTeacherById);

// Admin-only management
router.post('/', requireRoles('admin'), teacherController.createTeacher);
router.put('/:id', requireRoles('admin'), teacherController.updateTeacher);
router.delete('/:id', requireRoles('admin'), teacherController.deleteTeacher);

module.exports = router;
