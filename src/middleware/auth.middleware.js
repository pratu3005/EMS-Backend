import { verifyToken } from '../services/auth.service.js';
import { getUserById } from '../services/db.service.js';
import { sendError } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 'No token provided', 401);
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return sendError(res, 'Invalid or expired token', 401);
    }

    const user = await getUserById(decoded.user_id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendError(res, 'Authentication failed', 401);
  }
};

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return sendError(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

export const adminOnly = authorize(['admin']);
