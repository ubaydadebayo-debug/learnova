import { Bell, CheckCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../common/Spinner';
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

function notificationsPathFor(role) {
  return role === 'INSTRUCTOR' ? '/instructor/notifications' : '/student/notifications';
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    getUnreadCount()
      .then(({ data }) => setUnreadCount(data.unreadCount ?? 0))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const [listResponse, countResponse] = await Promise.all([listNotifications(), getUnreadCount()]);
        if (cancelled) return;
        setItems(listResponse.data.notifications ?? []);
        setUnreadCount(countResponse.data.unreadCount ?? 0);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      cancelled = true;
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [open, retryKey]);

  const markRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setItems((current) =>
        current.map((item) => (item.id === notificationId ? { ...item, read: true, readAt: new Date().toISOString() } : item))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      // keep the unread items visible on failure
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore transient errors
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-navy/70 transition-colors hover:border-primary hover:text-primary"
      >
        <Bell className="h-4.5 w-4.5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-bold">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="flex items-center gap-1 text-xs font-semibold text-primary">
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10"><Spinner className="border-primary/30 border-t-primary" /></div>
            ) : loadError ? (
              <div className="p-6 text-center text-sm text-navy/60">
                <p>Couldn't load notifications.</p>
                <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-2 inline-flex items-center gap-1 font-semibold text-primary">
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />Try again
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-sm text-navy/60">No notifications yet.</div>
            ) : (
              items.slice(0, 5).map((notification) => (
                <div key={notification.id} className={`border-b border-line/60 px-4 py-3 ${notification.read ? '' : 'bg-primary/5'}`}>
                  <p className="text-sm font-semibold">{notification.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-navy/60">{notification.message}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-navy/60">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    {!notification.read && (
                      <button type="button" onClick={() => markRead(notification.id)} className="text-[11px] font-semibold text-primary">
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to={notificationsPathFor(user?.role)}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 border-t border-line px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}