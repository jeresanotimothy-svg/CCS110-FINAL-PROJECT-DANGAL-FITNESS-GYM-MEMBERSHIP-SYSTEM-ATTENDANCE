const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const controller = require('../controllers/attendanceController');

const router = express.Router();
router.get('/board', controller.board);
router.post('/checkin', controller.checkin);
router.post('/checkout', controller.checkout);
router.get('/', controller.list);
router.patch('/:id/hidden', requireAdmin, controller.setHidden);

module.exports = router;
