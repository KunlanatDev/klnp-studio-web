import { create } from 'zustand';
import type {
  KLNPDocument,
  KLNPNode,
  BuiltinComponentType,
  NodeGeometry,
  NodeLayout,
  NodeStyle,
} from '@klnp/contracts';
import { COMPONENT_MAP } from '../registry/component-registry';

export interface EditorDocumentState {
  document: KLNPDocument | null;
  selectedNodeIds: string[];
  hoveredNodeId: string | null;
  isDirty: boolean;

  past: KLNPDocument[];
  future: KLNPDocument[];

  // Document initialization & loading
  setDocument: (doc: KLNPDocument) => void;
  initializeEmptyDocument: (projectId: string, pageId: string, pageName: string) => void;

  // Node selection & hover
  selectNode: (nodeId: string | null, multi?: boolean) => void;
  setHoveredNode: (nodeId: string | null) => void;
  clearSelection: () => void;

  // Node mutations
  addNode: (type: BuiltinComponentType, parentId?: string | null, geometry?: Partial<NodeGeometry>) => string;
  updateNodeGeometry: (nodeId: string, geometry: Partial<NodeGeometry>) => void;
  updateNodeLayout: (nodeId: string, layout: NodeLayout) => void;
  updateNodeStyle: (nodeId: string, style: Partial<NodeStyle>) => void;
  updateNodeProperties: (nodeId: string, properties: Record<string, unknown>) => void;
  renameNode: (nodeId: string, name: string) => void;
  toggleNodeVisibility: (nodeId: string) => void;
  toggleNodeLocked: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  reset: () => void;
}

