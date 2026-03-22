import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('ci_token') : null,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem('ci_token', token);
    }
    set({ user, token });
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ci_token');
    }
    set({ user: null, token: null });
  },
}));
