const db = require('../config/db');

function markBatch(req, res) {
  const { class_id, date, records } = req.body;

  if (!class_id || !date || !Array.isArray(records)) {
    return res.status(400).json({
      success: false,
      message: 'class_id, date (YYYY-MM-DD), and records array are required.'
    });
  }

  const recordedBy = req.user.id;

  const transaction = db.transaction(() => {
    const upsertStmt = db.prepare(`
      INSERT INTO attendance (student_id, class_id, date, status, remarks, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id, date) DO UPDATE SET
        status = excluded.status,
        remarks = excluded.remarks,
        recorded_by = excluded.recorded_by
    `);

    for (const item of records) {
      if (!item.student_id || !item.status) continue;
      upsertStmt.run(
        item.student_id,
        class_id,
        date,
        item.status,
        item.remarks || null,
        recordedBy
      );
    }
  });

  try {
    transaction();
    return res.json({
      success: true,
      message: `Successfully recorded attendance for ${records.length} students on ${date}.`
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return res.status(500).json({ success: false, message: 'Failed to record attendance.' });
  }
}

function getClassAttendanceByDate(req, res) {
  try {
    const classId = req.params.classId;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Fetch all students in this class with their attendance on this date (if any)
    const roster = db.prepare(`
      SELECT 
        s.id AS student_id,
        s.admission_number,
        u.first_name,
        u.last_name,
        u.avatar,
        a.id AS attendance_id,
        COALESCE(a.status, 'unmarked') AS status,
        a.remarks,
        a.recorded_by
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
      WHERE s.class_id = ?
      ORDER BY u.first_name ASC
    `).all(date, classId);

    // Summary counts
    const summary = {
      total: roster.length,
      present: roster.filter(r => r.status === 'present').length,
      late: roster.filter(r => r.status === 'late').length,
      absent: roster.filter(r => r.status === 'absent').length,
      excused: roster.filter(r => r.status === 'excused').length,
      unmarked: roster.filter(r => r.status === 'unmarked').length
    };

    return res.json({
      success: true,
      class_id: Number(classId),
      date,
      summary,
      roster
    });
  } catch (error) {
    console.error('Error fetching class attendance:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance.' });
  }
}

function getStudentAttendance(req, res) {
  try {
    let studentId = req.params.studentId;

    // If student role, they can view their own
    if (req.user.role === 'student') {
      const studentRec = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id);
      if (!studentRec) {
        return res.status(404).json({ success: false, message: 'Student record not found' });
      }
      studentId = studentRec.id;
    }

    const history = db.prepare(`
      SELECT a.id, a.date, a.status, a.remarks, c.name AS class_name
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
      LIMIT 60
    `).all(studentId);

    const stats = db.prepare(`
      SELECT 
        COUNT(*) AS total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) AS excused_count
      FROM attendance
      WHERE student_id = ?
    `).get(studentId);

    const total = stats.total_days || 0;
    const present = (stats.present_count || 0) + (stats.late_count || 0) * 0.5;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    return res.json({
      success: true,
      student_id: Number(studentId),
      stats: {
        ...stats,
        attendance_percentage: rate
      },
      history
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance stats.' });
  }
}

function getOverviewStats(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Total enrolled students
    const totalStudents = db.prepare('SELECT COUNT(*) AS count FROM students').get().count;

    // Attendance breakdown across all records
    const overallStats = db.prepare(`
      SELECT 
        COUNT(*) AS total_recorded,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_count
      FROM attendance
    `).get();

    // 7-day attendance trend
    const trends = db.prepare(`
      SELECT 
        date,
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late
      FROM attendance
      GROUP BY date
      ORDER BY date DESC
      LIMIT 7
    `).all().reverse();

    return res.json({
      success: true,
      total_students: totalStudents,
      overall_stats: overallStats,
      trends
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch overview stats.' });
  }
}

module.exports = {
  markBatch,
  getClassAttendanceByDate,
  getStudentAttendance,
  getOverviewStats
};
