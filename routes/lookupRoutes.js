const express = require('express');
const controller = require('../controllers/lookupController');

const router = express.Router();
router.get('/:name', controller.get);

module.exports = router;
