import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.data) {
      localStorage.setItem('portal_token', response.data.data.token);
      localStorage.setItem('portal_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API failed:', err.message);
    } finally {
      localStorage.removeItem('portal_token');
      localStorage.removeItem('portal_user');
    }
  },

  getStoredUser() {
    try {
      const u = localStorage.getItem('portal_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('portal_token');
  }
};
