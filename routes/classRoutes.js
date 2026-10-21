const crudRoutes = require('./crudRoutes');
const controller = require('../controllers/classController');

module.exports = crudRoutes(controller);
