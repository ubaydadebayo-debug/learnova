import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import {
  getStoredToken,
  storeToken,
  removeStoredToken,
} from '../utils/authStorage';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(!!getStoredToken());

  const applyAuth = useCallback((payload) => {
    setUser(payload.user);
    setToken(payload.token);
    storeToken(payload.token);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    removeStoredToken();
  }, []);

  useEffect(() => {
    let active = true;

    if (!getStoredToken()) {
      setLoading(false);
      return undefined;
    }

    authService
      .getCurrentUser()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
      })
      .catch(() => {
        if (!active) return;
        clearAuth();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const { data } = await authService.login({ email, password });
      applyAuth(data);
      return data.user;
    },
    [applyAuth]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await authService.register(payload);
      applyAuth(data);
      return data.user;
    },
    [applyAuth]
  );

  const refreshUser = useCallback(async () => {
    const { data } = await authService.getCurrentUser();
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser, isAuthenticated: !!user }),
    [user, token, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}