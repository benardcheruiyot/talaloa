// Auth Context
import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isTokenExpired = (token) => {
      try {
        const payload = token.split('.')[1];
        if (!payload) return true;

        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
        const parsed = JSON.parse(decoded);

        if (!parsed.exp) return true;
        return Date.now() >= (parsed.exp * 1000) - 5000;
      } catch {
        return true;
      }
    };

    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token && !isTokenExpired(token)) {
      setUser(JSON.parse(savedUser));
    } else if (savedUser || token) {
      authService.logout();
    }

    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    setLoading(false);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const login = async (name, phone_number) => {
    const data = await authService.registerOrLogin(name, phone_number);
    setUser(data.user);
    
    // Store last transaction if available
    if (data.lastTransaction) {
      localStorage.setItem('last_transaction', JSON.stringify(data.lastTransaction));
    }
    
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    // Don't clear last_transaction - user should see it on next login
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
