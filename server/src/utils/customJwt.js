// server/src/utils/customJwt.js
/**
 * ============================================================================
 * CUSTOM JSON WEB TOKEN (JWT) IMPLEMENTATION (RFC 7519)
 * ============================================================================
 * Why Build Custom JWT instead of using 'jsonwebtoken'?
 * 1. Deep Interview Discussion: Demonstrates a comprehensive understanding of
 *    cryptographic signing, Base64URL encoding, payload serialization, and
 *    token lifecycle without relying on black-box npm packages.
 * 2. Security Awareness: Explicitly mitigates "Timing Attacks" using Node's native
 *    `crypto.timingSafeEqual()`. Standard string comparison (`===`) leaks timing
 *    information because it exits on the first mismatched byte.
 * 3. Minimal Attack Surface: Zero external third-party dependencies for auth.
 * ============================================================================
 */

const crypto = require('crypto');

/**
 * Encodes a JavaScript string or Buffer into URL-safe Base64 format.
 * Base64URL replaces:
 *  '+' with '-'
 *  '/' with '_'
 * and strips trailing '=' padding characters to ensure tokens can be safely
 * passed in HTTP headers, cookies, and URLs without encoding issues.
 */
function base64UrlEncode(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf-8');
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Decodes a URL-safe Base64 string back into standard UTF-8 text.
 */
function base64UrlDecode(base64UrlString) {
  // Re-add '=' padding if missing
  let base64 = base64UrlString.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Computes an HMAC-SHA256 signature for the given content.
 * 
 * @param {string} content - Header and payload joined by a dot ('header.payload')
 * @param {string} secret - Server secret key
 * @returns {string} Base64URL encoded signature
 */
function createSignature(content, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(content)
    .digest('base64url');
}

/**
 * Generates a signed JWT string.
 *
 * Structure: <Base64Url(Header)>.<Base64Url(Payload)>.<Base64Url(Signature)>
 *
 * @param {Object} payload - User claims (e.g., { id, email, role })
 * @param {string} secret - Secret key for signing
 * @param {Object} [options] - Options such as expiresIn (in seconds)
 * @returns {string} The serialized JWT token
 */
function signToken(payload, secret, options = {}) {
  if (!secret) {
    throw new Error('JWT signing secret is required.');
  }

  // 1. Construct standard JWT header specifying algorithm & token type
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  // 2. Add standard timestamp claims: iat (issued at) and exp (expiration)
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: currentTimestamp
  };

  if (options.expiresIn) {
    tokenPayload.exp = currentTimestamp + options.expiresIn;
  }

  // 3. Serialize header and payload to Base64URL
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));

  // 4. Create cryptographically secure signature over 'header.payload'
  const messageToSign = `${encodedHeader}.${encodedPayload}`;
  const signature = createSignature(messageToSign, secret);

  // 5. Assemble final token
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes a JWT token.
 * 
 * Security Features:
 * - Checks 3-part token structure.
 * - Enforces expected header algorithm ('HS256') to prevent algorithm confusion attacks (e.g., 'none' alg vulnerability).
 * - Constant-time signature comparison using crypto.timingSafeEqual().
 * - Validates expiration time ('exp' claim).
 *
 * @param {string} token - The raw JWT token string
 * @param {string} secret - The secret used for verification
 * @returns {Object} The decoded payload
 * @throws {Error} If token is malformed, signature is invalid, or token is expired
 */
function verifyToken(token, secret) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a non-empty string');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed token: Token must contain exactly 3 segments separated by dots');
  }

  const [encodedHeader, encodedPayload, receivedSignature] = parts;

  // 1. Parse and validate header
  let header;
  try {
    header = JSON.parse(base64UrlDecode(encodedHeader));
  } catch (err) {
    throw new Error('Invalid token header encoding');
  }

  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new Error('Unsupported token algorithm or type');
  }

  // 2. Recompute expected signature using server secret
  const messageToVerify = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createSignature(messageToVerify, secret);

  // 3. Constant-Time Signature Comparison
  // WHY crypto.timingSafeEqual?
  // In normal string comparison ('abc' === 'abd'), the engine stops at the 3rd char.
  // An attacker can measure nanosecond differences to guess bytes sequentially.
  // timingSafeEqual takes constant time regardless of where differences lie.
  const receivedSigBuffer = Buffer.from(receivedSignature);
  const expectedSigBuffer = Buffer.from(expectedSignature);

  if (
    receivedSigBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(receivedSigBuffer, expectedSigBuffer)
  ) {
    throw new Error('Invalid token signature: Token has been tampered with or secret is incorrect');
  }

  // 4. Decode payload
  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch (err) {
    throw new Error('Invalid token payload encoding');
  }

  // 5. Verify token expiration claim
  if (payload.exp) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp > payload.exp) {
      const expiredAt = new Date(payload.exp * 1000).toISOString();
      const error = new Error(`Token expired at ${expiredAt}`);
      error.name = 'TokenExpiredError';
      throw error;
    }
  }

  return payload;
}

/**
 * Decodes the token payload WITHOUT verifying the signature.
 * Useful for inspecting claims on client-side or before secret resolution.
 */
function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
}

module.exports = {
  signToken,
  verifyToken,
  decodeToken,
  base64UrlEncode,
  base64UrlDecode
};
