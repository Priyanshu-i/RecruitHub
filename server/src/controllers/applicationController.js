// server/src/controllers/applicationController.js
/**
 * ============================================================================
 * APPLICATION CONTROLLER (Student Application Workflow & Pipeline Management)
 * ============================================================================
 * Handles the application submission pipeline:
 * 1. Eligibility validation (CGPA cutoff & branch check).
 * 2. Deduplication check (prevents duplicate applications).
 * 3. State transitions: APPLIED -> SHORTLISTED -> INTERVIEW -> OFFERED / REJECTED.
 * ============================================================================
 */

const applicationRepository = require('../repositories/applicationRepository');
const driveRepository = require('../repositories/driveRepository');
const userRepository = require('../repositories/userRepository');

class ApplicationController {
  /**
   * Submits a student application to a campus recruitment drive.
   * 
   * Route: POST /api/v1/drives/:id/apply (or POST /api/v1/applications)
   * RBAC: Student only
   */
  async applyToDrive(req, res, next) {
    try {
      const driveId = req.params.id || req.body.driveId;
      const studentId = req.user.id;

      if (!driveId) {
        return res.status(400).json({
          success: false,
          message: 'Target drive ID is required.'
        });
      }

      // 1. Verify drive exists and is OPEN
      const drive = driveRepository.findById(driveId);
      if (!drive) {
        return res.status(404).json({
          success: false,
          message: 'Placement drive not found.'
        });
      }

      if (drive.status !== 'OPEN') {
        return res.status(400).json({
          success: false,
          message: `Cannot apply: Drive is currently ${drive.status.toLowerCase()}.`
        });
      }

      // 2. Check application deadline
      const deadlineDate = new Date(drive.deadline);
      if (deadlineDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Application deadline for this drive has already passed.'
        });
      }

      // 3. Check for duplicate application
      const existingApp = applicationRepository.findExisting(driveId, studentId);
      if (existingApp) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied for this recruitment drive.',
          application: existingApp
        });
      }

      // 4. Retrieve student profile to verify eligibility criteria
      const studentProfile = userRepository.getStudentProfile(studentId);
      if (!studentProfile || !studentProfile.cgpa) {
        return res.status(400).json({
          success: false,
          message: 'Please complete your student profile with your CGPA and Branch before applying.'
        });
      }

      // 5. Explicit CGPA Cutoff Check
      if (studentProfile.cgpa < drive.min_cgpa) {
        return res.status(400).json({
          success: false,
          message: `Eligibility cutoff not met: Your CGPA (${studentProfile.cgpa.toFixed(2)}) is below the required cutoff of ${drive.min_cgpa.toFixed(2)} for ${drive.company_name}.`
        });
      }

      // 6. Branch Eligibility Check (if specified and not 'ALL')
      if (drive.eligible_branches && drive.eligible_branches.toUpperCase() !== 'ALL') {
        const allowed = drive.eligible_branches.toLowerCase().split(',').map(b => b.trim());
        const studentBranch = studentProfile.branch.toLowerCase();
        
        // Match either exact or shorthand (e.g., 'cse' in 'Computer Science')
        const isBranchEligible = allowed.some(branchCode => {
          if (studentBranch.includes(branchCode)) return true;
          if (branchCode === 'cse' && studentBranch.includes('computer')) return true;
          if (branchCode === 'it' && studentBranch.includes('information')) return true;
          if (branchCode === 'ece' && studentBranch.includes('electronic')) return true;
          return false;
        });

        if (!isBranchEligible) {
          return res.status(400).json({
            success: false,
            message: `Branch restriction: This drive is open only to [${drive.eligible_branches}]. Your branch: ${studentProfile.branch}.`
          });
        }
      }

      // 7. Create application record in initial 'APPLIED' state
      const newApplication = applicationRepository.create(driveId, studentId);

      return res.status(201).json({
        success: true,
        message: `Successfully applied to ${drive.company_name} - ${drive.title}!`,
        application: newApplication
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves all applications submitted by the logged-in student.
   * 
   * Route: GET /api/v1/applications/my-applications
   * RBAC: Student only
   */
  async getMyApplications(req, res, next) {
    try {
      const applications = applicationRepository.findByStudent(req.user.id);
      return res.status(200).json({
        success: true,
        count: applications.length,
        applications
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves all candidate applications for a specific drive.
   * 
   * Route: GET /api/v1/drives/:id/applications
   * RBAC: Recruiter (owner) or TPO Admin
   */
  async getDriveApplications(req, res, next) {
    try {
      const driveId = req.params.id;
      const drive = driveRepository.findById(driveId);

      if (!drive) {
        return res.status(404).json({
          success: false,
          message: 'Placement drive not found.'
        });
      }

      // Recruiter ownership validation
      if (req.user.role === 'RECRUITER' && drive.recruiter_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only view candidates for your own recruitment drives.'
        });
      }

      const applications = applicationRepository.findByDrive(driveId);

      return res.status(200).json({
        success: true,
        driveTitle: drive.title,
        companyName: drive.company_name,
        count: applications.length,
        applications
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Transitions an applicant's status in the recruitment pipeline.
   * 
   * Route: PUT /api/v1/applications/:id/status
   * RBAC: Recruiter or TPO Admin
   */
  async updateApplicationStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, recruiterFeedback } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'New status is required.'
        });
      }

      const validStatuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of [${validStatuses.join(', ')}].`
        });
      }

      const application = applicationRepository.findById(id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found.'
        });
      }

      // Validate recruiter ownership of the associated drive
      if (req.user.role === 'RECRUITER') {
        const drive = driveRepository.findById(application.drive_id);
        if (drive.recruiter_id !== req.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You can only update candidates for your own drives.'
          });
        }
      }

      const updated = applicationRepository.updateStatus(id, status, recruiterFeedback);

      return res.status(200).json({
        success: true,
        message: `Applicant status transitioned to ${status}.`,
        application: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ApplicationController();
