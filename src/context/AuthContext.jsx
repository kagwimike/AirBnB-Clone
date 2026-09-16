import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Create the context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On initial app load, check if user data already exists in local storage
  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      const storedUser = authService.getCurrentUser();
      const accessToken = localStorage.getItem('access_token');
      if (!storedUser || !accessToken) {
        if (active) setLoading(false);
        return;
      }
      try {
        const profile = await authService.getProfile();
        if (active) {
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } catch {
        authService.logout();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    restoreSession();
    return () => { active = false; };
  }, []);

  // Login handler
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  // Register handler
  const register = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  // Logout handler
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const setMode = async (mode) => {
    const nextUser = await authService.setMode(mode);
    setUser(nextUser);
    return nextUser;
  };

  const value = {
    user,
    login,
    register,
    logout,
    setMode,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use auth context in any component
export const useAuth = () => {
  return useContext(AuthContext);
};