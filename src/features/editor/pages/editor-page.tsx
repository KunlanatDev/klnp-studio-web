import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { EditorLayout } from '../components/layout/editor-layout';
import { useWorkspaceStore } from '../../workspaces/stores/workspace-store';
import { useProject } from '../../projects/hooks/use-projects';
import { usePages } from '../../pages/hooks/use-pages';
import { useEditorDocumentStore } from '../stores/editor-document.store';
import { useEditorUIStore } from '../stores/editor-ui.store';

export function EditorPage() {
  const { projectId, pageId } = useParams<{ projectId: string; pageId: string }>();
  const navigate = useNavigate();

  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id || '';

  const { data: project, isLoading: projectLoading } = useProject(workspaceId, projectId || '');
  const { data: pages, isLoading: pagesLoading } = usePages(workspaceId, projectId || '');

  const {
    document,
    initializeEmptyDocument,
    deleteNode,
    selectedNodeIds,
    clearSelection,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorDocumentStore();

  const { setActiveTool } = useEditorUIStore();

  const currentPage = pages?.find((p) => p.id === pageId);

  // Initialize empty document for this page if not yet initialized or page changed
  useEffect(() => {
    if (projectId && pageId && currentPage) {
      if (!document || document.pageId !== pageId) {
        initializeEmptyDocument(projectId, pageId, currentPage.name);
      }
    }
  }, [projectId, pageId, currentPage, document, initializeEmptyDocument]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo: Cmd+Z / Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Redo: Cmd+Shift+Z / Ctrl+Y / Ctrl+Shift+Z
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

      // Escape: Clear selection
      if (e.key === 'Escape') {
        clearSelection();
        return;
      }

      // Tool shortcuts
      if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool('pan');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeIds, deleteNode, clearSelection, undo, redo, canUndo, canRedo, setActiveTool]);

  const handleSelectPage = (newPageId: string) => {
    if (projectId && newPageId !== pageId) {
      navigate(`/projects/${projectId}/pages/${newPageId}`);
    }
  };

  if (projectLoading || pagesLoading) {
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
      projectName={project?.name || 'Project'}
      projectId={projectId}
      currentPageId={pageId}
      pages={pages || []}
      onSelectPage={handleSelectPage}
    />
  );
}

