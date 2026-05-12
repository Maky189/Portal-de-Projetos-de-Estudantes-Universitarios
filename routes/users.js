const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, username, name, email, github_profile, created_at FROM users ORDER BY id',
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/projects', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, title, description, github_url, created_at, updated_at FROM projects WHERE user_id = $1 ORDER BY id',
      [req.params.id],
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
