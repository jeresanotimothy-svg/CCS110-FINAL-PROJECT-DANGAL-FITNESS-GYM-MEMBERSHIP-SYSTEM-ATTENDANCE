const createCrudController = require('./crudController');

module.exports = createCrudController({
  table: 'members', pk: 'member_id',
  fields: ['first_name', 'last_name', 'email', 'phone', 'plan_id', 'status'],
  required: ['first_name', 'last_name', 'email', 'phone', 'plan_id', 'status'],
  rules: { first_name: 'name', last_name: 'name', email: 'email', phone: 'phone' },
  autoToday: ['join_date'],  // join date = today
  statuses: ['Active', 'Expired', 'Suspended'],
  dupMessage: 'That email is already registered to another member.',
  list: `SELECT m.*, p.plan_name FROM members m
         LEFT JOIN membership_plans p ON m.plan_id = p.plan_id`,
  search: ['m.first_name', 'm.last_name', 'm.email'],
  order: 'm.member_id DESC',
  filter: 'm.status',
  hiddenCol: 'm.is_hidden',
  sortOptions: {
    id: ['m.member_id'],
    name: ['m.first_name', 'm.last_name'],
    email: ['m.email'],
    plan: ['p.plan_name'],
    joined: ['m.join_date'],
    status: ['m.status']
  }
});
