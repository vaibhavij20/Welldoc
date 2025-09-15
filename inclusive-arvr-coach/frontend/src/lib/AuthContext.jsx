// frontend/src/lib/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
import * as api from './api';
import API from './api';
import { getUser as storedGetUser, clearAll, setUser as storeUser } from './userStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedGetUser());
  const [loading, setLoading] = useState(false);

  async function signup(payload) {
    setLoading(true);
    const res = await api.signup(payload);
    setLoading(false);
    if (res.success) setUser(res.data.user);
    return res;
  }
  async function login(payload) {
    setLoading(true);
    const res = await api.login(payload);
    setLoading(false);
    if (res.success) setUser(res.data.user);
    return res;
  }
  function logout() {
    clearAll();
    setUser(null);
    // remove axios header
    try { delete API.defaults.headers.common['Authorization']; } catch(e){}
  }
  async function updateLocalUser(next) {
    storeUser(next);
    setUser(next);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
