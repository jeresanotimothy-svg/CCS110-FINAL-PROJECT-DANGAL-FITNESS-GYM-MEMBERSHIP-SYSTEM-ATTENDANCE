const db = require('../config/db');
const { verifyPassword, DUMMY_HASH } = require('../utils/password');
const limiter = require('../middleware/loginLimiter');

exports.login = async (req, res) => {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });
  if (username.length > 50 || password.length > 100) return res.status(401).json({ error: 'Invalid username or password.' });

  const wait = limiter.blocked(req.ip, username);
  if (wait) return res.status(429).json({ error: `Too many failed attempts. Try again in ${wait} minute(s).` });

  try {
    const [rows] = await db.query(
      'SELECT user_id, username, role, is_active, password FROM users WHERE username = ?', [username]);
    const user = rows[0];
    // Check a hash even for unknown users (same timing)
    const ok = await verifyPassword(password, user ? user.password : DUMMY_HASH);

    if (!user || !ok) {
      limiter.fail(req.ip, username);
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    if (!user.is_active) return res.status(403).json({ error: 'This account is disabled. Please contact an Admin.' });

    limiter.reset(req.ip, username);
    const session = { user_id: user.user_id, username: user.username, role: user.role };
    req.session = { user: session, seen: Math.floor(Date.now() / 60000) };
    res.json(session);
  } catch (e) {
    res.status(500).json({ error: 'Cannot reach the database. Is MySQL running?' });
  }
};

exports.logout = (req, res) => {
  req.session = null;
  res.json({ ok: true });
};

exports.me = (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in.' });
  res.json(req.session.user);
};
