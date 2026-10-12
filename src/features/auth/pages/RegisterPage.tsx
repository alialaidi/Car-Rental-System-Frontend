import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import styles from '../components/auth.module.css';

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <section aria-labelledby="register-title" className={styles.card}>
        <p className={styles.eyebrow}>Car Rental System</p>
        <h1 className={styles.title} id="register-title">
          Create your account
        </h1>
        <p className={styles.description}>A few details to get your rental account ready.</p>
        <RegisterForm onSuccess={() => navigate('/', { replace: true })} />
        <p className={styles.switchPage}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
