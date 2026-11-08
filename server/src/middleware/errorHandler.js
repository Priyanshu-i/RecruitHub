// server/src/middleware/errorHandler.js
/**
 * ============================================================================
 * GLOBAL CENTRALIZED ERROR HANDLER
 * ============================================================================
 * Catches unhandled exceptions across the Express pipeline and formats them into
 * standardized JSON responses so client applications receive predictable error structures.
 * ============================================================================
 */

function errorHandler(err, req, res, next) {
  console.error('Unhandled API Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
