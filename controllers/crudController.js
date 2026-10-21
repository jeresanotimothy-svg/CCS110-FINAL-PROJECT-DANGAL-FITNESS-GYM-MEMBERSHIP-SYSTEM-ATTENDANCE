// Shared list / add / edit / status / hide logic
// Nothing is deleted: hide sets is_hidden = 1
const db = require('../config/db');
const Validators = require('../public/js/validators');

function labelOf(field, labels = {}) {
  if (labels[field]) return labels[field];
  const text = field.replace(/_id$/, '').replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function createCrudController(r) {
  const label = f => labelOf(f, r.labels);

  // Validation
  async function clean(body, id) {
    const data = {};
    for (const f of r.fields) {
      let value = body[f];
      if (typeof value === 'string') value = value.replace(/\s+/g, ' ').trim();
      data[f] = (value === undefined || value === '') ? null : value;
    }
    for (const f of r.required) {
      if (data[f] === null) return { error: `${label(f)} is required.` };
    }
    for (const f of r.fields) {
      if (data[f] !== null && r.rules && r.rules[f]) {
        const message = Validators.check(r.rules[f], data[f], label(f));
        if (message) return { error: message };
      }
    }
    if (r.validate) {
      const message = await r.validate(data, id);
      if (message) return { error: message };
    }
    return { data };
  }

  function dbError(e) {
    if (e.code === 'ER_DUP_ENTRY') return r.dupMessage || 'This record already exists.';
    if (e.code === 'ER_NO_REFERENCED_ROW_2') return 'The selected record does not exist.';
    return 'Could not save. Please check the values and try again.';
  }

  async function list(req, res) {
    const q = (req.query.q || '').trim();
    const filter = (req.query.filter || '').trim();
    const showHidden = req.query.hidden === '1';
    let sql = r.list, conditions = [], params = [];

    conditions.push(`${r.hiddenCol} = ?`);
    params.push(showHidden ? 1 : 0);
    if (q) {
      conditions.push('(' + r.search.map(c => `${c} LIKE ?`).join(' OR ') + ')');
      params.push(...r.search.map(() => `%${q}%`));
    }
    if (filter && r.filter) {
      conditions.push(`${r.filter} = ?`);
      params.push(filter);
    }
    // Sorting (fixed list of fields only)
    const sortKey = (req.query.sort || '').trim();
    const direction = req.query.dir === 'asc' ? 'ASC' : 'DESC';
    let orderBy = r.order;
    if (r.sortOptions && Object.prototype.hasOwnProperty.call(r.sortOptions, sortKey))
      orderBy = r.sortOptions[sortKey].map(c => `${c} ${direction}`).join(', ') + ', ' + r.order;
    sql += ' WHERE ' + conditions.join(' AND ') + ' ORDER BY ' + orderBy;
    try {
      const [rows] = await db.query(sql, params);
      res.json(rows);
    } catch (e) { res.status(500).json({ error: 'Could not load the records.' }); }
  }

  async function create(req, res) {
    try {
      const { data, error } = await clean(req.body, null);
      if (error) return res.status(400).json({ error });
      const auto = r.autoToday || [];
      const columns = [...r.fields, ...auto];
      const marks = [...r.fields.map(() => '?'), ...auto.map(() => 'CURDATE()')];
      await db.query(`INSERT INTO ${r.table} (${columns.join(',')}) VALUES (${marks.join(',')})`,
        r.fields.map(f => data[f]));
      res.json({ ok: true });
    } catch (e) { res.status(400).json({ error: dbError(e) }); }
  }

  async function update(req, res) {
    try {
      const { data, error } = await clean(req.body, req.params.id);
      if (error) return res.status(400).json({ error });
      await db.query(
        `UPDATE ${r.table} SET ${r.fields.map(f => f + '=?').join(',')} WHERE ${r.pk}=?`,
        [...r.fields.map(f => data[f]), req.params.id]);
      res.json({ ok: true });
    } catch (e) { res.status(400).json({ error: dbError(e) }); }
  }

  // Status dropdown
  async function setStatus(req, res) {
    const status = req.body.status;
    if (!r.statuses.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    try {
      await db.query(`UPDATE ${r.table} SET status = ? WHERE ${r.pk} = ?`, [status, req.params.id]);
      res.json({ ok: true });
    } catch (e) { res.status(400).json({ error: 'Could not change the status.' }); }
  }

  // Hide / unhide
  async function setHidden(req, res) {
    const hidden = req.body.hidden ? 1 : 0;
    try {
      await db.query(`UPDATE ${r.table} SET is_hidden = ? WHERE ${r.pk} = ?`, [hidden, req.params.id]);
      res.json({ ok: true });
    } catch (e) { res.status(400).json({ error: 'Could not update the record.' }); }
  }

  const controller = { list, setHidden };
  if (!r.noCreate) controller.create = create;
  if (!r.noEdit) controller.update = update;
  if (r.statuses) controller.setStatus = setStatus;
  return controller;
}

module.exports = createCrudController;
