import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { landingFor } from './landing';

export function LandingRedirect() {
  const { roles } = useAuth();
  return <Navigate replace to={landingFor(roles)} />;
}
