import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorDocumentStore } from '../editor-document.store';

describe('useEditorDocumentStore', () => {
  beforeEach(() => {
    useEditorDocumentStore.getState().reset();
  });

  it('initializes default document correctly', () => {
    useEditorDocumentStore.getState().initializeEmptyDocument('proj_123', 'page_456', 'Home Screen');

    const state = useEditorDocumentStore.getState();
    expect(state.document).not.toBeNull();
    expect(state.document?.pageId).toBe('page_456');
    expect(state.document?.metadata.name).toBe('Home Screen');
    expect(state.document?.rootNodeIds.length).toBeGreaterThan(0);
  });

  it('adds and selects a new component node', () => {
    useEditorDocumentStore.getState().initializeEmptyDocument('proj_1', 'page_1', 'Test Page');

    const nodeId = useEditorDocumentStore.getState().addNode('button', null, { width: 160, height: 48 });
    expect(nodeId).toBeTruthy();

    const state = useEditorDocumentStore.getState();
    expect(state.document?.nodes[nodeId]).toBeDefined();
    expect(state.document?.nodes[nodeId].type).toBe('button');
    expect(state.document?.nodes[nodeId].geometry?.width).toBe(160);
    expect(state.selectedNodeIds).toContain(nodeId);
    expect(state.canUndo).toBe(true);
  });

  it('updates node geometry, layout, and properties', () => {
    useEditorDocumentStore.getState().initializeEmptyDocument('proj_1', 'page_1', 'Test Page');
    const nodeId = useEditorDocumentStore.getState().addNode('text');

    useEditorDocumentStore.getState().updateNodeGeometry(nodeId, { width: 250, height: 40 });
    expect(useEditorDocumentStore.getState().document?.nodes[nodeId].geometry?.width).toBe(250);

    useEditorDocumentStore.getState().updateNodeProperties(nodeId, { text: 'Updated Text Content' });
    expect(useEditorDocumentStore.getState().document?.nodes[nodeId].properties.text).toBe('Updated Text Content');

    useEditorDocumentStore.getState().updateNodeStyle(nodeId, { color: '#ef4444', fontSize: 20 });
    expect(useEditorDocumentStore.getState().document?.nodes[nodeId].style?.color).toBe('#ef4444');
  });

  it('supports undo and redo', () => {
    useEditorDocumentStore.getState().initializeEmptyDocument('proj_1', 'page_1', 'Test Page');
    const initialRootCount = useEditorDocumentStore.getState().document?.rootNodeIds.length ?? 0;
    expect(initialRootCount).toBeGreaterThan(0);

    const nodeId = useEditorDocumentStore.getState().addNode('input');
    expect(useEditorDocumentStore.getState().document?.rootNodeIds.length).toBe(initialRootCount + 1);

    // Undo
    useEditorDocumentStore.getState().undo();
    expect(useEditorDocumentStore.getState().document?.rootNodeIds.length).toBe(initialRootCount);
    expect(useEditorDocumentStore.getState().document?.nodes[nodeId]).toBeUndefined();
    expect(useEditorDocumentStore.getState().canRedo).toBe(true);

    // Redo
    useEditorDocumentStore.getState().redo();
    expect(useEditorDocumentStore.getState().document?.rootNodeIds.length).toBe(initialRootCount + 1);
    expect(useEditorDocumentStore.getState().document?.nodes[nodeId]).toBeDefined();
  });

  it('deletes a node and cleans up parent references', () => {
    useEditorDocumentStore.getState().initializeEmptyDocument('proj_1', 'page_1', 'Test Page');
    const containerId = useEditorDocumentStore.getState().addNode('container');
    const childId = useEditorDocumentStore.getState().addNode('button', containerId);

    expect(useEditorDocumentStore.getState().document?.nodes[containerId].children).toContain(childId);

    // Delete child
    useEditorDocumentStore.getState().deleteNode(childId);
    expect(useEditorDocumentStore.getState().document?.nodes[childId]).toBeUndefined();
    expect(useEditorDocumentStore.getState().document?.nodes[containerId].children).not.toContain(childId);
  });

  it('draws freeform shapes, groups them into local space, and converts group to Input/Button component', () => {
    useEditorDocumentStore.getState().initializeEmptyDocument('proj_1', 'page_1', 'Login');
    useEditorDocumentStore.getState().clearCanvas();
    expect(useEditorDocumentStore.getState().document?.rootNodeIds).toHaveLength(0);

    // 1. Draw a freeform rectangle and a text node
    const rectId = useEditorDocumentStore
      .getState()
      .addNode('rect', null, { x: 40, y: 100, width: 260, height: 48 });
    const textId = useEditorDocumentStore
      .getState()
      .addNode('text', null, { x: 56, y: 114, width: 200, height: 20 }, { text: 'Enter email' });

    // 2. Select both and Group them (Cmd+G)
    useEditorDocumentStore.getState().selectNodes([rectId, textId]);
    const groupId = useEditorDocumentStore.getState().groupSelectedNodes('Custom Email Group');
    expect(groupId).toBeTruthy();

    const docAfterGroup = useEditorDocumentStore.getState().document!;
    const groupNode = docAfterGroup.nodes[groupId!];
    expect(groupNode.type).toBe('group');
    expect(groupNode.geometry).toEqual({ x: 40, y: 100, width: 260, height: 48 });
    // Child coordinates converted to group-local space
    expect(docAfterGroup.nodes[rectId].geometry?.x).toBe(0);
    expect(docAfterGroup.nodes[rectId].geometry?.y).toBe(0);
    expect(docAfterGroup.nodes[textId].geometry?.x).toBe(16);
    expect(docAfterGroup.nodes[textId].geometry?.y).toBe(14);

    // 3. Convert the freeform group into an Input component
    useEditorDocumentStore.getState().convertToComponent(groupId!, 'input', { fieldKey: 'email' });
    const converted = useEditorDocumentStore.getState().document!.nodes[groupId!];
    expect(converted.componentRef?.builtinType).toBe('input');
    expect(converted.properties.fieldKey).toBe('email');
    expect(converted.properties.placeholder).toBe('Enter email');

    // 4. Ungroup restores world coordinates
    useEditorDocumentStore.getState().ungroupNode(groupId!);
    const docAfterUngroup = useEditorDocumentStore.getState().document!;
    expect(docAfterUngroup.nodes[groupId!]).toBeUndefined();
    expect(docAfterUngroup.nodes[textId].geometry?.x).toBe(56);
    expect(docAfterUngroup.nodes[textId].geometry?.y).toBe(114);
  });
});
