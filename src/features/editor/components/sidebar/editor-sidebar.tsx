import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import PermMediaRoundedIcon from '@mui/icons-material/PermMediaRounded';

import { useEditorUIStore, LeftSidebarTab } from '../../stores/editor-ui.store';
import { ComponentsPanel } from './panels/components-panel';
import { LayersPanel } from './panels/layers-panel';
import { PagesPanel } from './panels/pages-panel';
import { AssetsPanel } from './panels/assets-panel';
import { Page } from '../../../pages/api/page-api';

interface EditorSidebarProps {
  pages?: Page[];
  currentPageId?: string;
  onSelectPage?: (pageId: string) => void;
}

export function EditorSidebar({ pages, currentPageId, onSelectPage }: EditorSidebarProps) {
  const {
    leftSidebarOpen,
    toggleLeftSidebar,
    activeLeftTab,
    setActiveLeftTab,
  } = useEditorUIStore();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: LeftSidebarTab) => {
    setActiveLeftTab(newValue);
  };

  if (!leftSidebarOpen) {
    return (
      <Box
        sx={{
          width: 48,
          bgcolor: '#ffffff',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1,
          zIndex: 5,
        }}
      >
        <Tooltip title="Expand Sidebar" placement="right">
          <IconButton size="small" onClick={toggleLeftSidebar} sx={{ mb: 1 }}>
            <ChevronRightRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Components" placement="right">
          <IconButton
            size="small"
            onClick={() => {
              setActiveLeftTab('components');
            }}
            sx={{ mb: 1, color: activeLeftTab === 'components' ? 'primary.main' : 'text.secondary' }}
          >
            <WidgetsRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Layers" placement="right">
          <IconButton
            size="small"
            onClick={() => {
              setActiveLeftTab('layers');
            }}
            sx={{ mb: 1, color: activeLeftTab === 'layers' ? 'primary.main' : 'text.secondary' }}
          >
            <LayersRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Pages" placement="right">
          <IconButton
            size="small"
            onClick={() => {
              setActiveLeftTab('pages');
            }}
            sx={{ mb: 1, color: activeLeftTab === 'pages' ? 'primary.main' : 'text.secondary' }}
          >
            <ArticleRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Assets" placement="right">
          <IconButton
            size="small"
            onClick={() => {
              setActiveLeftTab('assets');
            }}
            sx={{ color: activeLeftTab === 'assets' ? 'primary.main' : 'text.secondary' }}
          >
            <PermMediaRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 280,
        height: '100%',
        bgcolor: '#ffffff',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 5,
      }}
    >
      {/* Header Tabs with Collapse Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pr: 1,
        }}
      >
        <Tabs
          value={activeLeftTab}
          onChange={handleTabChange}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              minWidth: 'auto',
              px: 1.5,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'none',
            },
          }}
        >
          <Tab
            value="components"
            icon={<WidgetsRoundedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Insert"
          />
          <Tab
            value="layers"
            icon={<LayersRoundedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Layers"
          />
          <Tab
            value="pages"
            icon={<ArticleRoundedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Pages"
          />
          <Tab
            value="assets"
            icon={<PermMediaRoundedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Assets"
          />
        </Tabs>

        <Tooltip title="Collapse Sidebar">
          <IconButton size="small" onClick={toggleLeftSidebar}>
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tab Panel Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {activeLeftTab === 'components' && <ComponentsPanel />}
        {activeLeftTab === 'layers' && <LayersPanel />}
        {activeLeftTab === 'pages' && (
          <PagesPanel
            pages={pages}
            currentPageId={currentPageId}
            onSelectPage={onSelectPage}
          />
        )}
        {activeLeftTab === 'assets' && <AssetsPanel />}
      </Box>
    </Box>
  );
}

