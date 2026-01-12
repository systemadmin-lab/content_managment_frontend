import { api } from './api';

export const authService = {
  async register(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: any) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me'); // Assuming /auth/me follows the pattern
    return response.data;
  },
};
