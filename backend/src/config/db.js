const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.NODE_ENV === 'test'
  ? path.resolve(dbDir, 'test.db')
  : path.resolve(dbDir, 'school.db');

const db = new Database(dbPath, {
  // verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable WAL mode & foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
