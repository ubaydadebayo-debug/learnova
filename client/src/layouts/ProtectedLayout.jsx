import { Link, Outlet, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo';
import NotificationBell from '../components/layout/NotificationBell';
import UserMenu from '../components/layout/UserMenu';
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
  const { user } = useAuth();
  const home = dashboardPathFor(user?.role);
  const links = NAV_LINKS[user?.role] ?? [];
  const { pathname } = useLocation();

  let activeTo = null;
  for (const link of links) {
    const matches = pathname === link.to || pathname.startsWith(`${link.to}/`);
    if (matches && (activeTo === null || link.to.length > activeTo.length)) {
      activeTo = link.to;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-50 border-b border-line bg-white">
        <div className="container-page flex h-[72px] items-center justify-between gap-4">
          <Logo to={home} />

          <div className="flex items-center gap-2.5">
            {user?.role !== 'ADMIN' && <NotificationBell />}
            <UserMenu />
          </div>
        </div>
      </header>

      <nav aria-label="Primary" className="border-b border-line bg-white">
        <div className="container-page flex h-12 items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const isActive = link.to === activeTo;
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-surface focus:outline-2 focus:outline-primary ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-navy/60 hover:text-navy'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}