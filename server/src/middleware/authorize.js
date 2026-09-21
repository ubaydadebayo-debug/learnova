import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES, MESSAGES } from '../constants/index.js';

// Load the authenticated user from the database.
// The role NEVER comes from the token or the frontend — only from the DB row.
export async function loadAuthenticatedUser(req, _res, next) {
  try {
    if (!req.auth?.userId) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        title: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(ApiError.unauthorized('Account no longer exists'));
    }

    if (user.status === 'SUSPENDED') {
      return next(ApiError.forbidden(MESSAGES.ACCOUNT_SUSPENDED));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRoles(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

export const requireStudent = requireRoles('STUDENT');
export const requireInstructor = requireRoles('INSTRUCTOR');
export const requireAdmin = requireRoles('ADMIN');

export function requireApprovedInstructor(req, _res, next) {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }
  if (req.user.role !== ROLES.INSTRUCTOR) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  if (req.user.status !== 'ACTIVE') {
    return next(ApiError.forbidden(MESSAGES.ACCOUNT_PENDING));
  }
  next();
}