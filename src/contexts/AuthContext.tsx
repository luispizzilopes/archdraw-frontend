import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getUser, removeToken, removeUser, restoreSession, setUnauthorizedHandler, USER_CHANGED_EVENT } from '@/services/api/api';
import { authService } from '@/services/auth/authService';
import type { SessionUser } from '@/types/auth';

interface AuthContextValue {
  user: SessionUser | null;
  restoring: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<SessionUser | null>(() => getUser());
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let alive = true;
    void restoreSession().then((ok) => {
      if (!alive) return;
      setUserState(ok ? getUser() : null);
      setRestoring(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const sync = () => setUserState(getUser());
    window.addEventListener(USER_CHANGED_EVENT, sync);
    setUnauthorizedHandler(() => setUserState(null));
    return () => {
      window.removeEventListener(USER_CHANGED_EVENT, sync);
      setUnauthorizedHandler(null);
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      removeToken();
      removeUser();
    }
    setUserState(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, restoring, isAuthenticated: user !== null, logout }), [user, restoring, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
