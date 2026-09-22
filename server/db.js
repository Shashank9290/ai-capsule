// db.js
// SQLite storage for AI Capsule using better-sqlite3 (synchronous, zero-config).
// NOTE: on Render's free tier the filesystem is ephemeral, so this file (and
// its data) may be reset on restart/redeploy. See README for details.

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'capsules.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS capsules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    prompt_title TEXT NOT NULL,
    prompt_version TEXT,
    prompt_text TEXT NOT NULL,
    response_summary TEXT,
    category TEXT,
    usefulness TEXT,
    reviewed INTEGER DEFAULT 0,
    improved INTEGER DEFAULT 0,
    screenshot_url TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
