const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', announcementController.getAnnouncements);
router.post('/', requireRoles('admin', 'teacher'), announcementController.createAnnouncement);
router.delete('/:id', requireRoles('admin'), announcementController.deleteAnnouncement);

module.exports = router;
