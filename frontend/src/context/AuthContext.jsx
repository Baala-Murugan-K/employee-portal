import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = authService.getStoredUser();
    const token = authService.getToken();

    if (storedUser && token) {
      setUser(storedUser);
      // Verify freshness in background
      authService.getCurrentUser()
        .then(res => {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('portal_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          // Token expired or invalid
          authService.logout();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success && res.data) {
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (user.role === role) return true;
    if (Array.isArray(user.roles)) return user.roles.includes(role);
    return false;
  };

  const hasAnyRole = (roles = []) => {
    if (!user) return false;
    if (roles.includes(user.role)) return true;
    if (Array.isArray(user.roles)) {
      return user.roles.some(r => roles.includes(r));
    }
    return false;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (hasRole('Admin')) return true;
    return Array.isArray(user.permissions) && user.permissions.includes(permission);
  };

  const isAdmin = hasRole('Admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasRole,
        hasAnyRole,
        hasPermission,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
