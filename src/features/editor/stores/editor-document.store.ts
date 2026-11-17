import { create } from 'zustand';
import type {
  KLNPDocument,
  KLNPNode,
  BuiltinComponentType,
  NodeGeometry,
  NodeLayout,
  NodeStyle,
  NodeKind,
} from '@klnp/contracts';
import { COMPONENT_MAP } from '../registry/component-registry';

export type ComponentRole = 'none' | 'button' | 'input' | 'container';

export interface EditorDocumentState {
  document: KLNPDocument | null;
  revision: number;
  selectedNodeIds: string[];
  hoveredNodeId: string | null;
  isDirty: boolean;

  past: KLNPDocument[];
  future: KLNPDocument[];

  // Document initialization & loading
  setDocument: (doc: KLNPDocument, revision?: number) => void;
  setRevision: (revision: number) => void;
  initializeEmptyDocument: (projectId: string, pageId: string, pageName: string) => void;
  loadLoginTemplate: () => void;
  clearCanvas: () => void;

  // Node selection & hover
  selectNode: (nodeId: string | null, multi?: boolean) => void;
  selectNodes: (nodeIds: string[]) => void;
  setHoveredNode: (nodeId: string | null) => void;
  clearSelection: () => void;

  // Node mutations
  addNode: (
    type: BuiltinComponentType,
    parentId?: string | null,
    geometry?: Partial<NodeGeometry>,
    extraProperties?: Record<string, unknown>,
    styleOverride?: Partial<NodeStyle>
  ) => string;
  updateNodeGeometry: (nodeId: string, geometry: Partial<NodeGeometry>, recordHistory?: boolean) => void;
  commitSnapshotToHistory: (snapshot: KLNPDocument) => void;
  updateNodeLayout: (nodeId: string, layout: NodeLayout) => void;
  updateNodeStyle: (nodeId: string, style: Partial<NodeStyle>) => void;
  updateNodeProperties: (nodeId: string, properties: Record<string, unknown>) => void;
  renameNode: (nodeId: string, name: string) => void;
  toggleNodeVisibility: (nodeId: string) => void;
  toggleNodeLocked: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;

  // Freeform Group & Component Intelligence (S3-08 & S4-03)
  groupSelectedNodes: (name?: string) => string | null;
  ungroupNode: (groupId: string) => void;
  convertToComponent: (
    nodeId: string,
    role: ComponentRole,
    properties?: Record<string, unknown>
  ) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  reset: () => void;
}

function mapTypeToKind(type: string): NodeKind {
  switch (type) {
    case 'rect':
    case 'ellipse':
    case 'line':
    case 'path':
    case 'text':
    case 'image':
    case 'group':
      return type;
    default:
      return 'frame';
  }
}

