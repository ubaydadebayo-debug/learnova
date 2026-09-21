import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import {
  getNotificationUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notification.service.js';

export const listNotificationsController = asyncHandler(async (req, res) => {
  const notifications = await listNotifications(req.user.id);
  sendSuccess(res, 200, 'Notifications retrieved successfully', { notifications });
});

export const unreadCountController = asyncHandler(async (req, res) => {
  const unreadCount = await getNotificationUnreadCount(req.user.id);
  sendSuccess(res, 200, 'Unread count retrieved successfully', { unreadCount });
});

export const markNotificationReadController = asyncHandler(async (req, res) => {
  const notification = await markNotificationRead(req.user.id, req.params.notificationId);
  sendSuccess(res, 200, 'Notification marked as read', { notification });
});

export const markAllNotificationsReadController = asyncHandler(async (req, res) => {
  const updatedCount = await markAllNotificationsRead(req.user.id);
  sendSuccess(res, 200, 'All notifications marked as read', { updatedCount });
});