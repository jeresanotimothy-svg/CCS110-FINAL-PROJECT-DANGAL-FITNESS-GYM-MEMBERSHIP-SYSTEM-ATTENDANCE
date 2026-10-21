const createCrudController = require('./crudController');

module.exports = createCrudController({
  table: 'membership_plans', pk: 'plan_id',
  fields: ['plan_name', 'duration_days', 'price'],
  required: ['plan_name', 'duration_days', 'price'],
  rules: { plan_name: 'title', duration_days: 'duration', price: 'price' },
  list: `SELECT p.* FROM membership_plans p`,
  search: ['p.plan_name'],
  order: 'p.plan_id DESC',
  hiddenCol: 'p.is_hidden'
});
