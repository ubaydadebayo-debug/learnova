import { Link, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import NotificationBell from '../components/layout/NotificationBell';
import { useAuth } from '../context/AuthContext';
import { dashboardPathFor } from '../utils/roles';

const NAV_LINKS = {
  STUDENT: [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/courses', label: 'My Courses' },
    { to: '/student/assignments', label: 'Assignments' },
    { to: '/student/ai-tutor', label: 'AI Tutor' },
    { to: '/student/certificates', label: 'Certificates' },
    { to: '/student/notifications', label: 'Notifications' },
    { to: '/student/profile', label: 'Profile' },
    { to: '/student/settings', label: 'Settings' },
  ],
  INSTRUCTOR: [
    { to: '/instructor/dashboard', label: 'Dashboard' },
    { to: '/instructor/courses', label: 'My Courses' },
    { to: '/instructor/courses/create', label: 'New Course' },
    { to: '/instructor/assignments', label: 'Assignments' },
    { to: '/instructor/analytics', label: 'Analytics' },
    { to: '/instructor/students', label: 'Students' },
    { to: '/instructor/notifications', label: 'Notifications' },
    { to: '/instructor/profile', label: 'Profile' },
    { to: '/instructor/settings', label: 'Settings' },
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/instructors', label: 'Instructors' },
    { to: '/admin/courses', label: 'Courses' },
    { to: '/admin/quizzes', label: 'Quizzes' },
    { to: '/admin/assignments', label: 'Assignments' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/enrollments', label: 'Enrollments' },
    { to: '/admin/certificates', label: 'Certificates' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/profile', label: 'Profile' },
    { to: '/admin/settings', label: 'Settings' },
  ],
};

export default function ProtectedLayout() {
  const { user, logout } = useAuth();
  const home = dashboardPathFor(user?.role);
  const links = NAV_LINKS[user?.role] ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to={home} aria-label="Go to dashboard">
            <Logo />
          </Link>

          <div className="flex items-center gap-3">
            {user?.role !== 'ADMIN' && <NotificationBell />}
            <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary sm:inline-block">
              {user?.role}
            </span>
            <span className="text-sm font-medium text-navy/70">
              {user?.firstName} {user?.lastName}
            </span>
            <Button size="sm" variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <nav aria-label="Primary" className="border-b border-line bg-white">
        <div className="container-page flex h-12 items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold text-navy/60 transition-colors hover:bg-surface hover:text-navy focus:outline-2 focus:outline-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}