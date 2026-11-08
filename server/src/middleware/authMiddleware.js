// server/src/middleware/authMiddleware.js
/**
 * ============================================================================
 * AUTHENTICATION & RBAC MIDDLEWARE
 * ============================================================================
 * Why this Middleware Architecture?
 * 1. authenticateToken: Intercepts incoming requests, extracts the JWT from
 *    the Authorization Bearer header, and verifies the cryptographic signature
 *    using our custom JWT module. Attaches the validated user to `req.user`.
 * 2. requireRole: Enforces Role-Based Access Control (RBAC). It guarantees
 *    that only authorized roles (STUDENT, RECRUITER, TPO_ADMIN) can execute
 *    sensitive endpoints.
 * ============================================================================
 */

const { verifyToken } = require('../utils/customJwt');
const config = require('../config');
const userRepository = require('../repositories/userRepository');

/**
 * Middleware: Verifies the custom JWT token in the Authorization header.
 * 
 * HTTP Status Codes:
 * - 401 Unauthorized: Missing, malformed, or expired token.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No Authorization header provided.'
    });
  }

  // Format must strictly be 'Bearer <token>'
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Malformed token: Header must follow format "Bearer <token>".'
    });
  }

  const token = parts[1];

  try {
    // Cryptographically verify using our custom JWT implementation
    const decoded = verifyToken(token, config.JWT_SECRET);

    // Verify the user still exists in the database
    const user = userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: User account no longer exists.'
      });
    }

    // Attach sanitized user context to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired: Your access token has expired. Please log in again.',
        isExpired: true
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed: ' + err.message
    });
  }
}

/**
 * Middleware Factory: Enforces Role-Based Access Control.
 * 
 * @param {...string} allowedRoles - List of permitted roles (e.g. 'STUDENT', 'TPO_ADMIN')
 * @returns {Function} Express middleware function
 * 
 * HTTP Status Codes:
 * - 403 Forbidden: User is authenticated but lacks required permission.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role verification.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This resource requires one of [${allowedRoles.join(', ')}] role(s). Current role: '${req.user.role}'.`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
