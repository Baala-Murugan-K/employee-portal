import api from './api';

export const adminService = {
  async getUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async createUser(userData) {
    const res = await api.post('/admin/users', userData);
    return res.data;
  },

  async updateUser(id, userData) {
    const res = await api.put(`/admin/users/${id}`, userData);
    return res.data;
  },

  async deleteUser(id) {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  async getAuditLogs(params = {}) {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  },

  async getSystemStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async getRoles() {
    const res = await api.get('/roles');
    return res.data;
  }
};
