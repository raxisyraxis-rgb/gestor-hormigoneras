
import { useState, useEffect, useCallback } from 'react';
import type { UserProfile, UserRole } from '../types';
import { apiLogin } from '../services/api';

interface AuthState {
  user: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula la comprobación del estado de autenticación al cargar
    const checkAuth = () => {
      try {
        const storedUser = sessionStorage.getItem('authUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Error al parsear usuario de sessionStorage", e);
        sessionStorage.removeItem('authUser');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await apiLogin(email, pass);
      setUser(userData);
      sessionStorage.setItem('authUser', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('authUser');
  }, []);

  return {
    user,
    role: user?.role || null,
    loading,
    error,
    login,
    logout,
  };
};
