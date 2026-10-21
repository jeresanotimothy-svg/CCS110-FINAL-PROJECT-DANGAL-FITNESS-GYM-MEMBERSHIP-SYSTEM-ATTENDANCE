const crudRoutes = require('./crudRoutes');
const controller = require('../controllers/memberController');

module.exports = crudRoutes(controller, { staffView: true, staffAdd: true });
