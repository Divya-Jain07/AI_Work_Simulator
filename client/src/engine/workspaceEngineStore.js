import { create } from 'zustand';

export const useWorkspaceEngineStore = create((set) => ({
  role: null,
  taskType: null,
  workflowStage: 'briefing',
  activeTool: null,
  progress: 0,
  setWorkspaceContext: (context) => set((state) => ({
    ...state,
    ...context,
    progress: context.progress ?? state.progress
  })),
  setActiveTool: (activeTool) => set({ activeTool }),
  setWorkflowStage: (workflowStage) => set({ workflowStage })
}));
