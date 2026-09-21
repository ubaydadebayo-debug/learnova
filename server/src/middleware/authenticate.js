import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Authentication token missing'));
    }

    const token = header.slice(7).trim();
    if (!token) {
      return next(ApiError.unauthorized('Authentication token missing'));
    }

    const payload = verifyToken(token);
    req.auth = {
      userId: payload.sub,
      role: payload.role,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Authentication token expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Authentication token invalid'));
    }
    next(error);
  }
}