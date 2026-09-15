const db = require('../config/db');

function getAnnouncements(req, res) {
  try {
    const userRole = req.user.role;

    let query = `
      SELECT 
        a.id,
        a.title,
        a.content,
        a.category,
        a.target_role,
        a.created_at,
        u.first_name AS author_first_name,
        u.last_name AS author_last_name,
        u.role AS author_role
      FROM announcements a
      JOIN users u ON a.author_id = u.id
    `;

    // Admin sees all, others see target_role = 'all' or their specific role
    if (userRole !== 'admin') {
      query += ` WHERE a.target_role = 'all' OR a.target_role = ?`;
      query += ` ORDER BY a.created_at DESC`;
      const notices = db.prepare(query).all(userRole);
      return res.json({ success: true, notices });
    } else {
      query += ` ORDER BY a.created_at DESC`;
      const notices = db.prepare(query).all();
      return res.json({ success: true, notices });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
  }
}

function createAnnouncement(req, res) {
  try {
    const { title, content, category = 'General', target_role = 'all' } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const result = db.prepare(`
      INSERT INTO announcements (title, content, category, target_role, author_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content, category, target_role, req.user.id);

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      id: result.lastInsertRowid
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create announcement' });
  }
}

function deleteAnnouncement(req, res) {
  try {
    const id = req.params.id;
    db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete announcement' });
  }
}

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
