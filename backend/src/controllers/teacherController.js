const bcrypt = require('bcryptjs');
const db = require('../config/db');

function getAllTeachers(req, res) {
  try {
    const { department, search } = req.query;

    let query = `
      SELECT 
        t.id AS teacher_id,
        t.user_id,
        t.employee_id,
        t.qualification,
        t.department,
        t.joining_date,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar,
        u.status
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    if (department) {
      query += ` AND t.department = ?`;
      params.push(department);
    }

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR t.employee_id LIKE ? OR t.department LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY t.id ASC`;

    const teachers = db.prepare(query).all(...params);

    // Attach assigned classes & subjects for each teacher
    const fullTeachers = teachers.map(t => {
      const assignedClasses = db.prepare(`
        SELECT id, name, grade_level, section, room_number
        FROM classes
        WHERE class_teacher_id = ?
      `).all(t.user_id);

      const subjects = db.prepare(`
        SELECT sub.id, sub.name, sub.code, c.name AS class_name
        FROM subjects sub
        JOIN classes c ON sub.class_id = c.id
        WHERE sub.teacher_id = ?
      `).all(t.user_id);

      return {
        ...t,
        assigned_classes: assignedClasses,
        subjects
      };
    });

    return res.json({ success: true, count: fullTeachers.length, teachers: fullTeachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
  }
}

function getTeacherById(req, res) {
  try {
    const teacherId = req.params.id;

    const teacher = db.prepare(`
      SELECT 
        t.id AS teacher_id,
        t.user_id,
        t.employee_id,
        t.qualification,
        t.department,
        t.joining_date,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar,
        u.status
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(teacherId);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const assignedClasses = db.prepare(`
      SELECT id, name, grade_level, section, room_number
      FROM classes
      WHERE class_teacher_id = ?
    `).all(teacher.user_id);

    const subjects = db.prepare(`
      SELECT sub.id, sub.name, sub.code, c.name AS class_name, c.id AS class_id
      FROM subjects sub
      JOIN classes c ON sub.class_id = c.id
      WHERE sub.teacher_id = ?
    `).all(teacher.user_id);

    return res.json({
      success: true,
      teacher: {
        ...teacher,
        assigned_classes: assignedClasses,
        subjects
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch teacher details' });
  }
}

function getMyClasses(req, res) {
  try {
    const userId = req.user.id;

    // Classes where user is class teacher
    const classTeacherOf = db.prepare(`
      SELECT c.*, COUNT(s.id) AS student_count
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id
      WHERE c.class_teacher_id = ?
      GROUP BY c.id
    `).all(userId);

    // Classes where user teaches a subject
    const subjectClasses = db.prepare(`
      SELECT DISTINCT c.id, c.name, c.grade_level, c.section, c.room_number,
             sub.id AS subject_id, sub.name AS subject_name, sub.code AS subject_code
      FROM subjects sub
      JOIN classes c ON sub.class_id = c.id
      WHERE sub.teacher_id = ?
    `).all(userId);

    return res.json({
      success: true,
      class_teacher_of: classTeacherOf,
      teaching_subjects: subjectClasses
    });
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch teacher classes' });
  }
}

function createTeacher(req, res) {
  const transaction = db.transaction(() => {
    const {
      first_name,
      last_name,
      email,
      password = 'password123',
      phone,
      department,
      qualification,
      employee_id
    } = req.body;

    if (!first_name || !last_name || !email || !department) {
      throw new Error('First name, last name, email, and department are required.');
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${first_name}`;

    const userResult = db.prepare(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, avatar)
      VALUES (?, ?, 'teacher', ?, ?, ?, ?)
    `).run(email, hashedPassword, first_name, last_name, phone || null, avatar);

    const userId = userResult.lastInsertRowid;
    const empId = employee_id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const teacherResult = db.prepare(`
      INSERT INTO teachers (user_id, employee_id, qualification, department)
      VALUES (?, ?, ?, ?)
    `).run(userId, empId, qualification || 'B.Ed', department);

    return { userId, teacherId: teacherResult.lastInsertRowid, employeeId: empId };
  });

  try {
    const result = transaction();
    return res.status(201).json({
      success: true,
      message: 'Teacher added successfully',
      data: result
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

function updateTeacher(req, res) {
  try {
    const teacherId = req.params.id;
    const { first_name, last_name, phone, department, qualification, status } = req.body;

    const teacher = db.prepare('SELECT user_id FROM teachers WHERE id = ?').get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    db.prepare(`
      UPDATE users
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone),
          status = COALESCE(?, status)
      WHERE id = ?
    `).run(first_name, last_name, phone, status, teacher.user_id);

    db.prepare(`
      UPDATE teachers
      SET department = COALESCE(?, department),
          qualification = COALESCE(?, qualification)
      WHERE id = ?
    `).run(department, qualification, teacherId);

    return res.json({ success: true, message: 'Teacher updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update teacher' });
  }
}

function deleteTeacher(req, res) {
  try {
    const teacherId = req.params.id;
    const teacher = db.prepare('SELECT user_id FROM teachers WHERE id = ?').get(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(teacher.user_id);
    return res.json({ success: true, message: 'Teacher removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete teacher' });
  }
}

module.exports = {
  getAllTeachers,
  getTeacherById,
  getMyClasses,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
