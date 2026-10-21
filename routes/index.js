// API routes
const express = require('express');
const router = express.Router();

router.use('/dashboard', require('./dashboardRoutes'));
router.use('/lookup', require('./lookupRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/members', require('./memberRoutes'));
router.use('/plans', require('./planRoutes'));
router.use('/trainers', require('./trainerRoutes'));
router.use('/classes', require('./classRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/attendance', require('./attendanceRoutes'));
router.use('/enrollments', require('./enrollmentRoutes'));

module.exports = router;
