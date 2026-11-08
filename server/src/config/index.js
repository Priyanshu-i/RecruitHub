// server/src/config/index.js
// Centralized configuration module using environment variables with safe defaults.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Secret key used for signing HMAC-SHA256 tokens in our custom JWT implementation
  JWT_SECRET: process.env.JWT_SECRET || 'recruit-hub-secure-placement-portal-secret-key-2026',
  // Default token lifespan: 24 hours in seconds
  JWT_EXPIRES_IN_SECONDS: 24 * 60 * 60,
  // Database file path
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '../db/recruithub.db'),
};
