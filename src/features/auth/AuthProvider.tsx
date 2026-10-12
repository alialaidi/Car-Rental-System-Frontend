import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from './AuthContext';
import { setTokenProvider, setUnauthorizedHandler } from '../../shared/api/authBridge';
import { ApiError } from '../../shared/api/apiError';
import type { AuthApi } from './api/authApi';
import { authApi } from './api/authApi';
import { userFromAccessToken } from './model/jwt';
import type {
  AuthStatus,
  AuthTokens,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from './model/session';
import { clearTokens, getAccessToken, getRefreshToken, storeTokens } from './tokenStore';

export interface AuthProviderProps extends PropsWithChildren {
  api?: AuthApi;
}

export function AuthProvider({ api = authApi, children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const refreshInFlight = useRef<Promise<boolean> | null>(null);
  const mounted = useRef(false);
  const refreshSessionRef = useRef<() => Promise<boolean>>(() => Promise.resolve(false));

  const clearSession = useCallback(() => {
    clearTokens();
    if (mounted.current) {
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const activateSession = useCallback(async (tokens: AuthTokens) => {
    const nextUser = userFromAccessToken(tokens.accessToken);
    if (!nextUser) {
      clearTokens();
      throw new ApiError({
        kind: 'parse',
        title: 'Invalid authentication token',
        detail: 'The server returned an unreadable sign-in token.',
      });
    }
    storeTokens(tokens.accessToken, tokens.refreshToken);
    if (mounted.current) {
      setUser(nextUser);
      setStatus('authenticated');
    }
  }, []);

  const refreshSession = useCallback((): Promise<boolean> => {
    if (refreshInFlight.current) return refreshInFlight.current;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      return Promise.resolve(false);
    }

    const operation = api
      .refresh(refreshToken)
      .then(activateSession)
      .then(() => true)
      .catch(() => {
        clearSession();
        return false;
      })
      .finally(() => {
        refreshInFlight.current = null;
      });

    refreshInFlight.current = operation;
    return operation;
  }, [api, activateSession, clearSession]);

  refreshSessionRef.current = refreshSession;

  const login = useCallback(
    async (request: LoginRequest) => {
      try {
        await activateSession(await api.login(request));
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [api, activateSession, clearSession],
  );

  const register = useCallback(
    async (request: RegisterRequest) => {
      try {
        await activateSession(await api.register(request));
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [api, activateSession, clearSession],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    clearSession();
    if (refreshToken) {
      try {
        await api.logout(refreshToken);
      } catch {
        // Local logout must finish even if the server is unavailable.
      }
    }
  }, [api, clearSession]);

  useEffect(() => {
    mounted.current = true;
    const unregisterTokenProvider = setTokenProvider(getAccessToken);
    const unregisterUnauthorizedHandler = setUnauthorizedHandler(() => refreshSessionRef.current());
    void refreshSessionRef.current();

    return () => {
      mounted.current = false;
      unregisterUnauthorizedHandler();
      unregisterTokenProvider();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, roles: user?.roles ?? [], status, login, register, logout, refreshSession }),
    [user, status, login, register, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
