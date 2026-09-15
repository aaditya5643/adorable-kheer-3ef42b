const db = require('../config/db');

function getAllFees(req, res) {
  try {
    const fees = db.prepare(`
      SELECT 
        f.*,
        s.admission_number,
        u.first_name,
        u.last_name,
        c.name AS class_name
      FROM fees f
      JOIN students s ON f.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      ORDER BY f.due_date ASC
    `).all();

    const summary = db.prepare(`
      SELECT 
        COUNT(*) AS total_invoices,
        SUM(amount) AS total_receivable,
        SUM(paid_amount) AS total_collected,
        SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid_count,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_count
      FROM fees
    `).get();

    return res.json({ success: true, summary, fees });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch fees' });
  }
}

function getStudentFees(req, res) {
  try {
    let studentId = req.params.studentId;

    if (req.user.role === 'student') {
      const st = db.prepare('SELECT id FROM students WHERE user_id = ?').get(req.user.id);
      if (!st) return res.status(404).json({ success: false, message: 'Student not found' });
      studentId = st.id;
    }

    const fees = db.prepare(`
      SELECT * FROM fees WHERE student_id = ? ORDER BY due_date ASC
    `).all(studentId);

    return res.json({ success: true, fees });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch student fees' });
  }
}

function payFee(req, res) {
  try {
    const feeId = req.params.id;
    const { payment_method = 'Online Card Payment' } = req.body;

    const fee = db.prepare('SELECT * FROM fees WHERE id = ?').get(feeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      UPDATE fees
      SET status = 'paid',
          paid_amount = amount,
          paid_date = ?,
          payment_method = ?
      WHERE id = ?
    `).run(today, payment_method, feeId);

    return res.json({ success: true, message: 'Fee marked as paid successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to process fee payment' });
  }
}

module.exports = {
  getAllFees,
  getStudentFees,
  payFee
};
