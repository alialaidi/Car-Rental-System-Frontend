import { Link, Outlet } from 'react-router-dom';
import styles from './layouts.module.css';

export function PublicLayout() {
  return (
    <div className={styles.publicShell}>
      <a className={styles.skip} href="#public-main">
        Skip to main content
      </a>
      <header className={styles.publicHeader}>
        <Link className={styles.brand} to="/">
          Car Rental System
        </Link>
        <nav aria-label="Account navigation">
          <Link to="/login">Sign in</Link>
          <Link to="/register">Create account</Link>
        </nav>
      </header>
      <div id="public-main">
        <Outlet />
      </div>
    </div>
  );
}
