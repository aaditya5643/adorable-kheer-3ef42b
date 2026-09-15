const db = require('../config/db');

function getAdminOverview(req, res) {
  try {
    const totalStudents = db.prepare('SELECT COUNT(*) AS count FROM students').get().count;
    const totalTeachers = db.prepare('SELECT COUNT(*) AS count FROM teachers').get().count;
    const totalClasses = db.prepare('SELECT COUNT(*) AS count FROM classes').get().count;
    const totalParents = db.prepare('SELECT COUNT(*) AS count FROM parents').get().count;

    // Overall attendance rate across recent records
    const attendanceStats = db.prepare(`
      SELECT 
        COUNT(*) AS total_recorded,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_count
      FROM attendance
    `).get();

    const attTotal = attendanceStats.total_recorded || 0;
    const attPresent = (attendanceStats.present_count || 0) + (attendanceStats.late_count || 0) * 0.5;
    const attendanceRate = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 95;

    // Grade distribution
    const gradeDistribution = db.prepare(`
      SELECT 
        grade_letter,
        COUNT(*) AS count
      FROM grades
      GROUP BY grade_letter
      ORDER BY 
        CASE grade_letter
          WHEN 'A+' THEN 1
          WHEN 'A' THEN 2
          WHEN 'B+' THEN 3
          WHEN 'B' THEN 4
          WHEN 'C' THEN 5
          ELSE 6
        END
    `).all();

    // Enrollment by grade level
    const enrollmentByGrade = db.prepare(`
      SELECT 
        c.grade_level,
        c.name AS class_name,
        COUNT(s.id) AS student_count
      FROM classes c
      LEFT JOIN students s ON s.class_id = c.id
      GROUP BY c.id
      ORDER BY c.grade_level ASC
    `).all();

    // Subject performance averages
    const subjectPerformance = db.prepare(`
      SELECT 
        sub.name AS subject_name,
        ROUND(AVG(g.marks_obtained), 1) AS average_score,
        COUNT(g.id) AS test_count
      FROM subjects sub
      JOIN grades g ON g.subject_id = sub.id
      GROUP BY sub.name
      ORDER BY average_score DESC
    `).all();

    // Recent announcements
    const recentAnnouncements = db.prepare(`
      SELECT a.id, a.title, a.category, a.target_role, a.created_at, u.first_name, u.last_name
      FROM announcements a
      JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `).all();

    return res.json({
      success: true,
      overview: {
        total_students: totalStudents,
        total_teachers: totalTeachers,
        total_classes: totalClasses,
        total_parents: totalParents,
        attendance_rate: attendanceRate,
        grade_distribution: gradeDistribution,
        enrollment_by_grade: enrollmentByGrade,
        subject_performance: subjectPerformance,
        recent_announcements: recentAnnouncements
      }
    });
  } catch (error) {
    console.error('Error generating report overview:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate overview statistics' });
  }
}

module.exports = {
  getAdminOverview
};
