import { create } from 'zustand';
import type { BuiltinComponentType } from '@klnp/contracts';

export type DeviceType = 'phone' | 'tablet' | 'desktop';

export interface DeviceDimension {
  width: number;
  height: number;
}

export const DEVICE_PRESETS: Record<DeviceType, DeviceDimension> = {
  phone: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

export type ActiveTool = 'select' | 'pan' | 'insert';
export type LeftSidebarTab = 'components' | 'layers' | 'pages' | 'assets';
export type InspectorTab = 'properties' | 'style' | 'interactions';
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

export interface EditorUIState {
  device: DeviceType;
  deviceDimensions: Record<DeviceType, DeviceDimension>;
  zoom: number;
  pan: { x: number; y: number };

  activeTool: ActiveTool;
  activeInsertType: BuiltinComponentType | null;

  leftSidebarOpen: boolean;
  activeLeftTab: LeftSidebarTab;

  rightSidebarOpen: boolean;
  activeInspectorTab: InspectorTab;

  cursorPosition: { x: number; y: number };
  saveStatus: SaveStatus;
  isPreviewMode: boolean;

  // Actions
  setDevice: (device: DeviceType) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setPan: (pan: { x: number; y: number }) => void;
  updatePan: (deltaX: number, deltaY: number) => void;

  setActiveTool: (tool: ActiveTool) => void;
  setActiveInsertType: (type: BuiltinComponentType | null) => void;

  setLeftSidebarOpen: (open: boolean) => void;
  toggleLeftSidebar: () => void;
  setActiveLeftTab: (tab: LeftSidebarTab) => void;

  setRightSidebarOpen: (open: boolean) => void;
  toggleRightSidebar: () => void;
  setActiveInspectorTab: (tab: InspectorTab) => void;

  setCursorPosition: (pos: { x: number; y: number }) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setIsPreviewMode: (preview: boolean) => void;
  togglePreviewMode: () => void;

  resetUI: () => void;
}

const initialUIState = {
  device: 'phone' as DeviceType,
  deviceDimensions: DEVICE_PRESETS,
  zoom: 1,
  pan: { x: 0, y: 0 },
  activeTool: 'select' as ActiveTool,
  activeInsertType: null as BuiltinComponentType | null,
  leftSidebarOpen: true,
  activeLeftTab: 'components' as LeftSidebarTab,
  rightSidebarOpen: true,
  activeInspectorTab: 'properties' as InspectorTab,
  cursorPosition: { x: 0, y: 0 },
  saveStatus: 'saved' as SaveStatus,
  isPreviewMode: false,
};

export const useEditorUIStore = create<EditorUIState>((set) => ({
  ...initialUIState,

  setDevice: (device) => set({ device }),

  setZoom: (zoom) =>
    set({
      zoom: Math.min(3.0, Math.max(0.25, Math.round(zoom * 100) / 100)),
    }),

  zoomIn: () =>
    set((state) => ({
      zoom: Math.min(3.0, Math.round((state.zoom + 0.1) * 100) / 100),
    })),

  zoomOut: () =>
    set((state) => ({
      zoom: Math.max(0.25, Math.round((state.zoom - 0.1) * 100) / 100),
    })),

  resetZoom: () => set({ zoom: 1, pan: { x: 0, y: 0 } }),

  setPan: (pan) => set({ pan }),

  updatePan: (deltaX, deltaY) =>
    set((state) => ({
      pan: {
        x: Math.round(state.pan.x + deltaX),
        y: Math.round(state.pan.y + deltaY),
      },
    })),

  setActiveTool: (activeTool) =>
    set({
      activeTool,
      activeInsertType: activeTool === 'insert' ? undefined : null,
    }),

  setActiveInsertType: (type) =>
    set({
      activeInsertType: type,
      activeTool: type ? 'insert' : 'select',
    }),

  setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),

  toggleLeftSidebar: () =>
    set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),

  setActiveLeftTab: (activeLeftTab) =>
    set({
      activeLeftTab,
      leftSidebarOpen: true,
    }),

  setRightSidebarOpen: (rightSidebarOpen) => set({ rightSidebarOpen }),

  toggleRightSidebar: () =>
    set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),

  setActiveInspectorTab: (activeInspectorTab) =>
    set({
      activeInspectorTab,
      rightSidebarOpen: true,
    }),

  setCursorPosition: (cursorPosition) => set({ cursorPosition }),

  setSaveStatus: (saveStatus) => set({ saveStatus }),

  setIsPreviewMode: (isPreviewMode) => set({ isPreviewMode }),

  togglePreviewMode: () =>
    set((state) => ({ isPreviewMode: !state.isPreviewMode })),

  resetUI: () => set(initialUIState),
}));

