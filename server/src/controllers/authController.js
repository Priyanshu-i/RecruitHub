// server/src/controllers/authController.js
/**
 * ============================================================================
 * AUTHENTICATION CONTROLLER
 * ============================================================================
 * Handles user registration, login, and identity verification using our
 * custom JWT signing utility and native password hashing.
 * ============================================================================
 */

const userRepository = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/customJwt');
const config = require('../config');

class AuthController {
  /**
   * Registers a new user account (Student or Recruiter).
   * 
   * Route: POST /api/v1/auth/register
   * Status: 201 Created on success
   */
  async register(req, res, next) {
    try {
      const { email, password, role, name, studentData, recruiterData } = req.body;

      // 1. Basic validation
      if (!email || !password || !role || !name) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: email, password, role, and name are mandatory.'
        });
      }

      const validRoles = ['STUDENT', 'RECRUITER'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role: Must be one of [${validRoles.join(', ')}]. TPO Admins must be provisioned by the institute.`
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters in length.'
        });
      }

      // 2. Check if email already registered
      const existingUser = userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      // 3. Hash password using Node's native scrypt with random salt
      const hashedPassword = hashPassword(password);

      // 4. Create base user in database
      const newUser = userRepository.create({
        email,
        password: hashedPassword,
        role,
        name
      });

      // 5. Initialize role-specific profile
      if (role === 'STUDENT') {
        const student = studentData || {};
        userRepository.createStudentProfile({
          userId: newUser.id,
          rollNumber: student.rollNumber || `ROLL-${Date.now().toString().slice(-6)}`,
          branch: student.branch || 'Computer Science and Engineering',
          cgpa: student.cgpa ? parseFloat(student.cgpa) : 7.0,
          graduationYear: student.graduationYear ? parseInt(student.graduationYear) : 2026,
          resumeUrl: student.resumeUrl || '',
          skills: student.skills || '',
          phone: student.phone || ''
        });
      } else if (role === 'RECRUITER') {
        const recruiter = recruiterData || {};
        userRepository.createRecruiterProfile({
          userId: newUser.id,
          companyName: recruiter.companyName || name + "'s Enterprise",
          companyWebsite: recruiter.companyWebsite || '',
          industry: recruiter.industry || 'Technology',
          designation: recruiter.designation || 'Hiring Manager'
        });
      }

      // 6. Generate Custom JWT token
      const tokenPayload = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      };

      const token = signToken(tokenPayload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN_SECONDS
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: tokenPayload
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Authenticates user credentials and issues a custom JWT.
   * 
   * Route: POST /api/v1/auth/login
   * Status: 200 OK on success, 401 Unauthorized on invalid credentials
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Both email and password are required.'
        });
      }

      // 1. Fetch user by email
      const user = userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // 2. Verify password with constant-time scrypt comparison
      const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // 3. Retrieve relevant profile data
      let profile = null;
      if (user.role === 'STUDENT') {
        profile = userRepository.getStudentProfile(user.id);
      } else if (user.role === 'RECRUITER') {
        profile = userRepository.getRecruiterProfile(user.id);
      }

      // 4. Generate custom JWT
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      };

      const token = signToken(tokenPayload, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN_SECONDS
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: tokenPayload,
        profile
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves profile of currently authenticated user.
   * 
   * Route: GET /api/v1/auth/me
   */
  async getMe(req, res, next) {
    try {
      let profile = null;
      if (req.user.role === 'STUDENT') {
        profile = userRepository.getStudentProfile(req.user.id);
      } else if (req.user.role === 'RECRUITER') {
        profile = userRepository.getRecruiterProfile(req.user.id);
      }

      return res.status(200).json({
        success: true,
        user: req.user,
        profile
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
