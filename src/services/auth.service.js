import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcryptjs.compare(password, hashedPassword);
};

export const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRE });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
};
