import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardPathFor, profilePathFor, roleLabel } from '../../utils/roles';
import { cn } from '../../utils/cn';

const ITEM_CLASSES =
  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-navy/80 transition-colors duration-150 hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export default function UserMenu({ onNavigate = () => {} }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const displayName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Account';
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  const close = () => setOpen(false);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-2.5 text-navy transition-colors duration-150 hover:border-primary/40 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {initials}
        </span>
        <span className="hidden max-w-28 truncate text-sm font-semibold sm:inline">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-navy/50 transition-transform duration-150',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-white shadow-lg"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-navy">{displayName}</p>
            <p className="text-xs font-medium text-primary">{roleLabel(user.role)}</p>
          </div>

          <div className="p-1.5">
            <Link
              to={dashboardPathFor(user.role)}
              role="menuitem"
              onClick={() => {
                close();
                onNavigate();
              }}
              className={ITEM_CLASSES}
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
            <Link
              to={profilePathFor(user.role)}
              role="menuitem"
              onClick={() => {
                close();
                onNavigate();
              }}
              className={ITEM_CLASSES}
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Profile
            </Link>
          </div>

          <div className="border-t border-line p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                onNavigate();
                logout();
              }}
              className={ITEM_CLASSES}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}