import { useEffect, useState, type ReactNode } from 'react';
import apiClient, { FORCED_LOGOUT_EVENT } from '../api/client';
import type { AuthUser } from '../types/auth';
import { AuthContext } from './AuthContext';
import { clearToken, getToken, setToken as persistToken } from './tokenStorage';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const existingToken = getToken();
    if (!existingToken) {
      setIsLoading(false);
      return;
    }

    setTokenState(existingToken);
    apiClient
      .get<AuthUser>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        clearToken();
        setUser(null);
        setTokenState(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      setTokenState(null);
    };
    window.addEventListener(FORCED_LOGOUT_EVENT, handleForcedLogout);
    return () => window.removeEventListener(FORCED_LOGOUT_EVENT, handleForcedLogout);
  }, []);

  async function login(newToken: string): Promise<AuthUser> {
    persistToken(newToken);
    setTokenState(newToken);
    try {
      const res = await apiClient.get<AuthUser>('/auth/me');
      setUser(res.data);
      return res.data;
    } catch (err) {
      clearToken();
      setUser(null);
      setTokenState(null);
      throw err;
    }
  }

  function logout(): void {
    clearToken();
    setUser(null);
    setTokenState(null);
  }

  return <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}
