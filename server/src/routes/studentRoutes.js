// server/src/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Student profile management
router.get(
  '/profile',
  authenticateToken,
  requireRole('STUDENT'),
  (req, res, next) => studentController.getProfile(req, res, next)
);

router.put(
  '/profile',
  authenticateToken,
  requireRole('STUDENT'),
  (req, res, next) => studentController.updateProfile(req, res, next)
);

module.exports = router;
