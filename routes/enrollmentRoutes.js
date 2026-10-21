const crudRoutes = require('./crudRoutes');
const controller = require('../controllers/enrollmentController');

module.exports = crudRoutes(controller, { staffView: true, staffAdd: true });