export function createFreeformLoginDocument(
  projectId: string,
  pageId: string,
  pageName: string
): KLNPDocument {
  const nodes: Record<string, KLNPNode> = {
    node_card_bg: {
      id: 'node_card_bg',
      type: 'rect',
      kind: 'rect',
      name: 'Login Card Surface',
      parentId: null,
      children: [],
      geometry: { x: 24, y: 64, width: 327, height: 660 },
      style: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'solid',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
      },
      properties: {},
      visible: true,
      locked: false,
    },
    node_logo_circle: {
      id: 'node_logo_circle',
      type: 'ellipse',
      kind: 'ellipse',
      name: 'Brand Badge Circle',
      parentId: null,
      children: [],
      geometry: { x: 155, y: 96, width: 64, height: 64 },
      style: {
        backgroundColor: '#eff6ff',
        borderWidth: 2,
        borderColor: '#3b82f6',
        borderStyle: 'solid',
        borderRadius: 999,
      },
      properties: {},
      visible: true,
      locked: false,
    },
    node_logo_vector: {
      id: 'node_logo_vector',
      type: 'path',
      kind: 'path',
      name: 'Vector Diamond Logo',
      parentId: null,
      children: [],
      geometry: { x: 171, y: 112, width: 32, height: 32 },
      style: {
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: '#2563eb',
        borderWidth: 2.5,
      },
      properties: {
        closed: true,
        points: [
          { x: 16, y: 2 },
          { x: 30, y: 16 },
          { x: 16, y: 30 },
          { x: 2, y: 16 },
        ],
      },
      visible: true,
      locked: false,
    },
    node_login_title: {
      id: 'node_login_title',
      type: 'text',
      kind: 'text',
      name: 'Heading Text',
      parentId: null,
      children: [],
      geometry: { x: 48, y: 176, width: 279, height: 34 },
      style: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0f172a',
        textAlign: 'center',
      },
      properties: {
        text: 'Welcome Back',
      },
      visible: true,
      locked: false,
    },
    node_login_subtitle: {
      id: 'node_login_subtitle',
      type: 'text',
      kind: 'text',
      name: 'Subtitle Text',
      parentId: null,
      children: [],
      geometry: { x: 48, y: 214, width: 279, height: 40 },
      style: {
        fontSize: 13,
        fontWeight: '400',
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 1.4,
      },
      properties: {
        text: 'Drawn freely with shapes & converted into live components',
      },
      visible: true,
      locked: false,
    },

    // Email Label
    node_email_label: {
      id: 'node_email_label',
      type: 'text',
      kind: 'text',
      name: 'Email Label',
      parentId: null,
      children: [],
      geometry: { x: 48, y: 274, width: 200, height: 22 },
      style: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
        textAlign: 'left',
      },
      properties: {
        text: 'Email Address',
      },
      visible: true,
      locked: false,
    },

    // Freeform Group -> Converted to Email Input Component
    node_email_group: {
      id: 'node_email_group',
      type: 'group',
      kind: 'group',
      name: 'Email Input (Freeform Group)',
      parentId: null,
      children: ['node_email_bg_rect', 'node_email_placeholder_txt'],
      geometry: { x: 48, y: 300, width: 279, height: 48 },
      componentRef: {
        builtinType: 'input',
        version: '1.0.0',
      },
      style: {},
      properties: {
        placeholder: 'you@klnp.studio',
        inputType: 'email',
        fieldKey: 'email',
        required: true,
      },
      visible: true,
      locked: false,
    },
    node_email_bg_rect: {
      id: 'node_email_bg_rect',
      type: 'rect',
      kind: 'rect',
      name: 'Email Box Shape',
      parentId: 'node_email_group',
      children: [],
      geometry: { x: 0, y: 0, width: 279, height: 48 },
      style: {
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
        borderStyle: 'solid',
        borderRadius: 12,
      },
      properties: {},
      visible: true,
      locked: false,
    },
    node_email_placeholder_txt: {
      id: 'node_email_placeholder_txt',
      type: 'text',
      kind: 'text',
      name: 'Email Placeholder Text',
      parentId: 'node_email_group',
      children: [],
      geometry: { x: 14, y: 14, width: 240, height: 20 },
      style: {
        fontSize: 14,
        fontWeight: '400',
        color: '#94a3b8',
        textAlign: 'left',
      },
      properties: {
        text: 'you@klnp.studio',
      },
      visible: true,
      locked: false,
    },

    // Password Label
    node_password_label: {
      id: 'node_password_label',
      type: 'text',
      kind: 'text',
      name: 'Password Label',
      parentId: null,
      children: [],
      geometry: { x: 48, y: 368, width: 200, height: 22 },
      style: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
        textAlign: 'left',
      },
      properties: {
        text: 'Password',
      },
      visible: true,
      locked: false,
    },

    // Freeform Group -> Converted to Password Input Component
    node_password_group: {
      id: 'node_password_group',
      type: 'group',
      kind: 'group',
      name: 'Password Input (Freeform Group)',
      parentId: null,
      children: ['node_password_bg_rect', 'node_password_placeholder_txt'],
      geometry: { x: 48, y: 394, width: 279, height: 48 },
      componentRef: {
        builtinType: 'input',
        version: '1.0.0',
      },
      style: {},
      properties: {
        placeholder: 'Enter password (min 6 chars)',
        inputType: 'password',
        fieldKey: 'password',
        required: true,
      },
      visible: true,
      locked: false,
    },
    node_password_bg_rect: {
      id: 'node_password_bg_rect',
      type: 'rect',
      kind: 'rect',
      name: 'Password Box Shape',
      parentId: 'node_password_group',
      children: [],
      geometry: { x: 0, y: 0, width: 279, height: 48 },
      style: {
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
        borderStyle: 'solid',
        borderRadius: 12,
      },
      properties: {},
      visible: true,
      locked: false,
    },
    node_password_placeholder_txt: {
      id: 'node_password_placeholder_txt',
      type: 'text',
      kind: 'text',
      name: 'Password Placeholder Text',
      parentId: 'node_password_group',
      children: [],
      geometry: { x: 14, y: 14, width: 240, height: 20 },
      style: {
        fontSize: 14,
        fontWeight: '400',
        color: '#94a3b8',
        textAlign: 'left',
      },
      properties: {
        text: '••••••••',
      },
      visible: true,
      locked: false,
    },

    // Freeform Group -> Converted to Sign In Button Component
    node_signin_btn_group: {
      id: 'node_signin_btn_group',
      type: 'group',
      kind: 'group',
      name: 'Sign In Button (Freeform Group)',
      parentId: null,
      children: ['node_signin_bg_rect', 'node_signin_label_txt'],
      geometry: { x: 48, y: 472, width: 279, height: 50 },
      componentRef: {
        builtinType: 'button',
        version: '1.0.0',
      },
      style: {},
      properties: {
        label: 'Sign In',
        actionType: 'validate_login',
        successMessage: 'Signed in! Navigating to Home...',
      },
      visible: true,
      locked: false,
    },
    node_signin_bg_rect: {
      id: 'node_signin_bg_rect',
      type: 'rect',
      kind: 'rect',
      name: 'Button Background Shape',
      parentId: 'node_signin_btn_group',
      children: [],
      geometry: { x: 0, y: 0, width: 279, height: 50 },
      style: {
        backgroundColor: '#2563eb',
        borderWidth: 0,
        borderColor: '#1d4ed8',
        borderStyle: 'solid',
        borderRadius: 12,
        boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
      },
      properties: {},
      visible: true,
      locked: false,
    },
    node_signin_label_txt: {
      id: 'node_signin_label_txt',
      type: 'text',
      kind: 'text',
      name: 'Button Label Text',
      parentId: 'node_signin_btn_group',
      children: [],
      geometry: { x: 20, y: 14, width: 239, height: 22 },
      style: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
      },
      properties: {
        text: 'Sign In',
      },
      visible: true,
      locked: false,
    },

    // Decorative Divider Line
    node_divider_line: {
      id: 'node_divider_line',
      type: 'line',
      kind: 'line',
      name: 'Divider Line',
      parentId: null,
      children: [],
      geometry: { x: 48, y: 552, width: 279, height: 2 },
      style: {
        borderColor: '#e2e8f0',
        borderWidth: 1.5,
      },
      properties: {},
      visible: true,
      locked: false,
    },

    node_footer_hint: {
      id: 'node_footer_hint',
      type: 'text',
      kind: 'text',
      name: 'Footer Helper Text',
      parentId: null,
      children: [],
      geometry: { x: 48, y: 572, width: 279, height: 36 },
      style: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        textAlign: 'center',
      },
      properties: {
        text: 'Tip: Draw any shape (R/O/P/T), Group (Cmd+G), and Convert to Component!',
      },
      visible: true,
      locked: false,
    },
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
        color: '#f1f5f9',
      },
    },
    rootNodeIds: [
      'node_card_bg',
      'node_logo_circle',
      'node_logo_vector',
      'node_login_title',
      'node_login_subtitle',
      'node_email_label',
      'node_email_group',
      'node_password_label',
      'node_password_group',
      'node_signin_btn_group',
      'node_divider_line',
      'node_footer_hint',
    ],
    nodes,
  };
}

