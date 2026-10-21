// Standard routes (staffView / staffAdd allow Staff; edit, status and hide are Admin only)
// No DELETE route: records are hidden
const express = require('express');
const { requireAdmin } = require('../middleware/auth');

module.exports = function crudRoutes(controller, options = {}) {
  const router = express.Router();
  const adminOnly = [requireAdmin];

  router.get('/', ...(options.staffView ? [] : adminOnly), controller.list);
  if (controller.create) router.post('/', ...(options.staffAdd ? [] : adminOnly), controller.create);
  if (controller.update) router.put('/:id', ...adminOnly, controller.update);
  if (controller.setStatus) router.patch('/:id/status', ...adminOnly, controller.setStatus);
  router.patch('/:id/hidden', ...adminOnly, controller.setHidden);
  return router;
};
