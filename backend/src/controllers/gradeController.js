const db = require('../config/db');

function calculateLetterGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B+';
  if (marks >= 60) return 'B';
  if (marks >= 50) return 'C';
  return 'F';
}

function getGradePoint(letter) {
  switch (letter) {
    case 'A+': return 4.0;
    case 'A': return 3.7;
    case 'B+': return 3.3;
    case 'B': return 3.0;
    case 'C': return 2.0;
    default: return 0.0;
  }
}

function getExams(req, res) {
  try {
    const exams = db.prepare('SELECT * FROM exams ORDER BY id DESC').all();
    return res.json({ success: true, exams });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch exams.' });
  }
}

function createExam(req, res) {
  try {
    const { name, term, academic_year = '2026-2027', start_date, end_date } = req.body;
    if (!name || !term) {
      return res.status(400).json({ success: false, message: 'Exam name and term are required.' });
    }

    const result = db.prepare(`
      INSERT INTO exams (name, term, academic_year, start_date, end_date)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, term, academic_year, start_date || null, end_date || null);

    return res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      examId: result.lastInsertRowid
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create exam.' });
  }
}

function getGradesByClassAndSubject(req, res) {
  try {
    const { classId, subjectId } = req.params;
    const { exam_id } = req.query;

    let examId = exam_id;
    if (!examId) {
      const latestExam = db.prepare('SELECT id FROM exams ORDER BY id DESC LIMIT 1').get();
      examId = latestExam ? latestExam.id : null;
    }

    if (!examId) {
      return res.status(400).json({ success: false, message: 'No exams found.' });
    }

    const students = db.prepare(`
      SELECT 
        s.id AS student_id,
        s.admission_number,
        u.first_name,
        u.last_name,
        u.avatar,
        g.id AS grade_id,
        g.marks_obtained,
        g.max_marks,
        g.grade_letter,
        g.comments
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN grades g ON g.student_id = s.id AND g.subject_id = ? AND g.exam_id = ?
      WHERE s.class_id = ?
      ORDER BY u.first_name ASC
    `).all(subjectId, examId, classId);

    const subject = db.prepare('SELECT id, name, code FROM subjects WHERE id = ?').get(subjectId);
    const exam = db.prepare('SELECT id, name, term FROM exams WHERE id = ?').get(examId);

    return res.json({
      success: true,
      subject,
      exam,
      students
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch grades.' });
  }
}

function recordGradesBatch(req, res) {
  const { exam_id, subject_id, grades } = req.body;

  if (!exam_id || !subject_id || !Array.isArray(grades)) {
    return res.status(400).json({
      success: false,
      message: 'exam_id, subject_id, and grades array are required.'
    });
  }

  const recordedBy = req.user.id;

  const transaction = db.transaction(() => {
    const upsertStmt = db.prepare(`
      INSERT INTO grades (exam_id, student_id, subject_id, marks_obtained, max_marks, grade_letter, comments, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(exam_id, student_id, subject_id) DO UPDATE SET
        marks_obtained = excluded.marks_obtained,
        max_marks = excluded.max_marks,
        grade_letter = excluded.grade_letter,
        comments = excluded.comments,
        recorded_by = excluded.recorded_by
    `);

    for (const g of grades) {
      if (g.marks_obtained === undefined || g.marks_obtained === null || g.marks_obtained === '') continue;
      const marks = parseFloat(g.marks_obtained);
      const maxMarks = g.max_marks ? parseFloat(g.max_marks) : 100;
      const letter = calculateLetterGrade(marks);

      upsertStmt.run(
        exam_id,
        g.student_id,
        subject_id,
        marks,
        maxMarks,
        letter,
        g.comments || null,
        recordedBy
      );
    }
  });

  try {
    transaction();
    return res.json({
      success: true,
      message: `Recorded grades for ${grades.length} students successfully.`
    });
  } catch (error) {
    console.error('Error recording grades:', error);
    return res.status(500).json({ success: false, message: 'Failed to record grades.' });
  }
}

function getStudentReportCard(req, res) {
  try {
    let studentId = req.params.studentId;

    if (req.user.role === 'student') {
      const st = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id);
      if (!st) return res.status(404).json({ success: false, message: 'Student not found.' });
      studentId = st.id;
    }

    const { exam_id } = req.query;
    let examId = exam_id;
    if (!examId) {
      const latestExam = db.prepare('SELECT id FROM exams ORDER BY id DESC LIMIT 1').get();
      examId = latestExam ? latestExam.id : null;
    }

    const student = db.prepare(`
      SELECT 
        s.id AS student_id,
        s.admission_number,
        s.date_of_birth,
        s.gender,
        s.blood_group,
        c.name AS class_name,
        c.grade_level,
        c.section,
        c.room_number,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar,
        pu.first_name AS parent_first_name,
        pu.last_name AS parent_last_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN users pu ON s.parent_id = pu.id
      WHERE s.id = ?
    `).get(studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(examId);

    // Fetch marks for each subject
    const subjectGrades = db.prepare(`
      SELECT 
        sub.id AS subject_id,
        sub.name AS subject_name,
        sub.code AS subject_code,
        g.marks_obtained,
        g.max_marks,
        g.grade_letter,
        g.comments,
        tu.first_name AS teacher_first,
        tu.last_name AS teacher_last
      FROM subjects sub
      JOIN classes c ON sub.class_id = c.id
      JOIN students s ON s.class_id = c.id
      LEFT JOIN grades g ON g.subject_id = sub.id AND g.student_id = s.id AND g.exam_id = ?
      LEFT JOIN users tu ON sub.teacher_id = tu.id
      WHERE s.id = ?
    `).all(examId, studentId);

    // Calculate totals and GPA
    let totalMarks = 0;
    let totalMaxMarks = 0;
    let totalGpaPoints = 0;
    let gradedCount = 0;

    subjectGrades.forEach(sub => {
      if (sub.marks_obtained !== null && sub.marks_obtained !== undefined) {
        totalMarks += sub.marks_obtained;
        totalMaxMarks += sub.max_marks || 100;
        totalGpaPoints += getGradePoint(sub.grade_letter);
        gradedCount++;
      }
    });

    const averagePercentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(1) : 0;
    const gpa = gradedCount > 0 ? (totalGpaPoints / gradedCount).toFixed(2) : '0.00';

    // Attendance summary
    const attStats = db.prepare(`
      SELECT 
        COUNT(*) AS total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_count
      FROM attendance
      WHERE student_id = ?
    `).get(studentId);

    const attTotal = attStats.total_days || 0;
    const attPresent = (attStats.present_count || 0) + (attStats.late_count || 0) * 0.5;
    const attendanceRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 100;

    return res.json({
      success: true,
      report_card: {
        student,
        exam,
        subjects: subjectGrades,
        summary: {
          total_marks: totalMarks,
          total_max_marks: totalMaxMarks,
          percentage: Number(averagePercentage),
          gpa: Number(gpa),
          overall_grade: calculateLetterGrade(Number(averagePercentage)),
          academic_standing: Number(averagePercentage) >= 80 ? 'Honor Roll (Distinction)' : (Number(averagePercentage) >= 60 ? 'Satisfactory Standing' : 'Needs Improvement'),
          attendance_percentage: attendanceRate,
          total_days: attTotal,
          present_days: attStats.present_count || 0,
          absent_days: attStats.absent_count || 0
        }
      }
    });
  } catch (error) {
    console.error('Error generating report card:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate report card.' });
  }
}

module.exports = {
  getExams,
  createExam,
  getGradesByClassAndSubject,
  recordGradesBatch,
  getStudentReportCard
};
