import api from './api';

export const zohoService = {
  async getAuthorizedApps() {
    const res = await api.get('/zoho/apps');
    return res.data;
  },

  async getPeopleData() {
    const res = await api.get('/zoho/people');
    return res.data;
  },

  async getCrmData() {
    const res = await api.get('/zoho/crm');
    return res.data;
  },

  async getDeskData() {
    const res = await api.get('/zoho/desk');
    return res.data;
  },

  async getBooksData() {
    const res = await api.get('/zoho/books');
    return res.data;
  },

  async testConnection() {
    const res = await api.get('/zoho/test-connection');
    return res.data;
  }
};
