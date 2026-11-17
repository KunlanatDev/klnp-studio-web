import { create } from 'zustand';

interface CanvasState {
  selectedNodeId: string | null;
  zoom: number;
  isDirty: boolean;

  setSelectedNode: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

const initialState = {
  selectedNodeId: null,
  zoom: 1,
  isDirty: false,
};

export const useCanvasStore = create<CanvasState>((set) => ({
  ...initialState,

  setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),

  setZoom: (zoom) => set({
    zoom: Math.min(2, Math.max(0.25, zoom)),
  }),

  setDirty: (isDirty) => set({ isDirty }),

  reset: () => set(initialState),
}));
