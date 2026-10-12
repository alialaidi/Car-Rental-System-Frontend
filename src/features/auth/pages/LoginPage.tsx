import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import styles from '../components/auth.module.css';

function safeReturnPath(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/';
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { returnTo?: unknown } | null;

  return (
    <main className={styles.page}>
      <section aria-labelledby="login-title" className={styles.card}>
        <p className={styles.eyebrow}>Car Rental System</p>
        <h1 className={styles.title} id="login-title">
          Welcome back
        </h1>
        <p className={styles.description}>Sign in to manage your car rentals.</p>
        <LoginForm onSuccess={() => navigate(safeReturnPath(state?.returnTo), { replace: true })} />
        <p className={styles.switchPage}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
