import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { createNotification } from './notification.service.js';
import { ACCOUNT_STATUS, NOTIFICATION_TYPES, ROLES } from '../constants/index.js';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  status: true,
  title: true,
  createdAt: true,
  _count: { select: { coursesCreated: true, enrollments: true, submissions: true } },
};

export async function listAdminUsers({ search, role, status, page = 1, limit = 20 }) {
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
}

export async function updateUserStatus(adminId, userId, status) {
  if (adminId === userId) throw ApiError.badRequest('You cannot change your own account status');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, firstName: true },
  });
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'ADMIN') throw ApiError.forbidden('Administrator accounts cannot be changed here');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: userSelect,
  });

  const dashboard = user.role === ROLES.INSTRUCTOR ? '/instructor/dashboard' : '/student/dashboard';
  const statusLabel = user.role === ROLES.INSTRUCTOR ? 'Instructor' : 'Account';

  let title;
  let message;
  let link = null;

  if (status === ACCOUNT_STATUS.ACTIVE && user.role === ROLES.INSTRUCTOR) {
    title = 'Account approved';
    message = `${statusLabel} approved for ${user.firstName}. You can now create and publish courses.`;
    link = dashboard;
  } else if (status === ACCOUNT_STATUS.PENDING) {
    title = 'Status changed';
    message = `Your ${statusLabel.toLowerCase()} is pending approval by an administrator.`;
  } else if (status === ACCOUNT_STATUS.SUSPENDED) {
    title = 'Account suspended';
    message = `Your ${statusLabel.toLowerCase()} has been suspended. Contact support if you believe this is a mistake.`;
  } else {
    title = 'Account reactivated';
    message = `Your ${statusLabel.toLowerCase()} has been reactivated.`;
    link = dashboard;
  }

  await createNotification({
    userId,
    type: NOTIFICATION_TYPES.ACCOUNT,
    title,
    message,
    link,
  });

  return updated;
}