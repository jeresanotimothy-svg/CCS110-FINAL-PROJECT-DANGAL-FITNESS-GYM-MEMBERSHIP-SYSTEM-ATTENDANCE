const db = require('../config/db');

exports.summary = async (req, res) => {
  try {
    const [[counts]] = await db.query(`
      SELECT (SELECT COUNT(*) FROM members WHERE status='Active' AND is_hidden=0) AS active_members,
             (SELECT COUNT(*) FROM attendance WHERE check_out IS NULL AND is_hidden=0) AS inside_now,
             (SELECT COUNT(*) FROM trainers WHERE is_hidden=0) AS trainers,
             (SELECT COUNT(*) FROM classes WHERE is_hidden=0) AS classes,
             (SELECT IFNULL(SUM(amount),0) FROM payments WHERE is_hidden=0) AS total_revenue`);
    const [topMembers] = await db.query(`
      SELECT CONCAT(m.first_name,' ',m.last_name) AS member_name, COUNT(a.attendance_id) AS visits
      FROM members m JOIN attendance a ON m.member_id = a.member_id
      WHERE m.status = 'Active' AND m.is_hidden = 0 AND a.is_hidden = 0
      GROUP BY m.member_id, member_name ORDER BY visits DESC LIMIT 5`);
    if (req.session.user.role !== 'Admin') { delete counts.total_revenue; delete counts.classes; }  // Staff: no money totals
    res.json({ counts, topMembers });
  } catch (e) { res.status(500).json({ error: 'Could not load the dashboard.' }); }
};
