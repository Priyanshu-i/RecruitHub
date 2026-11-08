// server/test-auth.js
// Verification script for Custom JWT Implementation and Crypto Utilities

const { signToken, verifyToken, decodeToken } = require('./src/utils/customJwt');
const crypto = require('crypto');

console.log('--- Starting Custom JWT Test Suite ---\n');

const secret = 'my-super-secret-test-key-2026';
const testPayload = {
  id: 101,
  email: 'student@college.edu',
  role: 'STUDENT',
  name: 'John Doe'
};

// Test 1: Sign and Verify standard token
try {
  const token = signToken(testPayload, secret, { expiresIn: 3600 });
  console.log('[PASS] Token generated successfully:');
  console.log('       ' + token.substring(0, 40) + '...\n');

  const decoded = verifyToken(token, secret);
  console.log('[PASS] Token verified successfully.');
  console.log('       Decoded payload:', decoded);
  if (decoded.id === 101 && decoded.role === 'STUDENT') {
    console.log('[PASS] Claims match expected values.\n');
  } else {
    throw new Error('Claims did not match');
  }
} catch (err) {
  console.error('[FAIL] Test 1 failed:', err.message);
  process.exit(1);
}

// Test 2: Detect Tampered Payload (Data Integrity)
try {
  const token = signToken(testPayload, secret, { expiresIn: 3600 });
  const parts = token.split('.');
  
  // Tamper payload to escalate role to TPO_ADMIN
  const tamperedPayload = Buffer.from(JSON.stringify({ ...testPayload, role: 'TPO_ADMIN' })).toString('base64url');
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

  verifyToken(tamperedToken, secret);
  console.error('[FAIL] Test 2 failed: Tampered token was accepted!');
  process.exit(1);
} catch (err) {
  console.log('[PASS] Test 2: Tampered payload successfully rejected:');
  console.log('       Error message: "' + err.message + '"\n');
}

// Test 3: Expired Token Rejection
try {
  // Generate token that expired 10 seconds ago
  const expiredToken = signToken(testPayload, secret, { expiresIn: -10 });
  verifyToken(expiredToken, secret);
  console.error('[FAIL] Test 3 failed: Expired token was accepted!');
  process.exit(1);
} catch (err) {
  console.log('[PASS] Test 3: Expired token properly rejected:');
  console.log('       Error name:', err.name);
  console.log('       Error message: "' + err.message + '"\n');
}

// Test 4: Wrong Secret Key Rejection
try {
  const token = signToken(testPayload, secret, { expiresIn: 3600 });
  verifyToken(token, 'completely-different-wrong-secret');
  console.error('[FAIL] Test 4 failed: Token verified with wrong secret!');
  process.exit(1);
} catch (err) {
  console.log('[PASS] Test 4: Wrong secret rejected:');
  console.log('       Error message: "' + err.message + '"\n');
}

console.log('--- ALL CUSTOM JWT TESTS PASSED! ---');
