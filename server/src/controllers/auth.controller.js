import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken, safeTokenPayload } from '../utils/jwt.js';
import { safeUser } from '../utils/safeUser.js';
import { ROLES, ACCOUNT_STATUS, MESSAGES } from '../constants/index.js';

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const userRole = role === ROLES.INSTRUCTOR ? ROLES.INSTRUCTOR : ROLES.STUDENT;
  const accountStatus = userRole === ROLES.INSTRUCTOR ? ACCOUNT_STATUS.PENDING : ACCOUNT_STATUS.ACTIVE;

  let user;
  try {
    user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash: await hashPassword(password),
        role: userRole,
        status: accountStatus,
        preferences: {
          create: {},
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw ApiError.conflict(MESSAGES.EMAIL_IN_USE);
    }
    throw error;
  }

  const token = signToken(safeTokenPayload(user.id, user.role));

  sendSuccess(res, 201, MESSAGES.REGISTERED, {
    user: safeUser(user),
    token,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
  }

  if (user.status === 'SUSPENDED') {
    throw ApiError.forbidden(MESSAGES.ACCOUNT_SUSPENDED);
  }

  const token = signToken(safeTokenPayload(user.id, user.role));

  sendSuccess(res, 200, MESSAGES.LOGGED_IN, {
    user: safeUser(user),
    token,
  });
});

export const logout = asyncHandler(async (_req, res) => {
  sendSuccess(res, 200, MESSAGES.LOGGED_OUT);
});

export const me = asyncHandler(async (req, res) => {
  const { passwordHash, ...safe } = req.user;
  sendSuccess(res, 200, MESSAGES.USER_FETCHED, { user: safe });
});