import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),
  applyLiveSnapshot: (snapshot) => set({ snapshot })
}));
