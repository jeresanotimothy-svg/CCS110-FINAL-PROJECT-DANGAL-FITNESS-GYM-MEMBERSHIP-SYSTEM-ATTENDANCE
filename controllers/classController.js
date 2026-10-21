const createCrudController = require('./crudController');
const db = require('../config/db');

module.exports = createCrudController({
  table: 'classes', pk: 'class_id',
  fields: ['class_name', 'trainer_id', 'schedule', 'capacity'],
  required: ['class_name', 'trainer_id', 'schedule', 'capacity'],
  rules: { class_name: 'title', schedule: 'schedule', capacity: 'capacity' },
  list: `SELECT c.*, CONCAT(t.first_name,' ',t.last_name) AS trainer_name FROM classes c
         LEFT JOIN trainers t ON c.trainer_id = t.trainer_id`,
  search: ['c.class_name', 't.first_name', 't.last_name'],
  order: 'c.class_id DESC',
  hiddenCol: 'c.is_hidden',
  validate: async d => {
    const [rows] = await db.query('SELECT trainer_id FROM trainers WHERE trainer_id = ? AND is_hidden = 0', [d.trainer_id]);
    return rows.length ? null : 'Please choose a valid trainer.';
  }
});
