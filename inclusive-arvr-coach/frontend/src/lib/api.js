// frontend/src/lib/api.js
import axios from 'axios';
import { getToken, setToken, setUser } from './userStore';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

const token = getToken();
if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;

export async function signup({ name, email, password }) {
  try {
    const res = await API.post('/auth/signup', { name, email, password });
    if (res.data?.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: e.response?.data?.error || e.message };
  }
}

export async function login({ email, password, twoFactorToken }) {
  try {
    const res = await API.post('/auth/login', { email, password, twoFactorToken });
    if (res.data?.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
    return { success: true, data: res.data, requiresTwoFactor: res.data.requiresTwoFactor };
  } catch (e) {
    return { success: false, error: e.response?.data?.error || e.message };
  }
}

export async function sendEvent(event) {
  try { await API.post('/api/events', event); return { success: true }; }
  catch (e) { return { success: false, error: e.response?.data?.error || e.message }; }
}

export async function sendConsent(payload) {
  try { await API.post('/api/consent', payload); return { success: true }; }
  catch (e) { return { success: false, error: e.response?.data?.error || e.message }; }
}

// 2FA API functions
export async function setupTwoFactor() {
  try {
    const res = await API.post('/auth/2fa/setup');
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: e.response?.data?.error || e.message };
  }
}

export async function verifyTwoFactor(token) {
  try {
    const res = await API.post('/auth/2fa/verify', { token });
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: e.response?.data?.error || e.message };
  }
}

export async function disableTwoFactor() {
  try {
    const res = await API.post('/auth/2fa/disable');
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: e.response?.data?.error || e.message };
  }
}

export async function getTwoFactorStatus() {
  try {
    const res = await API.get('/auth/2fa/status');
    return { success: true, data: res.data };
  } catch (e) {
    return { success: false, error: e.response?.data?.error || e.message };
  }
}

export default API;
