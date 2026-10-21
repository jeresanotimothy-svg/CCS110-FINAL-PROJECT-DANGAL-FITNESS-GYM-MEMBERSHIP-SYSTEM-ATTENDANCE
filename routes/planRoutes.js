const crudRoutes = require('./crudRoutes');
const controller = require('../controllers/planController');

module.exports = crudRoutes(controller);
