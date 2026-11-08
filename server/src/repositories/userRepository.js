// server/src/repositories/userRepository.js
/**
 * ============================================================================
 * USER & PROFILE REPOSITORY (Data Access Layer)
 * ============================================================================
 * Implements the Repository Pattern to isolate SQL queries for users and profiles.
 * This ensures the business logic in controllers remains clean, decoupled,
 * and testable without direct SQL dependencies.
 * ============================================================================
 */

const db = require('../db/database');

class UserRepository {
  /**
   * Finds a user by their unique email address (includes password hash for auth)
   */
  findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email.toLowerCase().trim());
  }

  /**
   * Finds a user by ID without sensitive password hash
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT id, email, role, name, created_at
      FROM users
      WHERE id = ?
    `);
    return stmt.get(id);
  }

  /**
   * Creates a new base user record
   */
  create({ email, password, role, name }) {
    const stmt = db.prepare(`
      INSERT INTO users (email, password, role, name)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(email.toLowerCase().trim(), password, role, name.trim());
    return {
      id: info.lastInsertRowid,
      email: email.toLowerCase().trim(),
      role,
      name: name.trim()
    };
  }

  /**
   * Creates or updates a student profile
   */
  createStudentProfile({ userId, rollNumber, branch, cgpa, graduationYear, resumeUrl, skills, phone }) {
    const stmt = db.prepare(`
      INSERT INTO student_profiles (user_id, roll_number, branch, cgpa, graduation_year, resume_url, skills, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(userId, rollNumber, branch, cgpa, graduationYear, resumeUrl || '', skills || '', phone || '');
  }

  /**
   * Retrieves complete student profile joined with user account data
   */
  getStudentProfile(userId) {
    const stmt = db.prepare(`
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.role,
        sp.roll_number,
        sp.branch,
        sp.cgpa,
        sp.graduation_year,
        sp.resume_url,
        sp.skills,
        sp.phone,
        sp.is_verified
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `);
    return stmt.get(userId);
  }

  /**
   * Updates an existing student's academic profile
   */
  updateStudentProfile(userId, { rollNumber, branch, cgpa, graduationYear, resumeUrl, skills, phone, name }) {
    // If name is provided, update base users table too
    if (name) {
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), userId);
    }

    const stmt = db.prepare(`
      UPDATE student_profiles
      SET roll_number = COALESCE(?, roll_number),
          branch = COALESCE(?, branch),
          cgpa = COALESCE(?, cgpa),
          graduation_year = COALESCE(?, graduation_year),
          resume_url = COALESCE(?, resume_url),
          skills = COALESCE(?, skills),
          phone = COALESCE(?, phone)
      WHERE user_id = ?
    `);
    stmt.run(rollNumber, branch, cgpa, graduationYear, resumeUrl, skills, phone, userId);
    return this.getStudentProfile(userId);
  }

  /**
   * Creates a recruiter company profile
   */
  createRecruiterProfile({ userId, companyName, companyWebsite, industry, designation }) {
    const stmt = db.prepare(`
      INSERT INTO recruiter_profiles (user_id, company_name, company_website, industry, designation)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(userId, companyName, companyWebsite || '', industry || '', designation || '');
  }

  /**
   * Retrieves recruiter profile joined with user account data
   */
  getRecruiterProfile(userId) {
    const stmt = db.prepare(`
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.role,
        rp.company_name,
        rp.company_website,
        rp.industry,
        rp.designation
      FROM users u
      LEFT JOIN recruiter_profiles rp ON u.id = rp.user_id
      WHERE u.id = ?
    `);
    return stmt.get(userId);
  }
}

module.exports = new UserRepository();
