import { Link } from 'react-router-dom';
import BrandMark from '../common/BrandMark';
import { BRAND, NAV_LINKS } from '../../constants';

const footerLinks = [
  { heading: 'Learn', items: NAV_LINKS },
  {
    heading: 'Account',
    items: [
      { label: 'Log In', to: '/login' },
      { label: 'Register', to: '/register' },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { label: 'Privacy Policy', to: '/about' },
      { label: 'Terms of Service', to: '/about' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BrandMark className="h-7 w-7 text-primary" />
            <span className="font-heading text-lg font-extrabold text-navy">{BRAND.name}</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-navy/60">
            {BRAND.tagline} Courses, practice, progress tracking, and AI-powered guidance in one
            learning platform.
          </p>
        </div>

        {footerLinks.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h3 className="mb-3 text-sm font-semibold text-navy">{group.heading}</h3>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-navy/60 transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-sm text-navy/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p>Learn Smarter. Grow Further.</p>
        </div>
      </div>
    </footer>
  );
}