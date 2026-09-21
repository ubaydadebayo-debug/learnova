import { Link } from 'react-router-dom';
import { ArrowRight, LogOut, Menu } from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../common/Button';
import { NAV_LINKS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { dashboardPathFor } from '../../utils/roles';

function NavLinks({ onNavigate = () => {} }) {
  return (
    <>
      {NAV_LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          className="rounded-md px-3 py-2 text-sm font-medium text-navy/80 transition-colors hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

function AuthActions({ onNavigate = () => {} }) {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <>
        <Link
          to={dashboardPathFor(user.role)}
          onClick={onNavigate}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-navy transition-colors hover:text-primary"
        >
          Dashboard
        </Link>
        <Button size="sm" variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </Button>
      </>
    );
  }

  return (
    <>
      <Link
        to="/login"
        onClick={onNavigate}
        className="rounded-lg px-4 py-2 text-sm font-semibold text-navy transition-colors hover:text-primary"
      >
        Log In
      </Link>
      <Link to="/register" onClick={onNavigate}>
        <Button size="sm">Start Learning</Button>
      </Link>
    </>
  );
}

export default function Navbar({ onMobileMenuToggle }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <AuthActions />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy hover:bg-surface md:hidden"
          aria-label="Open menu"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export function MobileMenu({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="border-b border-line bg-white md:hidden">
      <div className="container-page flex flex-col gap-1 py-4">
        <NavLinks onNavigate={onClose} />
        <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
          <AuthActions onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}