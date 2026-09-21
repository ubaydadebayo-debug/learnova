import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const profileSelect = {
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
  preferences: {
    select: {
      language: true,
      timezone: true,
      emailNotifications: true,
      pushNotifications: true,
    },
  },
};

export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: profileSelect });
  sendSuccess(res, 200, 'Profile retrieved successfully', { user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      title: req.body.title || null,
      bio: req.body.bio || null,
    },
    select: profileSelect,
  });
  sendSuccess(res, 200, 'Profile updated successfully', { user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { passwordHash: true } });
  const matches = await verifyPassword(req.body.currentPassword, user.passwordHash);
  if (!matches) throw ApiError.badRequest('Current password is incorrect');

  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash: await hashPassword(req.body.newPassword) },
  });

  sendSuccess(res, 200, 'Password changed successfully');
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const preferences = await prisma.userPreference.upsert({
    where: { userId: req.user.id },
    update: {
      language: req.body.language,
      timezone: req.body.timezone,
      emailNotifications: req.body.emailNotifications,
      pushNotifications: req.body.pushNotifications,
    },
    create: {
      userId: req.user.id,
      language: req.body.language,
      timezone: req.body.timezone,
      emailNotifications: req.body.emailNotifications,
      pushNotifications: req.body.pushNotifications,
    },
  });
  sendSuccess(res, 200, 'Preferences updated successfully', { preferences });
});