import api from './api';

export function listNotifications() {
  return api.get('/notifications');
}

export function getUnreadCount() {
  return api.get('/notifications/unread-count');
}

export function markNotificationRead(notificationId) {
  return api.patch(`/notifications/${encodeURIComponent(notificationId)}/read`);
}

export function markAllNotificationsRead() {
  return api.patch('/notifications/read-all');
}