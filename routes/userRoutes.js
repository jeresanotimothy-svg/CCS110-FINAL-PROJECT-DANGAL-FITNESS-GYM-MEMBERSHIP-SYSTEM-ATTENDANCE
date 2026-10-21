const express = require('express');
const controller = require('../controllers/userController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAdmin);  // Admin only
router.get('/', controller.list);
router.post('/', controller.create);
router.patch('/:id/active', controller.setActive);
router.patch('/:id/password', controller.resetPassword);

module.exports = router;
