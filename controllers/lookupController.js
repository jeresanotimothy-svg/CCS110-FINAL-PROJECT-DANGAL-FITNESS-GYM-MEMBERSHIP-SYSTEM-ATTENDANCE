// Dropdown lists (Admin and Staff)
const db = require('../config/db');

const LOOKUPS = {
  members:  'SELECT member_id, first_name, last_name, status FROM members WHERE is_hidden = 0 ORDER BY first_name, last_name',
  plans:    'SELECT plan_id, plan_name, duration_days, price FROM membership_plans WHERE is_hidden = 0 ORDER BY price',
  trainers: 'SELECT trainer_id, first_name, last_name FROM trainers WHERE is_hidden = 0 ORDER BY first_name, last_name',
  classes:  'SELECT class_id, class_name, schedule, capacity FROM classes WHERE is_hidden = 0 ORDER BY class_name'
};

exports.get = async (req, res) => {
  const sql = LOOKUPS[req.params.name];
  if (!sql) return res.status(404).json({ error: 'Unknown list.' });
  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Could not load the list.' }); }
};
