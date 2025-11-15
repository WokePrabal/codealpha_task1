// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

// Named export – App/main me yahi use ho raha hai
export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Helper: set + localStorage + axios header
  const setUser = (u) => {
    setUserState(u);
    try {
      if (u) localStorage.setItem('user', JSON.stringify(u));
      else localStorage.removeItem('user');
    } catch (e) {}

    if (u && u.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${u.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    if (user && user.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    }
  }, []); // only once on mount

  const login = async (email, password) => {
    const { data } = await api.post('/users/login', { email, password });
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/users/register', payload);
    setUser(data);
    return data;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
