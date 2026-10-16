import { useEffect, useState, type ReactNode } from 'react';
import apiClient, { FORCED_LOGOUT_EVENT } from '../api/client';
import type { AuthUser } from '../types/auth';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // The session cookie is httpOnly, so the page can't tell on its own whether it's signed in —
  // ask the API.
  useEffect(() => {
    apiClient
      .get<AuthUser>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => setUser(null);
    window.addEventListener(FORCED_LOGOUT_EVENT, handleForcedLogout);
    return () => window.removeEventListener(FORCED_LOGOUT_EVENT, handleForcedLogout);
  }, []);

  async function login(email: string, password: string): Promise<AuthUser> {
    const res = await apiClient.post<AuthUser>('/auth/login', { email, password });
    setUser(res.data);
    return res.data;
  }

  async function logout(): Promise<void> {
    await apiClient.post('/auth/logout').catch(() => {});
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}
