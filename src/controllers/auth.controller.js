import {
  hashPassword,
  comparePassword,
  generateToken,
} from '../services/auth.service.js';
import {
  getUserByEmail,
  createUser,
  getRoleByName,
  getUserById,
} from '../services/db.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateEmail, validatePassword } from '../utils/validators.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    if (!validateEmail(email)) {
      return sendError(res, 'Invalid email format', 400);
    }

    if (!validatePassword(password)) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return sendError(res, 'User with this email already exists', 409);
    }

    // Get role
    const roleData = await getRoleByName(role);
    if (!roleData) {
      return sendError(res, 'Invalid role', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await createUser(name, email, hashedPassword, roleData.role_id);

    // Generate token
    const token = generateToken({
      user_id: newUser.user_id,
      email: newUser.email,
    });

    const userWithRole = await getUserById(newUser.user_id);

    return sendSuccess(
      res,
      {
        user: {
          user_id: userWithRole.user_id,
          name: userWithRole.name,
          email: userWithRole.email,
          role: userWithRole.role_name,
        },
        token,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    if (!validateEmail(email)) {
      return sendError(res, 'Invalid email format', 400);
    }

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({
      user_id: user.user_id,
      email: user.email,
    });

    const userWithRole = await getUserById(user.user_id);

    return sendSuccess(res, {
      user: {
        user_id: userWithRole.user_id,
        name: userWithRole.name,
        email: userWithRole.email,
        role: userWithRole.role_name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.user_id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role_name,
      created_at: user.created_at,
    });
  } catch (error) {
    next(error);
  }
};
