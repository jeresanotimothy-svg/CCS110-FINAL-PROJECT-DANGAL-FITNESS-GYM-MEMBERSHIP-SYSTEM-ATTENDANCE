const crudRoutes = require('./crudRoutes');
const controller = require('../controllers/paymentController');

module.exports = crudRoutes(controller, { staffView: true, staffAdd: true });
