// server/src/controllers/driveController.js
/**
 * ============================================================================
 * DRIVE CONTROLLER (Placement Drives Management)
 * ============================================================================
 * Manages the lifecycle of campus recruitment drives: creating listings,
 * enforcing minimum CGPA eligibility cutoffs, and recruiter ownership validation.
 * ============================================================================
 */

const driveRepository = require('../repositories/driveRepository');
const userRepository = require('../repositories/userRepository');

class DriveController {
  /**
   * Lists all placement drives with optional search and eligibility filters.
   * 
   * Route: GET /api/v1/drives
   * Query params: ?search=...&status=OPEN&minCgpa=...
   */
  async getDrives(req, res, next) {
    try {
      const { status, search, minCgpa } = req.query;
      const drives = driveRepository.findAll({ status, search, minCgpa });

      return res.status(200).json({
        success: true,
        count: drives.length,
        drives
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves single drive details with recruiter information.
   * 
   * Route: GET /api/v1/drives/:id
   */
  async getDriveById(req, res, next) {
    try {
      const { id } = req.params;
      const drive = driveRepository.findById(id);

      if (!drive) {
        return res.status(404).json({
          success: false,
          message: 'Placement drive not found.'
        });
      }

      return res.status(200).json({
        success: true,
        drive
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Creates a new campus recruitment drive.
   * 
   * Route: POST /api/v1/drives
   * RBAC: Recruiter only
   */
  async createDrive(req, res, next) {
    try {
      const { title, description, ctcLpa, minCgpa, eligibleBranches, jobLocation, deadline, companyName } = req.body;

      if (!title || !description || !ctcLpa || !eligibleBranches || !jobLocation || !deadline) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all mandatory drive details: title, description, ctcLpa, eligibleBranches, jobLocation, and deadline.'
        });
      }

      // Resolve company name: from recruiter profile or request body
      let resolvedCompanyName = companyName;
      if (!resolvedCompanyName) {
        const recruiterProfile = userRepository.getRecruiterProfile(req.user.id);
        resolvedCompanyName = recruiterProfile?.company_name || req.user.name;
      }

      const newDrive = driveRepository.create({
        recruiterId: req.user.id,
        companyName: resolvedCompanyName,
        title,
        description,
        ctcLpa: parseFloat(ctcLpa),
        minCgpa: minCgpa ? parseFloat(minCgpa) : 6.0,
        eligibleBranches: Array.isArray(eligibleBranches) ? eligibleBranches.join(',') : eligibleBranches,
        jobLocation,
        deadline
      });

      return res.status(201).json({
        success: true,
        message: 'Campus recruitment drive posted successfully.',
        drive: newDrive
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Updates an existing drive.
   * 
   * Route: PUT /api/v1/drives/:id
   * RBAC: Recruiter owner or TPO Admin
   */
  async updateDrive(req, res, next) {
    try {
      const { id } = req.params;
      const drive = driveRepository.findById(id);

      if (!drive) {
        return res.status(404).json({
          success: false,
          message: 'Placement drive not found.'
        });
      }

      // Check ownership: Only the creator recruiter or a TPO Admin can edit
      if (req.user.role === 'RECRUITER' && drive.recruiter_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only edit drives posted by your organization.'
        });
      }

      const { title, description, ctcLpa, minCgpa, eligibleBranches, jobLocation, deadline, status } = req.body;

      const updated = driveRepository.update(id, {
        title,
        description,
        ctcLpa: ctcLpa ? parseFloat(ctcLpa) : undefined,
        minCgpa: minCgpa ? parseFloat(minCgpa) : undefined,
        eligibleBranches: Array.isArray(eligibleBranches) ? eligibleBranches.join(',') : eligibleBranches,
        jobLocation,
        deadline,
        status
      });

      return res.status(200).json({
        success: true,
        message: 'Drive updated successfully.',
        drive: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Deletes a drive.
   * 
   * Route: DELETE /api/v1/drives/:id
   * RBAC: Recruiter owner or TPO Admin
   */
  async deleteDrive(req, res, next) {
    try {
      const { id } = req.params;
      const drive = driveRepository.findById(id);

      if (!drive) {
        return res.status(404).json({
          success: false,
          message: 'Placement drive not found.'
        });
      }

      if (req.user.role === 'RECRUITER' && drive.recruiter_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only delete drives posted by your organization.'
        });
      }

      driveRepository.delete(id);

      return res.status(200).json({
        success: true,
        message: 'Drive deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Lists all drives created by the logged-in recruiter.
   * 
   * Route: GET /api/v1/drives/recruiter/my-drives
   * RBAC: Recruiter only
   */
  async getRecruiterDrives(req, res, next) {
    try {
      const drives = driveRepository.findByRecruiter(req.user.id);
      return res.status(200).json({
        success: true,
        drives
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DriveController();
