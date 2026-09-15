require('dotenv').config();
const app = require('./app');
const db = require('./config/db');
const runSeed = require('./db/seed');

const PORT = process.env.PORT || 5001;

// Check if database has users; if empty, automatically run seed
try {
  const userCount = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='users'").get();
  if (!userCount.count) {
    console.log('Database empty, initializing schema and seed...');
    runSeed();
  } else {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (totalUsers.count === 0) {
      console.log('No users found in database, running seed...');
      runSeed();
    }
  }
} catch (err) {
  console.log('Initializing database...', err.message);
  runSeed();
}

const server = app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 School Management System (SMS) Backend Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
});

module.exports = server;
