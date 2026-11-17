import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorUIStore, DEVICE_PRESETS } from '../editor-ui.store';

describe('useEditorUIStore', () => {
  beforeEach(() => {
    useEditorUIStore.getState().resetUI();
  });

  it('initializes with default settings', () => {
    const state = useEditorUIStore.getState();
    expect(state.device).toBe('phone');
    expect(state.zoom).toBe(1);
    expect(state.activeTool).toBe('select');
    expect(state.leftSidebarOpen).toBe(true);
    expect(state.rightSidebarOpen).toBe(true);
    expect(state.isPreviewMode).toBe(false);
    expect(state.saveStatus).toBe('saved');
  });

  it('switches devices and retrieves proper dimensions', () => {
    const store = useEditorUIStore.getState();
    store.setDevice('tablet');
    expect(useEditorUIStore.getState().device).toBe('tablet');
    expect(DEVICE_PRESETS.tablet).toEqual({ width: 768, height: 1024 });

    store.setDevice('desktop');
    expect(useEditorUIStore.getState().device).toBe('desktop');
    expect(DEVICE_PRESETS.desktop).toEqual({ width: 1280, height: 800 });
  });

  it('handles zoom levels with boundaries', () => {
    const store = useEditorUIStore.getState();

    store.zoomIn();
    expect(useEditorUIStore.getState().zoom).toBe(1.1);

    store.zoomOut();
    expect(useEditorUIStore.getState().zoom).toBe(1.0);

    store.setZoom(5.0); // should clamp to 3.0
    expect(useEditorUIStore.getState().zoom).toBe(3.0);

    store.setZoom(0.01); // should clamp to 0.25
    expect(useEditorUIStore.getState().zoom).toBe(0.25);

    store.resetZoom();
    expect(useEditorUIStore.getState().zoom).toBe(1);
  });

  it('toggles sidebars and preview mode', () => {
    const store = useEditorUIStore.getState();

    store.toggleLeftSidebar();
    expect(useEditorUIStore.getState().leftSidebarOpen).toBe(false);

    store.toggleRightSidebar();
    expect(useEditorUIStore.getState().rightSidebarOpen).toBe(false);

    store.togglePreviewMode();
    expect(useEditorUIStore.getState().isPreviewMode).toBe(true);
  });
});

