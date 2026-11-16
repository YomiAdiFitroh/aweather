'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api, refreshSession, setAccessToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, try to restore the session from the refresh cookie.
  useEffect(() => {
    let active = true;
    refreshSession().then((session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function authenticate(path, body) {
    const data = await api(path, { method: 'POST', body });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }

  const value = {
    user,
    loading,
    login: (email, password) => authenticate('/auth/login', { email, password }),
    register: (name, email, password) => authenticate('/auth/register', { name, email, password }),
    logout: async () => {
      await api('/auth/logout', { method: 'POST' }).catch(() => {});
      setAccessToken(null);
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
