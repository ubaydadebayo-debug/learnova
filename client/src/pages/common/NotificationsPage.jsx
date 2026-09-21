import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [listResponse, countResponse] = await Promise.all([listNotifications(), getUnreadCount()]);
      setNotifications(listResponse.data.notifications ?? []);
      setUnreadCount(countResponse.data.unreadCount ?? 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, read: true, readAt: new Date().toISOString() } : item))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      setError(err);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <section className="container-page py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Account</p>
          <h1 className="text-3xl font-extrabold">Notifications</h1>
          <p className="mt-2 text-navy/60">Stay up to date with your progress, submissions, and course activity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{unreadCount} unread</span>
          )}
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Mark all read
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
          {error.message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="border-primary/30 border-t-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-primary/50" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold">No notifications</h2>
          <p className="mt-2 text-navy/60">You are all caught up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl border p-4 ${notification.read ? 'border-line bg-white' : 'border-primary/30 bg-primary/5'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="mt-1 text-sm text-navy/60">{notification.message}</p>
                </div>
                {!notification.read && (
                  <div className="flex shrink-0 items-center gap-2">
                    {notification.link && (
                      <Link
                        to={notification.link}
                        onClick={() => markRead(notification.id)}
                        className="text-xs font-semibold text-primary"
                      >
                        <ExternalLink className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />View
                      </Link>
                    )}
                    <button type="button" onClick={() => markRead(notification.id)} className="text-xs font-semibold text-primary">
                      Mark read
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-navy/50">
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
                <span>{notification.read ? 'Read' : 'Unread'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}