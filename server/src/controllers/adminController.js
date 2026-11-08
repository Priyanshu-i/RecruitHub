// server/src/controllers/adminController.js
/**
 * ============================================================================
 * ADMIN CONTROLLER (TPO Placement Insights & Institute Analytics)
 * ============================================================================
 * Aggregates high-level metrics for institute placement directors and administrators:
 * - Placement percentage across branches
 * - CTC statistics (Average, Highest)
 * - Complete student directory and campus-wide application registries
 * ============================================================================
 */

const adminRepository = require('../repositories/adminRepository');
const driveRepository = require('../repositories/driveRepository');

class AdminController {
  /**
   * Retrieves high-level placement KPIs and branch distributions.
   * 
   * Route: GET /api/v1/admin/stats
   * RBAC: TPO Admin only
   */
  async getDashboardStats(req, res, next) {
    try {
      const stats = adminRepository.getPlacementStats();
      return res.status(200).json({
        success: true,
        stats
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Lists all students registered in the college placement cell.
   * 
   * Route: GET /api/v1/admin/students
   * RBAC: TPO Admin only
   */
  async getAllStudents(req, res, next) {
    try {
      const students = adminRepository.getAllStudents();
      return res.status(200).json({
        success: true,
        count: students.length,
        students
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Lists all campus-wide applications across all drives.
   * 
   * Route: GET /api/v1/admin/applications
   * RBAC: TPO Admin only
   */
  async getAllApplications(req, res, next) {
    try {
      const applications = adminRepository.getAllApplications();
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
   * Lists all drives with administration view.
   * 
   * Route: GET /api/v1/admin/drives
   * RBAC: TPO Admin only
   */
  async getAllDrives(req, res, next) {
    try {
      const drives = driveRepository.findAll();
      return res.status(200).json({
        success: true,
        count: drives.length,
        drives
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
