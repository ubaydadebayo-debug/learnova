import { useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../common/Button';
import UserMenu from './UserMenu';
import { NAV_LINKS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { dashboardPathFor, roleLabel } from '../../utils/roles';
import { cn } from '../../utils/cn';

function NavItem({ to, label, onNavigate = () => {} }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'relative rounded-md px-3 py-2 text-sm font-medium tracking-tight transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          isActive
            ? 'font-semibold text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary'
            : 'text-navy/70 hover:text-primary'
        )
      }
    >
      {label}
    </NavLink>
  );
}

function AuthActions({ onNavigate = () => {} }) {
  const { user } = useAuth();

  if (user) {
    return (
      <>
        <Link
          to={dashboardPathFor(user.role)}
          onClick={onNavigate}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-navy/80 transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Dashboard
        </Link>
        <UserMenu onNavigate={onNavigate} />
      </>
    );
  }

  return (
    <>
      <Link to="/login" onClick={onNavigate}>
        <Button variant="outline" size="md" className="px-4">
          Sign In
        </Button>
      </Link>
      <Link to="/register" onClick={onNavigate}>
        <Button size="md">Start Learning</Button>
      </Link>
    </>
  );
}

export default function Navbar({ open = false, onOpenChange = () => {} }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.to} to={link.to} label={link.label} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <AuthActions />
        </div>

        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy transition-colors duration-150 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
        >
          {open ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
}

export function MobileMenu({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      onClose();
    }
  }, [location.pathname, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div id="mobile-menu" className="border-b border-line bg-white lg:hidden">
      <div className="container-page flex max-h-[calc(100dvh-72px)] flex-col overflow-y-auto py-4">
        <nav className="flex flex-col gap-1" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.to} to={link.to} label={link.label} onNavigate={onClose} />
          ))}
        </nav>

        <div className="mt-4 space-y-2 border-t border-line pt-4">
          {user ? (
            <>
              <Link
                to={dashboardPathFor(user.role)}
                onClick={onClose}
                className="flex items-center justify-center rounded-lg border border-line px-4 py-3 text-sm font-semibold text-navy transition-colors duration-150 hover:border-primary/40 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Dashboard
              </Link>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    {roleLabel(user.role)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    logout();
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-navy/70 transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" onClick={onClose} className="block">
                <Button variant="outline" size="lg" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={onClose} className="block">
                <Button size="lg" className="w-full">
                  Start Learning
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}