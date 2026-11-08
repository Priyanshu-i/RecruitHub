// server/src/repositories/applicationRepository.js
/**
 * ============================================================================
 * APPLICATION REPOSITORY (State Machine & Pipeline Access Layer)
 * ============================================================================
 * Manages the student application lifecycle through strict status transitions:
 * APPLIED -> SHORTLISTED -> INTERVIEW -> OFFERED (or REJECTED).
 * ============================================================================
 */

const db = require('../db/database');

class ApplicationRepository {
  /**
   * Checks whether a student has already applied to a given drive.
   */
  findExisting(driveId, studentId) {
    const stmt = db.prepare(`
      SELECT * FROM applications
      WHERE drive_id = ? AND student_id = ?
    `);
    return stmt.get(driveId, studentId);
  }

  /**
   * Creates a new application record in the initial 'APPLIED' state.
   */
  create(driveId, studentId) {
    const stmt = db.prepare(`
      INSERT INTO applications (drive_id, student_id, status)
      VALUES (?, ?, 'APPLIED')
    `);
    const info = stmt.run(driveId, studentId);
    return this.findById(info.lastInsertRowid);
  }

  /**
   * Retrieves an application by ID with related drive and student data.
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT 
        a.id,
        a.drive_id,
        a.student_id,
        a.status,
        a.applied_at,
        a.updated_at,
        a.recruiter_feedback,
        d.company_name,
        d.title as drive_title,
        d.ctc_lpa,
        d.min_cgpa,
        u.name as student_name,
        u.email as student_email
      FROM applications a
      JOIN drives d ON a.drive_id = d.id
      JOIN users u ON a.student_id = u.id
      WHERE a.id = ?
    `);
    return stmt.get(id);
  }

  /**
   * Retrieves all applications submitted by a specific student.
   * Used for the Student Dashboard's interactive pipeline tracker.
   */
  findByStudent(studentId) {
    const stmt = db.prepare(`
      SELECT 
        a.id as application_id,
        a.status,
        a.applied_at,
        a.updated_at,
        a.recruiter_feedback,
        d.id as drive_id,
        d.company_name,
        d.title as drive_title,
        d.ctc_lpa,
        d.min_cgpa,
        d.eligible_branches,
        d.job_location,
        d.deadline,
        d.status as drive_status
      FROM applications a
      JOIN drives d ON a.drive_id = d.id
      WHERE a.student_id = ?
      ORDER BY a.applied_at DESC
    `);
    return stmt.all(studentId);
  }

  /**
   * Retrieves all applicants for a specific drive with academic metrics.
   * Used by recruiters to review candidate CGPA, branch, resume, and skills.
   */
  findByDrive(driveId) {
    const stmt = db.prepare(`
      SELECT 
        a.id as application_id,
        a.status,
        a.applied_at,
        a.updated_at,
        a.recruiter_feedback,
        u.id as student_id,
        u.name as student_name,
        u.email as student_email,
        sp.roll_number,
        sp.branch,
        sp.cgpa,
        sp.graduation_year,
        sp.resume_url,
        sp.skills,
        sp.phone
      FROM applications a
      JOIN users u ON a.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE a.drive_id = ?
      ORDER BY sp.cgpa DESC, a.applied_at ASC
    `);
    return stmt.all(driveId);
  }

  /**
   * Updates application status along with recruiter feedback notes and timestamp.
   * 
   * Allowed statuses: 'APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'
   */
  updateStatus(applicationId, status, recruiterFeedback = null) {
    const validStatuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status transition to: ${status}`);
    }

    const stmt = db.prepare(`
      UPDATE applications
      SET status = ?,
          recruiter_feedback = COALESCE(?, recruiter_feedback),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(status, recruiterFeedback, applicationId);
    return this.findById(applicationId);
  }
}

module.exports = new ApplicationRepository();
