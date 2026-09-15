const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.prepare(`
      SELECT id, email, password_hash, role, first_name, last_name, avatar, phone, status
      FROM users
      WHERE LOWER(email) = LOWER(?)
    `).get(email.trim());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Fetch role details
    let roleDetails = {};
    if (user.role === 'student') {
      roleDetails = db.prepare(`
        SELECT s.id AS student_id, s.admission_number, s.class_id, c.name AS class_name, s.parent_id
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE s.user_id = ?
      `).get(user.id) || {};
    } else if (user.role === 'teacher') {
      roleDetails = db.prepare(`
        SELECT t.id AS teacher_id, t.employee_id, t.qualification, t.department
        FROM teachers t
        WHERE t.user_id = ?
      `).get(user.id) || {};
    } else if (user.role === 'parent') {
      roleDetails = db.prepare(`
        SELECT p.id AS parent_id, p.occupation, p.relationship
        FROM parents p
        WHERE p.user_id = ?
      `).get(user.id) || {};

      // Also get children
      const children = db.prepare(`
        SELECT s.id AS student_id, s.admission_number, u.first_name, u.last_name, u.avatar, c.name AS class_name, c.id AS class_id
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE s.parent_id = ?
      `).all(user.id);
      roleDetails.children = children;
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
      phone: user.phone,
      ...roleDetails
    };

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

function getMe(req, res) {
  try {
    const user = req.user;
    let roleDetails = {};

    if (user.role === 'student') {
      roleDetails = db.prepare(`
        SELECT s.id AS student_id, s.admission_number, s.class_id, c.name AS class_name, s.parent_id
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE s.user_id = ?
      `).get(user.id) || {};
    } else if (user.role === 'teacher') {
      roleDetails = db.prepare(`
        SELECT t.id AS teacher_id, t.employee_id, t.qualification, t.department
        FROM teachers t
        WHERE t.user_id = ?
      `).get(user.id) || {};
    } else if (user.role === 'parent') {
      roleDetails = db.prepare(`
        SELECT p.id AS parent_id, p.occupation, p.relationship
        FROM parents p
        WHERE p.user_id = ?
      `).get(user.id) || {};

      const children = db.prepare(`
        SELECT s.id AS student_id, s.admission_number, u.first_name, u.last_name, u.avatar, c.name AS class_name, c.id AS class_id
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN classes c ON s.class_id = c.id
        WHERE s.parent_id = ?
      `).all(user.id);
      roleDetails.children = children;
    }

    return res.json({
      success: true,
      user: {
        ...user,
        ...roleDetails
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

function getDemoAccounts(req, res) {
  return res.json({
    success: true,
    accounts: [
      {
        role: 'admin',
        title: 'Super Administrator',
        name: 'Dr. Eleanor Vance',
        email: 'admin@techschool.edu',
        password: 'password123',
        description: 'Full school administration, user management, and system analytics.'
      },
      {
        role: 'teacher',
        title: 'Senior Faculty (Math)',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@techschool.edu',
        password: 'password123',
        description: 'Assigned Class 10-A teacher. Marks attendance and grades subjects.'
      },
      {
        role: 'student',
        title: 'Student (Grade 10)',
        name: 'Liam Johnson',
        email: 'liam.johnson@techschool.edu',
        password: 'password123',
        description: 'Enrolled in 10-A. Views report card, attendance, and timetable.'
      },
      {
        role: 'parent',
        title: 'Parent / Guardian',
        name: 'Robert Johnson',
        email: 'robert.johnson@example.com',
        password: 'password123',
        description: 'Parent of Liam, Ethan, and Lucas. Monitors academic progress & fees.'
      }
    ]
  });
}

function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!bcrypt.compareSync(current_password, user.password_hash)) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const hashed = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashed, req.user.id);

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
}

module.exports = {
  login,
  getMe,
  getDemoAccounts,
  changePassword
};
