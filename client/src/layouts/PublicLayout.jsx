import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar, { MobileMenu } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onMobileMenuToggle={() => setMenuOpen((open) => !open)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}