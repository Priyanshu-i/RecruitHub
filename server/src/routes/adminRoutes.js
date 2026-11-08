// server/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// All admin routes strictly protected with TPO_ADMIN role
router.use(authenticateToken, requireRole('TPO_ADMIN'));

router.get('/stats', (req, res, next) => adminController.getDashboardStats(req, res, next));
router.get('/students', (req, res, next) => adminController.getAllStudents(req, res, next));
router.get('/drives', (req, res, next) => adminController.getAllDrives(req, res, next));
router.get('/applications', (req, res, next) => adminController.getAllApplications(req, res, next));

module.exports = router;
