import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  // Per-resource filters
  receipts: { search: '', status: [], page: 1, dateFrom: '', dateTo: '' },
  deliveries: { search: '', status: [], page: 1, dateFrom: '', dateTo: '' },
  transfers: { search: '', status: [], page: 1, dateFrom: '', dateTo: '' },
  adjustments: { search: '', status: [], page: 1 },
  products: { search: '', categoryId: '', page: 1 },
  moveHistory: { type: '', productId: '', locationId: '', from: '', to: '', page: 1 },

  setFilter: (resource, updates) =>
    set((state) => ({
      [resource]: { ...state[resource], ...updates },
    })),

  resetFilter: (resource) =>
    set((state) => {
      const defaults = {
        receipts: { search: '', status: [], page: 1, dateFrom: '', dateTo: '' },
        deliveries: { search: '', status: [], page: 1, dateFrom: '', dateTo: '' },
        transfers: { search: '', status: [], page: 1, dateFrom: '', dateTo: '' },
        adjustments: { search: '', status: [], page: 1 },
        products: { search: '', categoryId: '', page: 1 },
        moveHistory: { type: '', productId: '', locationId: '', from: '', to: '', page: 1 },
      };
      return { [resource]: defaults[resource] || {} };
    }),
}));
