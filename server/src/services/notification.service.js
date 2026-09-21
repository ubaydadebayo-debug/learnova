import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export async function createNotification({ userId, type, title, message, link = null }) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
    },
  });
}

export async function listNotifications(userId, take = 25) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take,
  });
}

export async function getNotificationUnreadCount(userId) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function markNotificationRead(userId, notificationId) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
    select: { id: true },
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  return prisma.notification.update({
    where: { id: notification.id },
    data: { read: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId) {
  const updated = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });

  return updated.count;
}