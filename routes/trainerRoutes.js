const crudRoutes = require('./crudRoutes');
const controller = require('../controllers/trainerController');

module.exports = crudRoutes(controller);
