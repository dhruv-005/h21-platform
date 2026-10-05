import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkSession = useCallback(async () => {
    try {
      const resp = await axios.get('/api/auth/me', { withCredentials: true });
      if (resp.data.success) {
        setUser(resp.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const signup = async (username, email, password) => {
    setError(null);
    try {
      const resp = await axios.post('/api/auth/signup', { username, email, password }, { withCredentials: true });
      if (resp.data.success) {
        setUser(resp.data.user);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed');
      return false;
    }
  };

  const login = async (username, password) => {
    setError(null);
    try {
      const resp = await axios.post('/api/auth/login', { username, password }, { withCredentials: true });
      if (resp.data.success) {
        setUser(resp.data.user);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch {
      // ignore
    }
    setUser(null);
  };

  return { user, loading, error, signup, login, logout, checkSession };
}