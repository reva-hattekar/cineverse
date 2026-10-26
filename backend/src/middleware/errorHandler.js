/**
 * Centralized error handling middleware for Express
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred.',
    sqlMessage: process.env.NODE_ENV !== 'production' ? err.sqlMessage : undefined,
    code: err.code
  });
}

module.exports = errorHandler;

