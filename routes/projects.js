const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authRequired, authOptional } = require('../middleware/auth');

const GITHUB_URL_RE = /^https?:\/\/(www\.)?github\.com\/[^\/\s]+\/[^\/\s]+\/?$/i;

function validate(body, { partial = false } = {}) {
  const errors = [];
  const { title, githubUrl } = body || {};
  if (!partial || title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) errors.push('title is required');
  }
  if (!partial || githubUrl !== undefined) {
    if (typeof githubUrl !== 'string' || !GITHUB_URL_RE.test(githubUrl)) {
      errors.push('githubUrl must be a valid GitHub repository URL');
    }
  }
  return errors;
}

router.get('/', authOptional, async (req, res, next) => {
  try {
    const params = [];
    let where = '';
    if (req.user) {
      where = 'WHERE p.user_id = $1';
      params.push(req.user.id);
    }
    const { rows } = await query(
      `SELECT p.id, p.title, p.description, p.github_url, p.created_at, p.updated_at,
              u.id AS author_id, u.username AS author_username, u.name AS author_name
         FROM projects p
         JOIN users u ON u.id = p.user_id
         ${where}
        ORDER BY p.id`,
      params,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.id, p.title, p.description, p.github_url, p.created_at, p.updated_at,
              u.id AS author_id, u.username AS author_username, u.name AS author_name
         FROM projects p
         JOIN users u ON u.id = p.user_id
        WHERE p.id = $1`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const { title, description = '', githubUrl } = req.body;
    const { rows } = await query(
      `INSERT INTO projects (user_id, title, description, github_url)
       VALUES ($1,$2,$3,$4)
       RETURNING id, user_id, title, description, github_url, created_at, updated_at`,
      [req.user.id, title, description, githubUrl],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const errors = validate(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ errors });
    const owner = await query('SELECT user_id FROM projects WHERE id = $1', [req.params.id]);
    if (!owner.rows[0]) return res.status(404).json({ error: 'Project not found' });
    if (owner.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const fields = [];
    const values = [];
    let i = 1;
    for (const [key, col] of [['title', 'title'], ['description', 'description'], ['githubUrl', 'github_url']]) {
      if (req.body[key] !== undefined) {
        fields.push(`${col} = $${i++}`);
        values.push(req.body[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    fields.push(`updated_at = NOW()`);
    values.push(req.params.id);
    const { rows } = await query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${i}
       RETURNING id, user_id, title, description, github_url, created_at, updated_at`,
      values,
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const owner = await query('SELECT user_id FROM projects WHERE id = $1', [req.params.id]);
    if (!owner.rows[0]) return res.status(404).json({ error: 'Project not found' });
    if (owner.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
