// server/src/server.js
/**
 * ============================================================================
 * RECRUITHUB - CAMPUS RECRUITMENT PORTAL API
 * ============================================================================
 * Production-ready Express application with:
 * - Explicit REST API separation (/api/v1/...)
 * - Zero third-party JWT library (Custom HMAC-SHA256 crypto implementation)
 * - Strict Role-Based Access Control (Student, Recruiter, TPO Admin)
 * - SQLite data layer with clean Repository Pattern
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Route Modules
const authRoutes = require('./routes/authRoutes');
const driveRoutes = require('./routes/driveRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// 1. Core Middleware
app.use(cors({
  origin: '*', // Allow development frontend clients
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger for visibility during interviews
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// 2. Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'RecruitHub API',
    version: '1.0.0'
  });
});

// 3. API V1 Route Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/drives', driveRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/admin', adminRoutes);

// 4. Fallback 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// 5. Centralized Error Handler Middleware
app.use(errorHandler);

// 6. Server Initialization
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(config.PORT, () => {
    console.log(`\n==================================================`);
    console.log(` RecruitHub Placement API running on port ${config.PORT}`);
    console.log(` Base URL: http://localhost:${config.PORT}/api/v1`);
    console.log(` Environment: ${config.NODE_ENV}`);
    console.log(` Custom JWT: Native HMAC-SHA256 with TimingSafeEqual`);
    console.log(`==================================================\n`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = app;
