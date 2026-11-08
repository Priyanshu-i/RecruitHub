// server/src/utils/password.js
/**
 * ============================================================================
 * NATIVE PASSWORD HASHING UTILITY
 * ============================================================================
 * Uses Node's built-in `crypto.scryptSync` with random salt and timing-safe
 * verification to provide enterprise-grade password security without
 * requiring native compilation dependencies (like node-gyp for bcrypt).
 * ============================================================================
 */

const crypto = require('crypto');

const KEY_LENGTH = 64; // 64 bytes hash output

/**
 * Hashes a plaintext password using scrypt with a newly generated random salt.
 * Format saved in database: `salt:hash` (both in hex string format)
 *
 * @param {string} password - Raw password text
 * @returns {string} Salt and hash separated by colon
 */
function hashPassword(password) {
  // 16 bytes (128 bits) of cryptographically secure random salt
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored `salt:hash` string.
 * Uses `crypto.timingSafeEqual` to prevent timing attacks.
 *
 * @param {string} password - Input plaintext password
 * @param {string} storedHash - Stored "salt:hash" from database
 * @returns {boolean} True if password matches, false otherwise
 */
function comparePassword(password, storedHash) {
  if (!password || !storedHash) return false;

  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;

  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKeyBuffer = crypto.scryptSync(password, salt, KEY_LENGTH);

  if (keyBuffer.length !== derivedKeyBuffer.length) {
    return false;
  }

  // Constant-time buffer comparison to prevent timing leaks
  return crypto.timingSafeEqual(keyBuffer, derivedKeyBuffer);
}

module.exports = {
  hashPassword,
  comparePassword
};
