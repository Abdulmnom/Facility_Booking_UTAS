import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fbk_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fbk_token'));
  // True until server-side token verification completes; prevents role-tampered
  // localStorage from being trusted before the /api/auth/me round-trip finishes.
  const [authLoading, setAuthLoading] = useState(() => !!localStorage.getItem('fbk_token'));

  const login = useCallback((tokenValue, userData) => {
    localStorage.setItem('fbk_token', tokenValue);
    localStorage.setItem('fbk_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fbk_token');
    localStorage.removeItem('fbk_user');
    setToken(null);
    setUser(null);
  }, []);

  // Verify token on mount — authoritative role comes from server, not localStorage
  useEffect(() => {
    if (token) {
      api.get('/api/auth/me')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('fbk_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setAuthLoading(false);
        });
    } else {
      setAuthLoading(false);
    }
  }, []); // eslint-disable-line

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
