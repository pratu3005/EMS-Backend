import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') {
    return sendError(res, 'Duplicate entry', 400);
  }

  if (err.code === '23503') {
    return sendError(res, 'Foreign key constraint violation', 400);
  }

  if (err.code === '23502') {
    return sendError(res, 'Not null constraint violation', 400);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  // Default error
  return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
};

export const notFoundHandler = (req, res) => {
  sendError(res, 'Route not found', 404);
};
