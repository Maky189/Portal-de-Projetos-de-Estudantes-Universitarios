const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authOptional(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies && req.cookies.token;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
  } catch (err) { /* ignore invalid token */ }
  next();
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

module.exports = { authRequired, authOptional, signToken, JWT_SECRET };
