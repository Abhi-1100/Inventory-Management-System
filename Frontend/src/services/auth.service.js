import api from './api';

export const authService = {
  /**
   * Login user and save token
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('ci_token', response.data.token);
    }
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Logout user and clear storage
   */
  logout() {
    localStorage.removeItem('ci_token');
  },

  /**
   * Update user profile
   * @param {string} name
   * @param {string} email
   */
  async updateProfile(name, email) {
    const response = await api.put('/profile', { name, email });
    return response.data;
  }
};
