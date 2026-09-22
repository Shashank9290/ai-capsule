// routes/capsules.js
// Full CRUD for prompt "capsules". Every route here is protected by
// authenticateJWT (mounted below), and every query is scoped to
// req.user.id - the identity taken from the verified JWT - so a user can
// never read, update or delete another user's records.

const express = require('express');
const db = require('../db');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();
router.use(authenticateJWT);

// READ - only this user's records
router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM capsules WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json(rows);
});

// CREATE - owner is always the authenticated user, never the request body
router.post('/', (req, res) => {
  const {
    project_name, prompt_title, prompt_version, prompt_text,
    response_summary, category, usefulness, reviewed, improved,
    screenshot_url, notes
  } = req.body;

  if (!project_name || !prompt_title || !prompt_text) {
    return res.status(400).json({
      error: 'project_name, prompt_title and prompt_text are required'
    });
  }

  const stmt = db.prepare(`
    INSERT INTO capsules
      (user_id, project_name, prompt_title, prompt_version, prompt_text,
       response_summary, category, usefulness, reviewed, improved,
       screenshot_url, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    req.user.id,
    project_name,
    prompt_title,
    prompt_version || null,
    prompt_text,
    response_summary || null,
    category || null,
    usefulness || null,
    reviewed ? 1 : 0,
    improved ? 1 : 0,
    screenshot_url || null,
    notes || null
  );

  const created = db.prepare('SELECT * FROM capsules WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// UPDATE - must already belong to this user
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM capsules WHERE id = ?').get(id);

  if (!existing) return res.status(404).json({ error: 'Record not found' });
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: not your record' });
  }

  const {
    project_name, prompt_title, prompt_version, prompt_text,
    response_summary, category, usefulness, reviewed, improved,
    screenshot_url, notes
  } = req.body;

  db.prepare(`
    UPDATE capsules SET
      project_name = ?, prompt_title = ?, prompt_version = ?, prompt_text = ?,
      response_summary = ?, category = ?, usefulness = ?, reviewed = ?,
      improved = ?, screenshot_url = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `).run(
    project_name ?? existing.project_name,
    prompt_title ?? existing.prompt_title,
    prompt_version ?? existing.prompt_version,
    prompt_text ?? existing.prompt_text,
    response_summary ?? existing.response_summary,
    category ?? existing.category,
    usefulness ?? existing.usefulness,
    reviewed !== undefined ? (reviewed ? 1 : 0) : existing.reviewed,
    improved !== undefined ? (improved ? 1 : 0) : existing.improved,
    screenshot_url ?? existing.screenshot_url,
    notes ?? existing.notes,
    id,
    req.user.id
  );

  const updated = db.prepare('SELECT * FROM capsules WHERE id = ?').get(id);
  res.json(updated);
});

// DELETE - must already belong to this user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM capsules WHERE id = ?').get(id);

  if (!existing) return res.status(404).json({ error: 'Record not found' });
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: not your record' });
  }

  db.prepare('DELETE FROM capsules WHERE id = ? AND user_id = ?').run(id, req.user.id);
  res.json({ ok: true, id: Number(id) });
});

module.exports = router;
