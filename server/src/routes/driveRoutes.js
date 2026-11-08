// server/src/routes/driveRoutes.js
const express = require('express');
const router = express.Router();
const driveController = require('../controllers/driveController');
const applicationController = require('../controllers/applicationController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Public listing & details
router.get('/', (req, res, next) => driveController.getDrives(req, res, next));

// Recruiter specific drives list
router.get(
  '/recruiter/my-drives',
  authenticateToken,
  requireRole('RECRUITER'),
  (req, res, next) => driveController.getRecruiterDrives(req, res, next)
);

// Single drive details
router.get('/:id', (req, res, next) => driveController.getDriveById(req, res, next));

// Create drive (Recruiter only)
router.post(
  '/',
  authenticateToken,
  requireRole('RECRUITER'),
  (req, res, next) => driveController.createDrive(req, res, next)
);

// Update drive (Recruiter owner or TPO Admin)
router.put(
  '/:id',
  authenticateToken,
  requireRole('RECRUITER', 'TPO_ADMIN'),
  (req, res, next) => driveController.updateDrive(req, res, next)
);

// Delete drive (Recruiter owner or TPO Admin)
router.delete(
  '/:id',
  authenticateToken,
  requireRole('RECRUITER', 'TPO_ADMIN'),
  (req, res, next) => driveController.deleteDrive(req, res, next)
);

// Apply to drive (Student only)
router.post(
  '/:id/apply',
  authenticateToken,
  requireRole('STUDENT'),
  (req, res, next) => applicationController.applyToDrive(req, res, next)
);

// View applicants for a drive (Recruiter owner or TPO Admin)
router.get(
  '/:id/applications',
  authenticateToken,
  requireRole('RECRUITER', 'TPO_ADMIN'),
  (req, res, next) => applicationController.getDriveApplications(req, res, next)
);

module.exports = router;
