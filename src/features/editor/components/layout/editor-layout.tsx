import { Box } from '@mui/material';
import { EditorToolbar } from '../toolbar/editor-toolbar';
import { EditorSidebar } from '../sidebar/editor-sidebar';
import { EditorCanvas } from '../canvas/editor-canvas';
import { EditorInspector } from '../inspector/editor-inspector';
import { EditorStatusBar } from '../statusbar/editor-status-bar';
import { Page } from '../../../pages/api/page-api';

interface EditorLayoutProps {
  workspaceName?: string;
  projectName?: string;
  projectId?: string;
  currentPageId?: string;
  pages?: Page[];
  onSelectPage?: (pageId: string) => void;
}

export function EditorLayout({
  workspaceName,
  projectName,
  projectId,
  currentPageId,
  pages,
  onSelectPage,
}: EditorLayoutProps) {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: '#f8fafc',
      }}
    >
      {/* 1. Top Toolbar */}
      <EditorToolbar
        workspaceName={workspaceName}
        projectName={projectName}
        projectId={projectId}
        currentPageId={currentPageId}
        pages={pages}
        onSelectPage={onSelectPage}
      />

      {/* 2. Main Middle Workspace: Left Sidebar + Canvas + Right Inspector */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <EditorSidebar
          pages={pages}
          currentPageId={currentPageId}
          onSelectPage={onSelectPage}
        />

        <EditorCanvas />

        <EditorInspector />
      </Box>

      {/* 3. Bottom Status Bar */}
      <EditorStatusBar />
    </Box>
  );
}

