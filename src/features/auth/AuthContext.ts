import { createContext } from 'react';
import type { AuthStatus, AuthUser, LoginRequest, RegisterRequest, Role } from './model/session';

export interface AuthContextValue {
  user: AuthUser | null;
  roles: Role[];
  status: AuthStatus;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
