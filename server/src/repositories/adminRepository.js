// server/src/repositories/adminRepository.js
/**
 * ============================================================================
 * ADMIN REPOSITORY (TPO Analytics & College-Wide Reporting)
 * ============================================================================
 * Aggregates high-level placement KPIs (placement percentage, average CTC,
 * department distribution, and student placement registries) for TPO administration.
 * ============================================================================
 */

const db = require('../db/database');

class AdminRepository {
  /**
   * Calculates comprehensive placement analytics across the entire college.
   */
  getPlacementStats() {
    // 1. Total Students
    const studentCountRow = db.prepare(`
      SELECT COUNT(*) as total_students
      FROM users
      WHERE role = 'STUDENT'
    `).get();

    // 2. Total Drives
    const driveCountRow = db.prepare(`
      SELECT 
        COUNT(*) as total_drives,
        COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as active_drives
      FROM drives
    `).get();

    // 3. Applications and Offers
    const appStatsRow = db.prepare(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'OFFERED' THEN 1 END) as total_offers,
        COUNT(CASE WHEN status = 'INTERVIEW' THEN 1 END) as ongoing_interviews,
        COUNT(CASE WHEN status = 'SHORTLISTED' THEN 1 END) as shortlisted_candidates
      FROM applications
    `).get();

    // 4. Unique Placed Students
    const placedStudentsRow = db.prepare(`
      SELECT COUNT(DISTINCT student_id) as placed_students
      FROM applications
      WHERE status = 'OFFERED'
    `).get();

    // 5. CTC Statistics for offered students
    const ctcStatsRow = db.prepare(`
      SELECT 
        ROUND(AVG(d.ctc_lpa), 2) as average_ctc,
        MAX(d.ctc_lpa) as highest_ctc,
        MIN(d.ctc_lpa) as lowest_ctc
      FROM applications a
      JOIN drives d ON a.drive_id = d.id
      WHERE a.status = 'OFFERED'
    `).get();

    // 6. Branch-wise placement distribution
    const branchStats = db.prepare(`
      SELECT 
        sp.branch,
        COUNT(DISTINCT sp.user_id) as total_students,
        COUNT(DISTINCT CASE WHEN a.status = 'OFFERED' THEN a.student_id END) as placed_students
      FROM student_profiles sp
      LEFT JOIN applications a ON sp.user_id = a.student_id
      GROUP BY sp.branch
    `).all();

    const totalStudents = studentCountRow.total_students || 0;
    const placedStudents = placedStudentsRow.placed_students || 0;
    const placementPercentage = totalStudents > 0 
      ? Math.round((placedStudents / totalStudents) * 100 * 10) / 10 
      : 0;

    return {
      totalStudents,
      placedStudents,
      placementPercentage,
      totalDrives: driveCountRow.total_drives || 0,
      activeDrives: driveCountRow.active_drives || 0,
      totalApplications: appStatsRow.total_applications || 0,
      totalOffers: appStatsRow.total_offers || 0,
      ongoingInterviews: appStatsRow.ongoing_interviews || 0,
      averageCtc: ctcStatsRow.average_ctc || 0,
      highestCtc: ctcStatsRow.highest_ctc || 0,
      branchDistribution: branchStats
    };
  }

  /**
   * Retrieves all registered students with their verification and placement status.
   */
  getAllStudents() {
    const stmt = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.created_at,
        sp.roll_number,
        sp.branch,
        sp.cgpa,
        sp.graduation_year,
        sp.resume_url,
        sp.skills,
        sp.phone,
        sp.is_verified,
        COUNT(a.id) as applications_count,
        COUNT(CASE WHEN a.status = 'OFFERED' THEN 1 END) as offers_count
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN applications a ON u.id = a.student_id
      WHERE u.role = 'STUDENT'
      GROUP BY u.id
      ORDER BY sp.cgpa DESC
    `);
    return stmt.all();
  }

  /**
   * Retrieves all applications campus-wide with full student and drive details.
   */
  getAllApplications() {
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
        u.id as student_id,
        u.name as student_name,
        u.email as student_email,
        sp.roll_number,
        sp.branch,
        sp.cgpa
      FROM applications a
      JOIN drives d ON a.drive_id = d.id
      JOIN users u ON a.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      ORDER BY a.applied_at DESC
    `);
    return stmt.all();
  }
}

module.exports = new AdminRepository();