const MAX_HISTORY_STEPS = 50;

export const useEditorDocumentStore = create<EditorDocumentState>((set, get) => ({
  document: null,
  revision: 1,
  selectedNodeIds: [],
  hoveredNodeId: null,
  isDirty: false,
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  setDocument: (doc, revision = 1) =>
    set({
      document: doc,
      revision,
      selectedNodeIds: [],
      hoveredNodeId: null,
      isDirty: false,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    }),

  setRevision: (revision) => set({ revision, isDirty: false }),

  initializeEmptyDocument: (projectId, pageId, pageName) => {
    const doc = createFreeformLoginDocument(projectId, pageId, pageName);
    set({
      document: doc,
      revision: 1,
      selectedNodeIds: ['node_email_group'],
      hoveredNodeId: null,
      isDirty: false,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  },

  loadLoginTemplate: () => {
    const state = get();
    const cur = state.document;
    const pageId = cur?.pageId || 'page_default';
    const pageName = cur?.metadata?.name || 'Login Screen';
    const nextDoc = createFreeformLoginDocument('project_current', pageId, pageName);
    set({
      past: cur ? [...state.past.slice(-MAX_HISTORY_STEPS), cur] : state.past,
      future: [],
      document: nextDoc,
      selectedNodeIds: ['node_signin_btn_group'],
      hoveredNodeId: null,
      isDirty: true,
      canUndo: Boolean(cur),
      canRedo: false,
    });
  },

  clearCanvas: () => {
    const state = get();
    const doc = state.document;
    if (!doc) return;

    const cleared: KLNPDocument = {
      ...doc,
      rootNodeIds: [],
      nodes: {},
      metadata: { ...doc.metadata, updatedAt: new Date().toISOString() },
    };

    set({
      past: [...state.past.slice(-MAX_HISTORY_STEPS), doc],
      future: [],
      document: cleared,
      selectedNodeIds: [],
      hoveredNodeId: null,
      isDirty: true,
      canUndo: true,
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

  selectNodes: (nodeIds) => set({ selectedNodeIds: nodeIds }),

  setHoveredNode: (hoveredNodeId) => set({ hoveredNodeId }),

  clearSelection: () => set({ selectedNodeIds: [] }),

  addNode: (type, parentId = null, geometry = {}, extraProperties = {}, styleOverride = {}) => {
    const state = get();
    const doc = state.document;
    if (!doc) return '';

    const meta = COMPONENT_MAP.get(type);
    const newId = `node_${type}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;

    const rootCount = doc.rootNodeIds.length;
    const defaultX = 48 + ((rootCount * 16) % 80);
    const defaultY = 80 + ((rootCount * 28) % 320);

    const width = geometry.width ?? meta?.defaultGeometry?.width ?? 200;
    const height = geometry.height ?? meta?.defaultGeometry?.height ?? 48;
    const x = geometry.x ?? defaultX;
    const y = geometry.y ?? defaultY;
    const rotation = geometry.rotation ?? 0;

    // Builtin widget types automatically receive their componentRef
    const componentRef =
      type === 'button' || type === 'input' || type === 'container'
        ? { builtinType: type, version: '1.0.0' }
        : undefined;

    const newNode: KLNPNode = {
      id: newId,
      type,
      kind: mapTypeToKind(type),
      componentRef,
      name: meta?.displayName || type,
      parentId: parentId || null,
      children: [],
      geometry: {
        x,
        y,
        width,
        height,
        rotation,
        ...geometry,
      },
      transform: {
        x,
        y,
        rotation,
      },
      size: {
        width,
        height,
      },
      style: { ...(meta?.defaultStyle || {}), ...styleOverride },
      properties: { ...(meta?.defaultProperties || {}), ...extraProperties },
      visible: true,
      locked: false,
    };

    const newNodes = { ...doc.nodes, [newId]: newNode };
    const newRootNodeIds = [...doc.rootNodeIds];

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

  updateNodeGeometry: (nodeId, geometryUpdate, recordHistory = true) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    const current = doc.nodes[nodeId];
    const nextGeom: NodeGeometry = {
      x: current.geometry?.x ?? 0,
      y: current.geometry?.y ?? 0,
      width: current.geometry?.width ?? 100,
      height: current.geometry?.height ?? 100,
      ...current.geometry,
      ...geometryUpdate,
    };

    const updatedNode: KLNPNode = {
      ...current,
      geometry: nextGeom,
      transform: {
        x: nextGeom.x,
        y: nextGeom.y,
        rotation: nextGeom.rotation ?? current.transform?.rotation ?? 0,
      },
      size: {
        width: nextGeom.width,
        height: nextGeom.height,
      },
    };

    const updatedDoc: KLNPDocument = {
      ...doc,
      nodes: { ...doc.nodes, [nodeId]: updatedNode },
      metadata: { ...doc.metadata, updatedAt: new Date().toISOString() },
    };

    if (recordHistory) {
      set({
        past: [...state.past.slice(-MAX_HISTORY_STEPS), doc],
        future: [],
        document: updatedDoc,
        isDirty: true,
        canUndo: true,
        canRedo: false,
      });
    } else {
      set({
        document: updatedDoc,
        isDirty: true,
      });
    }
  },

  commitSnapshotToHistory: (snapshot) => {
    const state = get();
    set({
      past: [...state.past.slice(-MAX_HISTORY_STEPS), snapshot],
      future: [],
      canUndo: true,
      canRedo: false,
      isDirty: true,
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

  toggleNodeVisibility: (nodeId) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    const current = doc.nodes[nodeId];
    const updatedNode: KLNPNode = { ...current, visible: current.visible === false ? true : false };
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

  toggleNodeLocked: (nodeId) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    const current = doc.nodes[nodeId];
    const updatedNode: KLNPNode = { ...current, locked: !current.locked };
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

  deleteNode: (nodeId) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

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
      hoveredNodeId: state.hoveredNodeId && idsToDelete.has(state.hoveredNodeId) ? null : state.hoveredNodeId,
      isDirty: true,
      canUndo: true,
      canRedo: false,
    });
  },

  groupSelectedNodes: (name) => {
    const state = get();
    const doc = state.document;
    if (!doc || state.selectedNodeIds.length === 0) return null;

    const validIds = state.selectedNodeIds.filter((id) => Boolean(doc.nodes[id]));
    if (validIds.length === 0) return null;

    // Determine shared parent (default to root if mixed)
    const firstParent = doc.nodes[validIds[0]].parentId || null;
    const sameParent = validIds.every((id) => (doc.nodes[id].parentId || null) === firstParent);
    const targetParentId = sameParent ? firstParent : null;

    // Compute bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const id of validIds) {
      const g = doc.nodes[id].geometry || { x: 0, y: 0, width: 100, height: 48 };
      minX = Math.min(minX, g.x);
      minY = Math.min(minY, g.y);
      maxX = Math.max(maxX, g.x + g.width);
      maxY = Math.max(maxY, g.y + g.height);
    }

    const groupWidth = Math.max(24, Math.round(maxX - minX));
    const groupHeight = Math.max(24, Math.round(maxY - minY));
    const groupX = Math.round(minX);
    const groupY = Math.round(minY);

    const groupId = `node_group_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;

    const newNodes: Record<string, KLNPNode> = { ...doc.nodes };
    const selectedSet = new Set(validIds);

    // Preserve z-order from parent's children or rootNodeIds
    const sourceOrder = targetParentId && newNodes[targetParentId]
      ? newNodes[targetParentId].children
      : doc.rootNodeIds;
    const orderedChildren = sourceOrder.filter((id) => selectedSet.has(id));
    for (const id of validIds) {
      if (!orderedChildren.includes(id)) orderedChildren.push(id);
    }

    // Reparent children and convert coordinates to group-local space
    for (const childId of orderedChildren) {
      const child = newNodes[childId];
      const cg = child.geometry || { x: 0, y: 0, width: 100, height: 40 };
      // Remove from old parent if needed
      if (child.parentId && newNodes[child.parentId]) {
        const oldP = { ...newNodes[child.parentId] };
        oldP.children = oldP.children.filter((cid) => cid !== childId);
        newNodes[child.parentId] = oldP;
      }
      const localX = Math.round(cg.x - groupX);
      const localY = Math.round(cg.y - groupY);
      newNodes[childId] = {
        ...child,
        parentId: groupId,
        geometry: {
          ...cg,
          x: localX,
          y: localY,
        },
        transform: {
          x: localX,
          y: localY,
          rotation: cg.rotation ?? 0,
        },
      };
    }

    const groupNode: KLNPNode = {
      id: groupId,
      type: 'group',
      kind: 'group',
      name: name || `Group (${orderedChildren.length})`,
      parentId: targetParentId,
      children: orderedChildren,
      geometry: {
        x: groupX,
        y: groupY,
        width: groupWidth,
        height: groupHeight,
      },
      transform: {
        x: groupX,
        y: groupY,
        rotation: 0,
      },
      size: {
        width: groupWidth,
        height: groupHeight,
      },
      style: {},
      properties: {},
      visible: true,
      locked: false,
    };

    newNodes[groupId] = groupNode;

    let newRootNodeIds = doc.rootNodeIds.filter((id) => !selectedSet.has(id));
    if (targetParentId && newNodes[targetParentId]) {
      const parent = { ...newNodes[targetParentId] };
      parent.children = parent.children.filter((id) => !selectedSet.has(id));
      parent.children.push(groupId);
      newNodes[targetParentId] = parent;
    } else {
      newRootNodeIds = [...newRootNodeIds, groupId];
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
      selectedNodeIds: [groupId],
      isDirty: true,
      canUndo: true,
      canRedo: false,
    });

    return groupId;
  },

  ungroupNode: (groupId) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[groupId]) return;

    const group = doc.nodes[groupId];
    if (group.children.length === 0) return;

    const gx = group.geometry?.x ?? 0;
    const gy = group.geometry?.y ?? 0;
    const parentId = group.parentId || null;

    const newNodes: Record<string, KLNPNode> = { ...doc.nodes };
    const unpackedIds: string[] = [];

    for (const childId of group.children) {
      const child = newNodes[childId];
      if (!child) continue;
      const cg = child.geometry || { x: 0, y: 0, width: 100, height: 40 };
      const worldX = Math.round(gx + cg.x);
      const worldY = Math.round(gy + cg.y);
      newNodes[childId] = {
        ...child,
        parentId,
        geometry: {
          ...cg,
          x: worldX,
          y: worldY,
        },
        transform: {
          x: worldX,
          y: worldY,
          rotation: cg.rotation ?? 0,
        },
      };
      unpackedIds.push(childId);
    }

    delete newNodes[groupId];

    let newRootNodeIds = [...doc.rootNodeIds];
    if (parentId && newNodes[parentId]) {
      const parent = { ...newNodes[parentId] };
      const idx = parent.children.indexOf(groupId);
      if (idx >= 0) {
        parent.children = [
          ...parent.children.slice(0, idx),
          ...unpackedIds,
          ...parent.children.slice(idx + 1),
        ];
      } else {
        parent.children = [...parent.children, ...unpackedIds];
      }
      newNodes[parentId] = parent;
    } else {
      const idx = newRootNodeIds.indexOf(groupId);
      if (idx >= 0) {
        newRootNodeIds = [
          ...newRootNodeIds.slice(0, idx),
          ...unpackedIds,
          ...newRootNodeIds.slice(idx + 1),
        ];
      } else {
        newRootNodeIds = [...newRootNodeIds, ...unpackedIds];
      }
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
      selectedNodeIds: unpackedIds,
      isDirty: true,
      canUndo: true,
      canRedo: false,
    });
  },

  convertToComponent: (nodeId, role, extraProps = {}) => {
    const state = get();
    const doc = state.document;
    if (!doc || !doc.nodes[nodeId]) return;

    const node = doc.nodes[nodeId];

    // Infer sensible defaults from child text nodes when converting a freeform Group!
    let inferredText = '';
    for (const cid of node.children) {
      const child = doc.nodes[cid];
      if (child && child.type === 'text' && typeof child.properties?.text === 'string') {
        inferredText = child.properties.text;
        break;
      }
    }

    let nextProperties: Record<string, unknown> = { ...node.properties };
    let nextName = node.name || node.type;

    if (role === 'button') {
      nextProperties = {
        label: inferredText || (node.properties.label as string) || 'Sign In',
        actionType: (node.properties.actionType as string) || 'validate_login',
        successMessage: (node.properties.successMessage as string) || 'Action executed successfully!',
        ...nextProperties,
        ...extraProps,
      };
      if (!nextName.toLowerCase().includes('button')) {
        nextName = `${nextName} (Button)`;
      }
    } else if (role === 'input') {
      const isPassword = inferredText.includes('•') || inferredText.toLowerCase().includes('pass');
      nextProperties = {
        placeholder: inferredText || (node.properties.placeholder as string) || 'Enter value...',
        inputType: isPassword ? 'password' : (node.properties.inputType as string) || 'email',
        fieldKey: isPassword ? 'password' : (node.properties.fieldKey as string) || 'email',
        required: node.properties.required ?? true,
        ...nextProperties,
        ...extraProps,
      };
      if (!nextName.toLowerCase().includes('input')) {
        nextName = `${nextName} (Input)`;
      }
    } else if (role === 'container') {
      nextProperties = {
        ...nextProperties,
        ...extraProps,
      };
    }

    const updatedNode: KLNPNode = {
      ...node,
      name: nextName,
      componentRef:
        role === 'none'
          ? undefined
          : {
              builtinType: role,
              version: '1.0.0',
            },
      properties: nextProperties,
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
      isDirty: true,
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
      isDirty: true,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });
  },

  reset: () =>
    set({
      document: null,
      revision: 1,
      selectedNodeIds: [],
      hoveredNodeId: null,
      isDirty: false,
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    }),
}));
