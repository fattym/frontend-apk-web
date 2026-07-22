import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/api/auth/users/me/')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    console.log('Login attempt with:', { email, password: password ? '***' : 'empty' });
    try {
      const response = await api.post('/api/auth/login/', { email, password });
      console.log('Login response:', response.status, response.data);
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Login error:', err.response?.status, err.response?.data, err.message);
      throw err;
    }
  };

  const studentLogin = async (studentId, pinCode) => {
    const response = await api.post('/api/auth/student-login/', { student_id: studentId, pin_code: pinCode });
    const { access, refresh, user: userData } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const getDashboardRoute = (role) => {
    if (role === 'TEACHER') return '/teacher-dashboard';
    if (role === 'STUDENT') return '/student-dashboard';
    return '/school-dashboard';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getDashboardRoute }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
