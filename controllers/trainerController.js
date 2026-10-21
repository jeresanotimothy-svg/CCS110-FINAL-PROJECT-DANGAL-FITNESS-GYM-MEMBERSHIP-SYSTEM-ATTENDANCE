const createCrudController = require('./crudController');

module.exports = createCrudController({
  table: 'trainers', pk: 'trainer_id',
  fields: ['first_name', 'last_name', 'specialty', 'phone'],
  required: ['first_name', 'last_name', 'specialty', 'phone'],
  rules: { first_name: 'name', last_name: 'name', specialty: 'title', phone: 'phone' },
  list: `SELECT t.* FROM trainers t`,
  search: ['t.first_name', 't.last_name', 't.specialty'],
  order: 't.trainer_id DESC',
  hiddenCol: 't.is_hidden'
});
