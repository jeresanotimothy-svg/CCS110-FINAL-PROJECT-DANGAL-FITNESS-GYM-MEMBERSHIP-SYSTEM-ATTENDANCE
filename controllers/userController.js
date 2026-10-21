const db = require('../config/db');
const Validators = require('../public/js/validators');
const { hashPassword } = require('../utils/password');

exports.list = async (req, res) => {
  const q = (req.query.q || '').trim();
  const filter = (req.query.filter || '').trim();
  let sql = 'SELECT user_id, username, role, is_active FROM users WHERE username LIKE ?';
  const params = [`%${q}%`];
  if (filter === 'Enabled') sql += ' AND is_active = 1';
  if (filter === 'Disabled') sql += ' AND is_active = 0';
  try {
    const [rows] = await db.query(sql + ' ORDER BY user_id DESC', params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Could not load the users.' }); }
};

exports.create = async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const role = req.body.role;

  if (!username) return res.status(400).json({ error: 'Username is required.' });
  if (!password) return res.status(400).json({ error: 'Password is required.' });
  const message = Validators.check('username', username, 'Username') || Validators.check('password', password, 'Password');
  if (message) return res.status(400).json({ error: message });
  if (!['Admin', 'Staff'].includes(role)) return res.status(400).json({ error: 'Role must be Admin or Staff.' });

  try {
    await db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, await hashPassword(password), role]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.code === 'ER_DUP_ENTRY' ? 'That username is already taken.' : 'Could not create the user.' });
  }
};

// Disable / enable (accounts are never deleted)
exports.setActive = async (req, res) => {
  const active = req.body.active ? 1 : 0;
  if (Number(req.params.id) === req.session.user.user_id && !active)
    return res.status(400).json({ error: 'You cannot disable your own account.' });
  try {
    await db.query('UPDATE users SET is_active = ? WHERE user_id = ?', [active, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: 'Could not update the account.' }); }
};

// Admin password reset
exports.resetPassword = async (req, res) => {
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!password) return res.status(400).json({ error: 'New password is required.' });
  const message = Validators.check('password', password, 'New password');
  if (message) return res.status(400).json({ error: message });
  try {
    const [result] = await db.query('UPDATE users SET password = ? WHERE user_id = ?', [await hashPassword(password), req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: 'Could not reset the password.' }); }
};
