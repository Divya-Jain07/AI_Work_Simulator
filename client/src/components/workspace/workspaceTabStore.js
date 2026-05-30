import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWorkspaceTabStore = create(persist((set) => ({
  activeTabs: {},
  visitedTabs: {},
  setActiveTab: (workspaceId, tabId) => set((state) => ({
    activeTabs: {
      ...state.activeTabs,
      [workspaceId]: tabId
    },
    visitedTabs: {
      ...state.visitedTabs,
      [workspaceId]: Array.from(new Set([...(state.visitedTabs[workspaceId] || []), tabId]))
    }
  })),
  markVisited: (workspaceId, tabId) => set((state) => ({
    visitedTabs: {
      ...state.visitedTabs,
      [workspaceId]: Array.from(new Set([...(state.visitedTabs[workspaceId] || []), tabId]))
    }
  }))
}), {
  name: 'submission-workspace-tabs',
  partialize: (state) => ({ activeTabs: state.activeTabs, visitedTabs: state.visitedTabs })
}));
