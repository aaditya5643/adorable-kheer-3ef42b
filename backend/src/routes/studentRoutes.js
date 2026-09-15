const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Admin and teachers can list all students
router.get('/', requireRoles('admin', 'teacher'), studentController.getAllStudents);

// Admin, teacher, student (own profile), parent (own children) can view profile
router.get('/:id', studentController.getStudentById);

// Admin only can create, update, delete
router.post('/', requireRoles('admin'), studentController.createStudent);
router.put('/:id', requireRoles('admin'), studentController.updateStudent);
router.delete('/:id', requireRoles('admin'), studentController.deleteStudent);

module.exports = router;
