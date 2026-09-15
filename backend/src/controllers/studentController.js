const bcrypt = require('bcryptjs');
const db = require('../config/db');

function getAllStudents(req, res) {
  try {
    const { search, class_id } = req.query;

    let query = `
      SELECT 
        s.id AS student_id,
        s.user_id,
        s.admission_number,
        s.date_of_birth,
        s.gender,
        s.blood_group,
        s.address,
        s.emergency_contact,
        s.enrollment_date,
        s.class_id,
        c.name AS class_name,
        c.grade_level,
        c.section,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar,
        u.status,
        pu.first_name AS parent_first_name,
        pu.last_name AS parent_last_name,
        pu.phone AS parent_phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users pu ON s.parent_id = pu.id
      WHERE 1=1
    `;

    const params = [];

    if (class_id) {
      query += ` AND s.class_id = ?`;
      params.push(class_id);
    }

    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR s.admission_number LIKE ? OR u.email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY s.id ASC`;

    const students = db.prepare(query).all(...params);

    // Calculate quick attendance percentage for each
    const studentList = students.map(st => {
      const attStats = db.prepare(`
        SELECT 
          COUNT(*) AS total_days,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_days,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_days
        FROM attendance
        WHERE student_id = ?
      `).get(st.student_id);

      const total = attStats.total_days || 0;
      const present = (attStats.present_days || 0) + (attStats.late_days || 0) * 0.5;
      const rate = total > 0 ? Math.round((present / total) * 100) : 100;

      return {
        ...st,
        attendance_rate: rate,
        total_days: total,
        absent_days: attStats.absent_days || 0
      };
    });

    return res.json({ success: true, count: studentList.length, students: studentList });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
}

function getStudentById(req, res) {
  try {
    const studentId = req.params.id;

    const student = db.prepare(`
      SELECT 
        s.id AS student_id,
        s.user_id,
        s.admission_number,
        s.date_of_birth,
        s.gender,
        s.blood_group,
        s.address,
        s.emergency_contact,
        s.enrollment_date,
        s.class_id,
        s.parent_id,
        c.name AS class_name,
        c.grade_level,
        c.section,
        c.room_number,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar,
        u.status,
        pu.first_name AS parent_first_name,
        pu.last_name AS parent_last_name,
        pu.email AS parent_email,
        pu.phone AS parent_phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN users pu ON s.parent_id = pu.id
      WHERE s.id = ?
    `).get(studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Attendance stats
    const attStats = db.prepare(`
      SELECT 
        COUNT(*) AS total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) AS excused_count
      FROM attendance
      WHERE student_id = ?
    `).get(studentId);

    // Recent grades
    const grades = db.prepare(`
      SELECT 
        g.id AS grade_id,
        g.marks_obtained,
        g.max_marks,
        g.grade_letter,
        g.comments,
        sub.name AS subject_name,
        sub.code AS subject_code,
        e.name AS exam_name,
        e.term
      FROM grades g
      JOIN subjects sub ON g.subject_id = sub.id
      JOIN exams e ON g.exam_id = e.id
      WHERE g.student_id = ?
      ORDER BY e.id DESC
    `).all(studentId);

    // Enrolled subjects
    const subjects = db.prepare(`
      SELECT sub.id, sub.name, sub.code, tu.first_name AS teacher_first, tu.last_name AS teacher_last
      FROM subjects sub
      LEFT JOIN users tu ON sub.teacher_id = tu.id
      WHERE sub.class_id = ?
    `).all(student.class_id);

    // Outstanding fees
    const fees = db.prepare(`
      SELECT * FROM fees WHERE student_id = ? ORDER BY due_date ASC
    `).all(studentId);

    return res.json({
      success: true,
      student: {
        ...student,
        attendance_summary: attStats,
        grades,
        subjects,
        fees
      }
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch student details' });
  }
}

function createStudent(req, res) {
  const transaction = db.transaction(() => {
    const {
      first_name,
      last_name,
      email,
      password = 'password123',
      phone,
      class_id,
      admission_number,
      date_of_birth,
      gender,
      blood_group,
      address,
      emergency_contact,
      parent_id
    } = req.body;

    if (!first_name || !last_name || !email || !class_id) {
      throw new Error('First name, last name, email, and class are required.');
    }

    // Check existing email
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${first_name}`;

    const userResult = db.prepare(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, avatar)
      VALUES (?, ?, 'student', ?, ?, ?, ?)
    `).run(email, hashedPassword, first_name, last_name, phone || null, avatar);

    const userId = userResult.lastInsertRowid;

    // Generate admission number if not provided
    const admNum = admission_number || `SMS-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const studentResult = db.prepare(`
      INSERT INTO students (user_id, admission_number, class_id, date_of_birth, gender, blood_group, address, emergency_contact, parent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      admNum,
      class_id,
      date_of_birth || '2010-01-01',
      gender || 'Male',
      blood_group || 'O+',
      address || '',
      emergency_contact || '',
      parent_id || null
    );

    return { userId, studentId: studentResult.lastInsertRowid, admissionNumber: admNum };
  });

  try {
    const result = transaction();
    return res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: result
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

function updateStudent(req, res) {
  try {
    const studentId = req.params.id;
    const {
      first_name,
      last_name,
      phone,
      class_id,
      date_of_birth,
      gender,
      blood_group,
      address,
      emergency_contact,
      status
    } = req.body;

    const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    db.prepare(`
      UPDATE users
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone),
          status = COALESCE(?, status)
      WHERE id = ?
    `).run(first_name, last_name, phone, status, student.user_id);

    db.prepare(`
      UPDATE students
      SET class_id = COALESCE(?, class_id),
          date_of_birth = COALESCE(?, date_of_birth),
          gender = COALESCE(?, gender),
          blood_group = COALESCE(?, blood_group),
          address = COALESCE(?, address),
          emergency_contact = COALESCE(?, emergency_contact)
      WHERE id = ?
    `).run(class_id, date_of_birth, gender, blood_group, address, emergency_contact, studentId);

    return res.json({ success: true, message: 'Student details updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update student' });
  }
}

function deleteStudent(req, res) {
  try {
    const studentId = req.params.id;
    const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Delete user will cascade to student, attendance, grades, fees
    db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id);

    return res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete student' });
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
