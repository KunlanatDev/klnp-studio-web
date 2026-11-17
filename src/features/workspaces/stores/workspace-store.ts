import { create } from 'zustand';
import {
  listWorkspaces,
  createWorkspace,
  updateWorkspace,
  type Workspace,
} from '../api/workspace-api';

type WorkspaceState = {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  error: string | null;

  fetchWorkspaces: () => Promise<void>;
  create: (name: string, slug: string) => Promise<Workspace>;
  update: (id: string, name: string) => Promise<Workspace>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  clearError: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  loading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ loading: true, error: null });
    try {
      const rawData = await listWorkspaces();
      const data = Array.isArray(rawData) ? rawData : [];
      const current = get().currentWorkspace;
      let nextCurrent = current;

      if (!current && data.length > 0) {
        nextCurrent = data[0];
      } else if (current && !data.some((w) => w.id === current.id)) {
        nextCurrent = data.length > 0 ? data[0] : null;
      }

      set({ workspaces: data, currentWorkspace: nextCurrent, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load workspaces';
      set({ workspaces: [], loading: false, error: message });
    }
  },

  create: async (name: string, slug: string) => {
    set({ loading: true, error: null });
    try {
      const newWs = await createWorkspace({ name, slug });
      const currentList = Array.isArray(get().workspaces) ? get().workspaces : [];
      const updated = [newWs, ...currentList];
      set({
        workspaces: updated,
        currentWorkspace: newWs,
        loading: false,
      });
      return newWs;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create workspace';
      set({ loading: false, error: message });
      throw err;
    }
  },

  update: async (id: string, name: string) => {
    set({ loading: true, error: null });
    try {
      const updatedWs = await updateWorkspace(id, { name });
      const currentList = Array.isArray(get().workspaces) ? get().workspaces : [];
      const updatedList = currentList.map((w) =>
        w.id === id ? updatedWs : w,
      );
      set({
        workspaces: updatedList,
        currentWorkspace:
          get().currentWorkspace?.id === id ? updatedWs : get().currentWorkspace,
        loading: false,
      });
      return updatedWs;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update workspace';
      set({ loading: false, error: message });
      throw err;
    }
  },

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  clearError: () => set({ error: null }),
}));
