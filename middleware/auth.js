const db = require('../config/db');

// Login required (role and status are re-read from the database)
async function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Please log in.' });
  try {
    const [rows] = await db.query('SELECT user_id, username, role, is_active FROM users WHERE user_id = ?',
      [req.session.user.user_id]);
    if (rows.length === 0 || !rows[0].is_active) {
      req.session = null;
      return res.status(401).json({ error: 'This account is disabled.' });
    }
    req.session.user = { user_id: rows[0].user_id, username: rows[0].username, role: rows[0].role };
    req.session.seen = Math.floor(Date.now() / 60000);  // restarts the idle timer
    next();
  } catch (e) { next(e); }
}

function requireAdmin(req, res, next) {
  if (req.session.user.role !== 'Admin') return res.status(403).json({ error: 'Admin access only.' });
  next();
}

module.exports = { requireLogin, requireAdmin };
