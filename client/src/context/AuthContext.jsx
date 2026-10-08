import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('quickfix_token'));

  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('quickfix_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getMe();
      setUser(res.data.user);
      setProviderProfile(res.data.providerProfile || null);
    } catch {
      localStorage.removeItem('quickfix_token');
      localStorage.removeItem('quickfix_user');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token: newToken, user: newUser, providerProfile: pp } = res.data;
    localStorage.setItem('quickfix_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setProviderProfile(pp || null);
    return newUser;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('quickfix_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setProviderProfile(null);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('quickfix_token');
    localStorage.removeItem('quickfix_user');
    setToken(null);
    setUser(null);
    setProviderProfile(null);
  };

  const updateUser = (updatedUser) => setUser(updatedUser);
  const updateProviderProfile = (pp) => setProviderProfile(pp);

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';
  const isProvider = user?.role === 'provider';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider value={{
      user, providerProfile, loading, token, isAuthenticated,
      isAdmin, isProvider, isCustomer,
      login, register, logout, updateUser, updateProviderProfile, loadUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
