import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Button,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  Chip,
  CircularProgress,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import TabletMacRoundedIcon from '@mui/icons-material/TabletMacRounded';
import DesktopWindowsRoundedIcon from '@mui/icons-material/DesktopWindowsRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PanToolRoundedIcon from '@mui/icons-material/PanToolRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';

import { useEditorUIStore, DeviceType } from '../../stores/editor-ui.store';
import { useEditorDocumentStore } from '../../stores/editor-document.store';
import { Page } from '../../../pages/api/page-api';

interface EditorToolbarProps {
  workspaceName?: string;
  projectName?: string;
  projectId?: string;
  currentPageId?: string;
  pages?: Page[];
  onSelectPage?: (pageId: string) => void;
}

export function EditorToolbar({
  workspaceName = 'Workspace',
  projectName = 'Project',
  projectId,
  currentPageId,
  pages = [],
  onSelectPage,
}: EditorToolbarProps) {
  const navigate = useNavigate();

  const {
    device,
    setDevice,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    activeTool,
    setActiveTool,
    saveStatus,
    isPreviewMode,
    togglePreviewMode,
  } = useEditorUIStore();

  const { canUndo, canRedo, undo, redo } = useEditorDocumentStore();

  const handleDeviceChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDevice: DeviceType | null
  ) => {
    if (newDevice) {
      setDevice(newDevice);
    }
  };

  const handleBackToProject = () => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate('/projects');
    }
  };

  return (
    <Box
      sx={{
        height: 52,
        px: 2,
        bgcolor: '#ffffff',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        userSelect: 'none',
      }}
    >
      {/* Left: Back + Breadcrumb + Page Selector + Save Status */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Tooltip title="Back to Project">
          <IconButton size="small" onClick={handleBackToProject} sx={{ mr: 0.5 }}>
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {workspaceName}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            /
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {projectName}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            /
          </Typography>

          {/* Page Dropdown */}
          {pages.length > 0 ? (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={currentPageId || pages[0]?.id || ''}
                onChange={(e) => onSelectPage?.(e.target.value)}
                sx={{
                  height: 30,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  bgcolor: 'action.hover',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                }}
              >
                {pages.map((p) => (
                  <MenuItem key={p.id} value={p.id} sx={{ fontSize: '0.85rem' }}>
                    {p.name} {p.is_home ? '★' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography variant="body2" fontWeight={600}>
              Default Page
            </Typography>
          )}
        </Stack>

        {/* Save Status Badge */}
        <Box sx={{ ml: 1 }}>
          {saveStatus === 'saved' && (
            <Tooltip title="All changes saved to cloud">
              <Chip
                icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important', color: 'success.main' }} />}
                label="Saved"
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  color: 'success.main',
                  borderColor: 'rgba(34, 197, 94, 0.3)',
                  bgcolor: 'rgba(34, 197, 94, 0.05)',
                }}
              />
            </Tooltip>
          )}
          {saveStatus === 'saving' && (
            <Chip
              icon={<CircularProgress size={10} color="inherit" />}
              label="Saving..."
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          )}
          {saveStatus === 'unsaved' && (
            <Tooltip title="Unsaved local modifications">
              <Chip
                icon={<CloudQueueRoundedIcon sx={{ fontSize: '14px !important', color: 'warning.main' }} />}
                label="Unsaved"
                size="small"
                variant="outlined"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  color: 'warning.main',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  bgcolor: 'rgba(245, 158, 11, 0.05)',
                }}
              />
            </Tooltip>
          )}
        </Box>
      </Stack>

      {/* Center: Device Presets & Zoom Controls & Tool Switcher */}
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Tool Switcher */}
        <ToggleButtonGroup
          value={activeTool}
          exclusive
          onChange={(_e, val) => val && setActiveTool(val)}
          size="small"
          sx={{ height: 32 }}
        >
          <ToggleButton value="select" sx={{ px: 1 }}>
            <Tooltip title="Select Tool (V)">
              <NearMeRoundedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="pan" sx={{ px: 1 }}>
            <Tooltip title="Hand / Pan Tool (H)">
              <PanToolRoundedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Device Preset Switcher */}
        <ToggleButtonGroup
          value={device}
          exclusive
          onChange={handleDeviceChange}
          size="small"
          sx={{ height: 32 }}
        >
          <ToggleButton value="phone" sx={{ px: 1.2 }}>
            <Tooltip title="Mobile View (375 × 812)">
              <SmartphoneRoundedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="tablet" sx={{ px: 1.2 }}>
            <Tooltip title="Tablet View (768 × 1024)">
              <TabletMacRoundedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="desktop" sx={{ px: 1.2 }}>
            <Tooltip title="Desktop View (1280 × 800)">
              <DesktopWindowsRoundedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Zoom Controls */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="Zoom Out (-)">
            <IconButton size="small" onClick={zoomOut} disabled={zoom <= 0.25}>
              <ZoomOutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Button
            size="small"
            variant="text"
            onClick={resetZoom}
            sx={{
              minWidth: 48,
              height: 28,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
              px: 0.5,
            }}
          >
            {Math.round(zoom * 100)}%
          </Button>

          <Tooltip title="Zoom In (+)">
            <IconButton size="small" onClick={zoomIn} disabled={zoom >= 3.0}>
              <ZoomInRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Right: Undo / Redo + Preview Toggle */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="Undo (Ctrl+Z / Cmd+Z)">
          <span>
            <IconButton size="small" onClick={undo} disabled={!canUndo}>
              <UndoRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo (Ctrl+Y / Cmd+Shift+Z)">
          <span>
            <IconButton size="small" onClick={redo} disabled={!canRedo}>
              <RedoRoundedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        {/* Preview Button */}
        <Button
          variant={isPreviewMode ? 'contained' : 'outlined'}
          color={isPreviewMode ? 'secondary' : 'primary'}
          size="small"
          startIcon={isPreviewMode ? <EditRoundedIcon /> : <PlayArrowRoundedIcon />}
          onClick={togglePreviewMode}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            height: 32,
            px: 1.5,
          }}
        >
          {isPreviewMode ? 'Edit Mode' : 'Preview'}
        </Button>
      </Stack>
    </Box>
  );
}