function createDefaultDocument(projectId: string, pageId: string, pageName: string): KLNPDocument {
  const rootContainerId = 'node_root_container';

  const rootContainer: KLNPNode = {
    id: rootContainerId,
    type: 'container',
    name: 'Root Container',
    children: ['node_welcome_title', 'node_welcome_subtext', 'node_get_started_btn'],
    geometry: {
      x: 20,
      y: 40,
      width: 335,
      height: 480,
    },
    layout: {
      mode: 'flex',
      direction: 'column',
      justify: 'flex-start',
      align: 'stretch',
      gap: 16,
      padding: { top: 24, right: 20, bottom: 24, left: 20 },
    },
    style: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderStyle: 'solid',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    },
    properties: {},
    visible: true,
    locked: false,
  };

  const titleNode: KLNPNode = {
    id: 'node_welcome_title',
    type: 'text',
    name: 'Page Title',
    parentId: rootContainerId,
    children: [],
    geometry: { x: 0, y: 0, width: 295, height: 38 },
    style: {
      fontSize: 22,
      fontWeight: '700',
      color: '#0f172a',
      textAlign: 'left',
    },
    properties: {
      text: pageName || 'Welcome to Page',
    },
    visible: true,
    locked: false,
  };

  const subtextNode: KLNPNode = {
    id: 'node_welcome_subtext',
    type: 'text',
    name: 'Subtitle',
    parentId: rootContainerId,
    children: [],
    geometry: { x: 0, y: 0, width: 295, height: 44 },
    style: {
      fontSize: 14,
      fontWeight: '400',
      color: '#64748b',
      lineHeight: 1.5,
    },
    properties: {
      text: 'Start designing your app UI by selecting or dragging components from the left sidebar.',
    },
    visible: true,
    locked: false,
  };

  const buttonNode: KLNPNode = {
    id: 'node_get_started_btn',
    type: 'button',
    name: 'Action Button',
    parentId: rootContainerId,
    children: [],
    geometry: { x: 0, y: 0, width: 295, height: 44 },
    style: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
      borderRadius: 8,
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
    },
    properties: {
      label: 'Explore Components',
      variant: 'contained',
    },
    visible: true,
    locked: false,
  };

  return {
    schemaVersion: '1.0.0',
    documentId: `doc_${pageId}`,
    pageId,
    metadata: {
      name: pageName,
      description: `Project ${projectId} - Page ${pageName}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    canvas: {
      width: 375,
      height: 812,
      background: {
        color: '#f8fafc',
      },
    },
    rootNodeIds: [rootContainerId],
    nodes: {
      [rootContainerId]: rootContainer,
      node_welcome_title: titleNode,
      node_welcome_subtext: subtextNode,
      node_get_started_btn: buttonNode,
    },
  };
}

const MAX_HISTORY_STEPS = 50;

export const useEditorDocumentStore = create<EditorDocumentState>((set, get) => ({
  document: null,
  selectedNodeIds: [],
  hoveredNodeId: null,
  isDirty: false,
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  setDocument: (doc) =>
    set({
      document: doc,
      selectedNodeIds: [],
      hoveredNodeId: null,
      isDirty: false,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    }),

  initializeEmptyDocument: (projectId, pageId, pageName) => {
    const doc = createDefaultDocument(projectId, pageId, pageName);
    set({
      document: doc,
      selectedNodeIds: [doc.rootNodeIds[0]],
      hoveredNodeId: null,
      isDirty: false,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },

  selectNode: (nodeId, multi = false) => {
    if (!nodeId) {
      set({ selectedNodeIds: [] });
      return;
    }

    set((state) => {
      if (multi) {
        const exists = state.selectedNodeIds.includes(nodeId);
        return {
          selectedNodeIds: exists
            ? state.selectedNodeIds.filter((id) => id !== nodeId)
            : [...state.selectedNodeIds, nodeId],
        };
      }
      return { selectedNodeIds: [nodeId] };
    });
  },

  setHoveredNode: (hoveredNodeId) => set({ hoveredNodeId }),

  clearSelection: () => set({ selectedNodeIds: [] }),

  addNode: (type, parentId = null, geometry = {}) => {
    const state = get();
    const doc = state.document;
    if (!doc) return '';

    const meta = COMPONENT_MAP.get(type);
    const newId = `node_${type}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;

    const newNode: KLNPNode = {
      id: newId,
      type,
      name: meta?.displayName || type,
      parentId: parentId || null,
      children: [],
      geometry: {
        x: geometry.x ?? 20,
        y: geometry.y ?? 20,
        width: geometry.width ?? meta?.defaultGeometry?.width ?? 200,
        height: geometry.height ?? meta?.defaultGeometry?.height ?? 50,
        ...geometry,
      },
      style: { ...(meta?.defaultStyle || {}) },
      properties: { ...(meta?.defaultProperties || {}) },
      visible: true,
      locked: false,
    };

    const newNodes = { ...doc.nodes, [newId]: newNode };
    let newRootNodeIds = [...doc.rootNodeIds];

    if (parentId && newNodes[parentId]) {
      const parent = { ...newNodes[parentId] };
      parent.children = [...parent.children, newId];
      newNodes[parentId] = parent;
    } else {
      newRootNodeIds.push(newId);
    }

    const updatedDoc: KLNPDocument = {
      ...doc,
      rootNodeIds: newRootNodeIds,
      nodes: newNodes,
      metadata: { ...doc.metadata, updatedAt: new Date().toISOString() },
    };

    set({
      past: [...state.past.slice(-MAX_HISTORY_STEPS), doc],
      future: [],
      document: updatedDoc,
      selectedNodeIds: [newId],
      isDirty: true,
      canUndo: true,
      canRedo: false,
    });

    return newId;
  },

  updateNodeGeometry: (nodeId, geometryUpdate) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    const current = doc.nodes[nodeId];
    const updatedNode: KLNPNode = {
      ...current,
      geometry: {
        x: current.geometry?.x ?? 0,
        y: current.geometry?.y ?? 0,
        width: current.geometry?.width ?? 100,
        height: current.geometry?.height ?? 100,
        ...current.geometry,
        ...geometryUpdate,
      },
    };

    const updatedDoc: KLNPDocument = {
      ...doc,
      nodes: { ...doc.nodes, [nodeId]: updatedNode },
      metadata: { ...doc.metadata, updatedAt: new Date().toISOString() },
    };

    set({
      past: [...state.past.slice(-MAX_HISTORY_STEPS), doc],
      future: [],
      document: updatedDoc,
      isDirty: true,
      canUndo: true,
      canRedo: false,
    });
  },

  updateNodeLayout: (nodeId, layout) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    const current = doc.nodes[nodeId];
    const updatedNode: KLNPNode = {
      ...current,
      layout,
    };

    const updatedDoc: KLNPDocument = {
      ...doc,
      nodes: { ...doc.nodes, [nodeId]: updatedNode },
      metadata: { ...doc.metadata, updatedAt: new Date().toISOString() },
    };

    set({
      past: [...state.past.slice(-MAX_HISTORY_STEPS), doc],
      future: [],
      document: updatedDoc,
      isDirty: true,
      canUndo: true,
      canRedo: false,
    });
  },

  updateNodeStyle: (nodeId, styleUpdate) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    const current = doc.nodes[nodeId];
    const updatedNode: KLNPNode = {
      ...current,
      style: {
        ...(current.style || {}),
        ...styleUpdate,
      },
    };

    const updatedDoc: KLNPDocument = {
      ...doc,
      nodes: { ...doc.nodes, [nodeId]: updatedNode },
      metadata: { ...doc.metadata, updatedAt: new Date().toISOString() },
    };

    set({
      past: [...state.past.slice(-MAX_HISTORY_STEPS), doc],
      future: [],
      document: updatedDoc,
      isDirty: true,
      canUndo: true,
      canRedo: false,
    });
  },

  updateNodeProperties: (nodeId, propertiesUpdate) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    const current = doc.nodes[nodeId];
    const updatedNode: KLNPNode = {
      ...current,
      properties: {
        ...current.properties,
        ...propertiesUpdate,
      },
    };

    const updatedDoc: KLNPDocument = {
      ...doc,
      nodes: { ...doc.nodes, [nodeId]: updatedNode },
      metadata: { ...doc.metadata, updatedAt: new Date().toISOString() },
    };

    set({
      past: [...state.past.slice(-MAX_HISTORY_STEPS), doc],
      future: [],
      document: updatedDoc,
      isDirty: true,
      canUndo: true,
      canRedo: false,
    });
  },

  renameNode: (nodeId, name) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    const updatedNode: KLNPNode = { ...doc.nodes[nodeId], name };
    const updatedDoc: KLNPDocument = {
      ...doc,
      nodes: { ...doc.nodes, [nodeId]: updatedNode },
    };

    set({ document: updatedDoc, isDirty: true });
  },

  toggleNodeVisibility: (nodeId) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    const current = doc.nodes[nodeId];
    const updatedNode: KLNPNode = { ...current, visible: current.visible === false ? true : false };
    const updatedDoc: KLNPDocument = {
      ...doc,
      nodes: { ...doc.nodes, [nodeId]: updatedNode },
    };

    set({ document: updatedDoc, isDirty: true });
  },

  toggleNodeLocked: (nodeId) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    const current = doc.nodes[nodeId];
    const updatedNode: KLNPNode = { ...current, locked: !current.locked };
    const updatedDoc: KLNPDocument = {
      ...doc,
      nodes: { ...doc.nodes, [nodeId]: updatedNode },
    };

    set({ document: updatedDoc, isDirty: true });
  },

  deleteNode: (nodeId) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    // Collect all descendant ids recursively
    const collectDescendants = (id: string): string[] => {
      const node = doc.nodes[id];
      if (!node) return [];
      let res = [id];
      for (const childId of node.children) {
        res = [...res, ...collectDescendants(childId)];
      }
      return res;
    };

    const idsToDelete = new Set(collectDescendants(nodeId));
    const targetNode = doc.nodes[nodeId];

    const newNodes = { ...doc.nodes };
    for (const id of idsToDelete) {
      delete newNodes[id];
    }

    // Remove from parent's children or rootNodeIds
    if (targetNode.parentId && newNodes[targetNode.parentId]) {
      const parent = { ...newNodes[targetNode.parentId] };
      parent.children = parent.children.filter((cid) => cid !== nodeId);
      newNodes[targetNode.parentId] = parent;
    }

    const newRootNodeIds = doc.rootNodeIds.filter((rid) => !idsToDelete.has(rid));

    const updatedDoc: KLNPDocument = {
      ...doc,
      rootNodeIds: newRootNodeIds,
      nodes: newNodes,
      metadata: { ...doc.metadata, updatedAt: new Date().toISOString() },
    };

    set({
      past: [...state.past.slice(-MAX_HISTORY_STEPS), doc],
      future: [],
      document: updatedDoc,
      selectedNodeIds: state.selectedNodeIds.filter((id) => !idsToDelete.has(id)),
      isDirty: true,
      canUndo: true,
      canRedo: false,
    });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0 || !state.document) return;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);

    set({
      past: newPast,
      future: [state.document, ...state.future],
      document: previous,
      selectedNodeIds: [],
      canUndo: newPast.length > 0,
      canRedo: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0 || !state.document) return;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    set({
      past: [...state.past, state.document],
      future: newFuture,
      document: next,
      selectedNodeIds: [],
      canUndo: true,
      canRedo: newFuture.length > 0,
    });
  },

  reset: () =>
    set({
      document: null,
      selectedNodeIds: [],
      hoveredNodeId: null,
      isDirty: false,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    }),
}));

