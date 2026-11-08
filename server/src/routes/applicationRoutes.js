// server/src/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Student: View own submitted applications
router.get(
  '/my-applications',
  authenticateToken,
  requireRole('STUDENT'),
  (req, res, next) => applicationController.getMyApplications(req, res, next)
);

// Recruiter / TPO: Update applicant status in the pipeline
router.put(
  '/:id/status',
  authenticateToken,
  requireRole('RECRUITER', 'TPO_ADMIN'),
  (req, res, next) => applicationController.updateApplicationStatus(req, res, next)
);

module.exports = router;
