const db = require('../config/db');

function getAllClasses(req, res) {
  try {
    const classes = db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.grade_level,
        c.section,
        c.room_number,
        c.academic_year,
        c.class_teacher_id,
        u.first_name AS teacher_first_name,
        u.last_name AS teacher_last_name,
        u.email AS teacher_email,
        (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id) AS student_count,
        (SELECT COUNT(*) FROM subjects sub WHERE sub.class_id = c.id) AS subject_count
      FROM classes c
      LEFT JOIN users u ON c.class_teacher_id = u.id
      ORDER BY c.grade_level ASC, c.section ASC
    `).all();

    return res.json({ success: true, classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch classes' });
  }
}

function getClassById(req, res) {
  try {
    const classId = req.params.id;

    const classObj = db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.grade_level,
        c.section,
        c.room_number,
        c.academic_year,
        c.class_teacher_id,
        u.first_name AS teacher_first_name,
        u.last_name AS teacher_last_name,
        u.email AS teacher_email
      FROM classes c
      LEFT JOIN users u ON c.class_teacher_id = u.id
      WHERE c.id = ?
    `).get(classId);

    if (!classObj) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const students = db.prepare(`
      SELECT 
        s.id AS student_id,
        s.admission_number,
        s.gender,
        s.blood_group,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.class_id = ?
      ORDER BY u.last_name ASC, u.first_name ASC
    `).all(classId);

    const subjects = db.prepare(`
      SELECT 
        sub.id,
        sub.name,
        sub.code,
        sub.teacher_id,
        u.first_name AS teacher_first_name,
        u.last_name AS teacher_last_name
      FROM subjects sub
      LEFT JOIN users u ON sub.teacher_id = u.id
      WHERE sub.class_id = ?
    `).all(classId);

    return res.json({
      success: true,
      class: {
        ...classObj,
        students,
        subjects
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch class details' });
  }
}

function createClass(req, res) {
  try {
    const { grade_level, section, room_number, class_teacher_id, academic_year = '2026-2027' } = req.body;
    if (!grade_level || !section) {
      return res.status(400).json({ success: false, message: 'Grade level and section are required.' });
    }

    const name = `Grade ${grade_level}-${section.toUpperCase()}`;

    const result = db.prepare(`
      INSERT INTO classes (name, grade_level, section, room_number, academic_year, class_teacher_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, grade_level, section.toUpperCase(), room_number || null, academic_year, class_teacher_id || null);

    return res.status(201).json({
      success: true,
      message: 'Class created successfully',
      classId: result.lastInsertRowid
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create class' });
  }
}

function getClassRoster(req, res) {
  try {
    const classId = req.params.id;
    const students = db.prepare(`
      SELECT 
        s.id AS student_id,
        s.admission_number,
        u.first_name,
        u.last_name,
        u.avatar,
        u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.class_id = ?
      ORDER BY u.first_name ASC
    `).all(classId);

    return res.json({ success: true, students });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch roster' });
  }
}

function addSubjectToClass(req, res) {
  try {
    const classId = req.params.id;
    const { name, code, teacher_id } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required.' });
    }

    const result = db.prepare(`
      INSERT INTO subjects (name, code, class_id, teacher_id)
      VALUES (?, ?, ?, ?)
    `).run(name, code, classId, teacher_id || null);

    return res.status(201).json({
      success: true,
      message: 'Subject added to class',
      subjectId: result.lastInsertRowid
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add subject' });
  }
}

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  getClassRoster,
  addSubjectToClass
};
