// server/src/repositories/driveRepository.js
/**
 * ============================================================================
 * DRIVE REPOSITORY (Placement Drives Data Access Layer)
 * ============================================================================
 * Encapsulates all database operations for campus recruitment drives,
 * including filtering, applicant metrics, and recruiter ownership constraints.
 * ============================================================================
 */

const db = require('../db/database');

class DriveRepository {
  /**
   * Retrieves all placement drives with applicant counts and optional search filters.
   */
  findAll({ status, search, minCgpa } = {}) {
    let query = `
      SELECT 
        d.id,
        d.recruiter_id,
        d.company_name,
        d.title,
        d.description,
        d.ctc_lpa,
        d.min_cgpa,
        d.eligible_branches,
        d.job_location,
        d.deadline,
        d.status,
        d.created_at,
        COUNT(a.id) AS total_applicants
      FROM drives d
      LEFT JOIN applications a ON d.id = a.drive_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    if (minCgpa !== undefined && minCgpa !== null && !isNaN(minCgpa)) {
      query += ' AND d.min_cgpa <= ?';
      params.push(Number(minCgpa));
    }

    if (search && search.trim()) {
      query += ' AND (d.company_name LIKE ? OR d.title LIKE ? OR d.job_location LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' GROUP BY d.id ORDER BY d.created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Retrieves a single drive by ID with applicant count.
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT 
        d.*,
        u.name as recruiter_name,
        u.email as recruiter_email,
        COUNT(a.id) as total_applicants
      FROM drives d
      JOIN users u ON d.recruiter_id = u.id
      LEFT JOIN applications a ON d.id = a.drive_id
      WHERE d.id = ?
      GROUP BY d.id
    `);
    return stmt.get(id);
  }

  /**
   * Retrieves drives created by a specific recruiter.
   */
  findByRecruiter(recruiterId) {
    const stmt = db.prepare(`
      SELECT 
        d.*,
        COUNT(a.id) as total_applicants,
        COUNT(CASE WHEN a.status = 'SHORTLISTED' THEN 1 END) as shortlisted_count,
        COUNT(CASE WHEN a.status = 'INTERVIEW' THEN 1 END) as interview_count,
        COUNT(CASE WHEN a.status = 'OFFERED' THEN 1 END) as offered_count
      FROM drives d
      LEFT JOIN applications a ON d.id = a.drive_id
      WHERE d.recruiter_id = ?
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);
    return stmt.all(recruiterId);
  }

  /**
   * Creates a new recruitment drive.
   */
  create({ recruiterId, companyName, title, description, ctcLpa, minCgpa, eligibleBranches, jobLocation, deadline }) {
    const stmt = db.prepare(`
      INSERT INTO drives (recruiter_id, company_name, title, description, ctc_lpa, min_cgpa, eligible_branches, job_location, deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')
    `);
    const info = stmt.run(
      recruiterId,
      companyName,
      title,
      description,
      ctcLpa,
      minCgpa || 6.0,
      eligibleBranches,
      jobLocation,
      deadline
    );
    return this.findById(info.lastInsertRowid);
  }

  /**
   * Updates an existing recruitment drive.
   */
  update(id, { title, description, ctcLpa, minCgpa, eligibleBranches, jobLocation, deadline, status }) {
    const stmt = db.prepare(`
      UPDATE drives
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          ctc_lpa = COALESCE(?, ctc_lpa),
          min_cgpa = COALESCE(?, min_cgpa),
          eligible_branches = COALESCE(?, eligible_branches),
          job_location = COALESCE(?, job_location),
          deadline = COALESCE(?, deadline),
          status = COALESCE(?, status)
      WHERE id = ?
    `);
    stmt.run(title, description, ctcLpa, minCgpa, eligibleBranches, jobLocation, deadline, status, id);
    return this.findById(id);
  }

  /**
   * Deletes a drive and cascades its applications
   */
  delete(id) {
    const stmt = db.prepare('DELETE FROM drives WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }
}

module.exports = new DriveRepository();
