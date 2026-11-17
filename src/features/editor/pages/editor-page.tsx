import { useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { EditorLayout } from '../components/layout/editor-layout';
import { useWorkspaceStore } from '../../workspaces/stores/workspace-store';
import { useProject } from '../../projects/hooks/use-projects';
import { usePages } from '../../pages/hooks/use-pages';
import { useEditorDocumentStore } from '../stores/editor-document.store';
import { useEditorUIStore } from '../stores/editor-ui.store';
import { documentApi } from '../api/document-api';

export function EditorPage() {
  const { projectId, pageId } = useParams<{ projectId: string; pageId: string }>();
  const navigate = useNavigate();

  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id || '';

  const { data: project, isLoading: projectLoading } = useProject(workspaceId, projectId || '');
  const { data: pages, isLoading: pagesLoading } = usePages(workspaceId, projectId || '');

  const {
    document,
    revision,
    isDirty,
    setDocument,
    setRevision,
    initializeEmptyDocument,
    deleteNode,
    selectedNodeIds,
    clearSelection,
    groupSelectedNodes,
    ungroupNode,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorDocumentStore();

  const { setActiveTool, setSaveStatus } = useEditorUIStore();

  const currentPage = pages?.find((p) => p.id === pageId);
  const loadedPageIdRef = useRef<string | null>(null);

  // Load persisted document from backend (or localStorage fallback), or initialize Freeform Login Screen
  useEffect(() => {
    const targetPageId = pageId || 'page_default';
    const targetProjectId = projectId || 'project_default';
    if (loadedPageIdRef.current === targetPageId) return;
    loadedPageIdRef.current = targetPageId;

    let cancelled = false;
    (async () => {
      const existing = await documentApi.get(workspaceId, targetProjectId, targetPageId);
      if (cancelled) return;
      if (existing && existing.document && Object.keys(existing.document.nodes || {}).length > 0) {
        setDocument(existing.document, existing.revision);
        setSaveStatus('saved');
      } else {
        initializeEmptyDocument(
          targetProjectId,
          targetPageId,
          currentPage?.name || 'Login Screen'
        );
        setSaveStatus('saved');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    workspaceId,
    projectId,
    pageId,
    currentPage?.name,
    setDocument,
    initializeEmptyDocument,
    setSaveStatus,
  ]);

  const handleSaveNow = useCallback(async () => {
    if (!document) return;
    const targetPageId = pageId || document.pageId || 'page_default';
    const targetProjectId = projectId || 'project_default';
    setSaveStatus('saving');
    try {
      const nextRev = await documentApi.save(
        workspaceId,
        targetProjectId,
        targetPageId,
        revision,
        document
      );
      setRevision(nextRev);
      setSaveStatus('saved');
    } catch {
      // Saved to localStorage cache even if backend request fails
      setSaveStatus('saved');
    }
  }, [document, pageId, projectId, workspaceId, revision, setRevision, setSaveStatus]);

  // Mark unsaved & debounce auto-save when document changes
  useEffect(() => {
    if (!isDirty || !document) return;
    setSaveStatus('unsaved');
    const timer = window.setTimeout(() => {
      void handleSaveNow();
    }, 900);
    return () => window.clearTimeout(timer);
  }, [isDirty, document, handleSaveNow, setSaveStatus]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Save: Cmd+S / Ctrl+S
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void handleSaveNow();
        return;
      }

      // Group: Cmd+G / Ctrl+G, Ungroup: Cmd+Shift+G
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          if (selectedNodeIds.length === 1) {
            ungroupNode(selectedNodeIds[0]);
          }
        } else if (selectedNodeIds.length > 0) {
          groupSelectedNodes();
        }
        return;
      }

      // Undo: Cmd+Z / Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Redo: Cmd+Shift+Z / Ctrl+Y
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Delete: Backspace or Delete
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedNodeIds.length > 0) {
          e.preventDefault();
          selectedNodeIds.forEach((id) => deleteNode(id));
        }
        return;
      }

      // Escape: Clear selection & return to Select tool
      if (e.key === 'Escape') {
        clearSelection();
        setActiveTool('select');
        return;
      }

      // Freeform Tool Shortcuts
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'v') setActiveTool('select');
        else if (key === 'h') setActiveTool('pan');
        else if (key === 'r') setActiveTool('rect');
        else if (key === 'o') setActiveTool('ellipse');
        else if (key === 'l') setActiveTool('line');
        else if (key === 'p') setActiveTool('pen');
        else if (key === 't') setActiveTool('text');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeIds,
    deleteNode,
    clearSelection,
    groupSelectedNodes,
    ungroupNode,
    handleSaveNow,
    undo,
    redo,
    canUndo,
    canRedo,
    setActiveTool,
  ]);

  const handleSelectPage = (newPageId: string) => {
    if (projectId && newPageId !== pageId) {
      navigate(`/projects/${projectId}/pages/${newPageId}`);
    }
  };

  if (workspaceId && (projectLoading || pagesLoading)) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f8fafc',
          gap: 2,
        }}
      >
        <CircularProgress size={36} />
        <Typography variant="body2" color="text.secondary">
          Loading KLNP Studio Canvas...
        </Typography>
      </Box>
    );
  }

  return (
    <EditorLayout
      workspaceName={currentWorkspace?.name || 'Workspace'}
      projectName={project?.name || 'KLNP App'}
      projectId={projectId}
      currentPageId={pageId}
      pages={pages || []}
      onSelectPage={handleSelectPage}
      onSaveNow={handleSaveNow}
    />
  );
}
