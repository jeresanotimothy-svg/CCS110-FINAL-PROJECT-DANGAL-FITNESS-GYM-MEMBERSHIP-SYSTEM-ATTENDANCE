const db = require('../config/db');
const createCrudController = require('./crudController');

// Attendance log (times come from the Check In / Check Out buttons)
const attendance = createCrudController({
  table: 'attendance', pk: 'attendance_id',
  noCreate: true, noEdit: true,
  list: `SELECT a.*, CONCAT(m.first_name,' ',m.last_name) AS member_name FROM attendance a
         JOIN members m ON a.member_id = m.member_id`,
  search: ['m.first_name', 'm.last_name'],
  order: 'a.attendance_id DESC',
  hiddenCol: 'a.is_hidden',
  sortOptions: {
    member: ['m.first_name', 'm.last_name'],
    checkin: ['a.check_in'],
    checkout: ['a.check_out IS NULL', 'a.check_out']
  }
});

// Check-in board
attendance.board = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.member_id, m.first_name, m.last_name, p.plan_name,
             (SELECT a.check_in FROM attendance a
              WHERE a.member_id = m.member_id AND a.check_out IS NULL AND a.is_hidden = 0
              ORDER BY a.attendance_id DESC LIMIT 1) AS inside_since
      FROM members m
      LEFT JOIN membership_plans p ON m.plan_id = p.plan_id
      WHERE m.status = 'Active' AND m.is_hidden = 0
      ORDER BY m.first_name, m.last_name`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Could not load the members.' }); }
};

attendance.checkin = async (req, res) => {
  const member_id = Number(req.body.member_id);
  if (!member_id) return res.status(400).json({ error: 'Select a member.' });
  try {
    const [members] = await db.query('SELECT status FROM members WHERE member_id = ? AND is_hidden = 0', [member_id]);
    if (members.length === 0) return res.status(400).json({ error: 'Member not found.' });
    if (members[0].status !== 'Active')
      return res.status(400).json({ error: 'Membership is ' + members[0].status + '. Only Active members can check in.' });

    const [open] = await db.query(
      'SELECT attendance_id FROM attendance WHERE member_id = ? AND check_out IS NULL AND is_hidden = 0', [member_id]);
    if (open.length > 0) return res.status(400).json({ error: 'This member is already checked in.' });

    await db.query('INSERT INTO attendance (member_id, check_in) VALUES (?, NOW())', [member_id]);
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: 'Could not check in.' }); }
};

attendance.checkout = async (req, res) => {
  const member_id = Number(req.body.member_id);
  if (!member_id) return res.status(400).json({ error: 'Select a member.' });
  try {
    const [result] = await db.query(
      'UPDATE attendance SET check_out = NOW() WHERE member_id = ? AND check_out IS NULL AND is_hidden = 0', [member_id]);
    if (result.affectedRows === 0) return res.status(400).json({ error: 'This member is not checked in.' });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: 'Could not check out.' }); }
};

module.exports = attendance;
