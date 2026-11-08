// server/src/controllers/studentController.js
/**
 * ============================================================================
 * STUDENT CONTROLLER (Academic Profile Management)
 * ============================================================================
 */

const userRepository = require('../repositories/userRepository');

class StudentController {
  /**
   * Retrieves profile for the authenticated student.
   * 
   * Route: GET /api/v1/students/profile
   * RBAC: Student
   */
  async getProfile(req, res, next) {
    try {
      const profile = userRepository.getStudentProfile(req.user.id);
      return res.status(200).json({
        success: true,
        profile
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Updates academic profile details for the authenticated student.
   * 
   * Route: PUT /api/v1/students/profile
   * RBAC: Student
   */
  async updateProfile(req, res, next) {
    try {
      const { rollNumber, branch, cgpa, graduationYear, resumeUrl, skills, phone, name } = req.body;

      const updated = userRepository.updateStudentProfile(req.user.id, {
        rollNumber,
        branch,
        cgpa: cgpa ? parseFloat(cgpa) : undefined,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        resumeUrl,
        skills,
        phone,
        name
      });

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        profile: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StudentController();
