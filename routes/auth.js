const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { query } = require('../db');
const { signToken, authRequired } = require('../middleware/auth');
const { extractUsername } = require('../lib/github');

router.post('/register', async (req, res, next) => {
  try {
    const { username, name, email, password, githubProfile } = req.body || {};
    if (!username || !name || !email || !password || !githubProfile) {
      return res.status(400).json({
        error: 'username, name, email, password and githubProfile are required',
      });
    }
    if (!extractUsername(githubProfile)) {
      return res.status(400).json({
        error: 'githubProfile must be a valid GitHub profile URL (e.g. https://github.com/your-user)',
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (username, name, email, password_hash, github_profile)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, username, name, email, github_profile`,
      [username, name, email, hash, githubProfile],
    );
    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'username or email already in use' });
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }
    const { rows } = await query(
      'SELECT id, username, name, email, password_hash, github_profile FROM users WHERE username = $1 OR email = $1',
      [username],
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    delete user.password_hash;
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, username, name, email, github_profile, created_at FROM users WHERE id = $1',
      [req.user.id],
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
