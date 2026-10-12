import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui';
import { navFor } from '../navigation';
import { useAuth } from '../../features/auth/useAuth';
import styles from './layouts.module.css';

export function AppLayout() {
  const { user, roles, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    const focusHeading = () => {
      const heading = mainRef.current?.querySelector<HTMLElement>('h1');
      if (!heading) return false;
      heading.tabIndex = -1;
      heading.focus();
      return true;
    };
    if (focusHeading()) return;
    const observer = new MutationObserver(() => {
      if (focusHeading()) observer.disconnect();
    });
    if (mainRef.current) observer.observe(mainRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#app-main">
        Skip to main content
      </a>
      <header className={styles.header}>
        <Link className={styles.brand} to="/">
          Car Rental System
        </Link>
        <Button
          className={styles.menuToggle}
          aria-controls="primary-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </Button>
        <nav
          aria-label="Primary navigation"
          className={[styles.nav, menuOpen ? styles.open : ''].join(' ')}
          id="primary-navigation"
        >
          {navFor(roles).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? styles.active : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.account}>
          <span>{user?.username ?? 'Account'}</span>
          <Button
            variant="ghost"
            onClick={() => void logout().then(() => navigate('/login', { replace: true }))}
          >
            Sign out
          </Button>
        </div>
      </header>
      <main className={styles.main} id="app-main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
