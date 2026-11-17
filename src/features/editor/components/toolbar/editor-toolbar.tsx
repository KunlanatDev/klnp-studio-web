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
  Divider,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded';
import TabletMacRoundedIcon from '@mui/icons-material/TabletMacRounded';
import DesktopWindowsRoundedIcon from '@mui/icons-material/DesktopWindowsRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import PanToolRoundedIcon from '@mui/icons-material/PanToolRounded';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import PanoramaFishEyeRoundedIcon from '@mui/icons-material/PanoramaFishEyeRounded';
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';
import GestureRoundedIcon from '@mui/icons-material/GestureRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import FolderSpecialRoundedIcon from '@mui/icons-material/FolderSpecialRounded';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

import { useEditorUIStore, DeviceType, ActiveTool } from '../../stores/editor-ui.store';
import { useEditorDocumentStore } from '../../stores/editor-document.store';
import { Page } from '../../../pages/api/page-api';

interface EditorToolbarProps {
  workspaceName?: string;
  projectName?: string;
  projectId?: string;
  currentPageId?: string;
  pages?: Page[];
  onSelectPage?: (pageId: string) => void;
  onSaveNow?: () => void;
}

export function EditorToolbar({
  workspaceName = 'Workspace',
  projectName = 'Project',
  projectId,
  currentPageId,
  pages = [],
  onSelectPage,
  onSaveNow,
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
    simulatorOpen,
    toggleSimulator,
  } = useEditorUIStore();

  const {
    document,
    selectedNodeIds,
    canUndo,
    canRedo,
    undo,
    redo,
    groupSelectedNodes,
    ungroupNode,
    loadLoginTemplate,
    clearCanvas,
  } = useEditorDocumentStore();

  const selectedSingleNode =
    selectedNodeIds.length === 1 && document ? document.nodes[selectedNodeIds[0]] : null;
  const canUngroup = Boolean(
    selectedSingleNode &&
      (selectedSingleNode.type === 'group' || selectedSingleNode.kind === 'group') &&
      selectedSingleNode.children.length > 0
  );

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
        height: 56,
        px: 2,
        bgcolor: '#ffffff',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        userSelect: 'none',
        gap: 1,
      }}
    >
      {/* Left: Back + Breadcrumb + Page Selector + Save Status */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        <Tooltip title="Back to Project">
          <IconButton size="small" onClick={handleBackToProject}>
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500, display: { xs: 'none', lg: 'block' } }}
          >
            {workspaceName} /
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: 'text.primary', display: { xs: 'none', md: 'block' } }}
          >
            {projectName}
          </Typography>
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            /
          </Typography>

          {pages.length > 0 ? (
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <Select
                value={currentPageId || pages[0]?.id || ''}
                onChange={(e) => onSelectPage?.(e.target.value)}
                sx={{
                  height: 30,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  bgcolor: 'action.hover',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                }}
              >
                {pages.map((p) => (
                  <MenuItem key={p.id} value={p.id} sx={{ fontSize: '0.82rem' }}>
                    {p.name} {p.is_home ? '★' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography variant="body2" fontWeight={600}>
              Login Screen
            </Typography>
          )}
        </Stack>

        {/* Save Status Badge */}
        <Box sx={{ ml: 0.5 }}>
          {saveStatus === 'saved' && (
            <Tooltip title="All changes saved (Click to force save)">
              <Chip
                onClick={onSaveNow}
                icon={
                  <CheckCircleRoundedIcon
                    sx={{ fontSize: '14px !important', color: 'success.main' }}
                  />
                }
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
            <Tooltip title="Click to save document now">
              <Chip
                onClick={onSaveNow}
                icon={
                  <CloudQueueRoundedIcon
                    sx={{ fontSize: '14px !important', color: 'warning.main' }}
                  />
                }
                label="Unsaved · Save"
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

      {/* Center: Highlighted Freeform Drawing Tools + Group Actions + Device/Zoom */}
      <Stack direction="row" spacing={1.25} alignItems="center">
        {/* Highlighted Figma-like Freeform Drawing Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1,
            py: 0.35,
            borderRadius: 2.5,
            background:
              'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
            border: '1.5px solid rgba(37, 99, 235, 0.35)',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)',
          }}
        >
          <Chip
            label="Freeform"
            size="small"
            color="primary"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              display: { xs: 'none', xl: 'inline-flex' },
            }}
          />

          <ToggleButtonGroup
            value={activeTool}
            exclusive
            onChange={(_e, val: ActiveTool | null) => val && setActiveTool(val)}
            size="small"
            sx={{
              height: 30,
              bgcolor: '#ffffff',
              borderRadius: 1.5,
              '& .MuiToggleButton-root': {
                border: 'none',
                px: 1,
                borderRadius: '6px !important',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#ffffff',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              },
            }}
          >
            <ToggleButton value="select">
              <Tooltip title="Select / Move / Resize (V)">
                <NearMeRoundedIcon sx={{ fontSize: 17 }} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="pan">
              <Tooltip title="Hand Pan Canvas (H)">
                <PanToolRoundedIcon sx={{ fontSize: 16 }} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="rect">
              <Tooltip title="Draw Rectangle (R) — Drag on Canvas">
                <CropSquareRoundedIcon sx={{ fontSize: 18 }} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="ellipse">
              <Tooltip title="Draw Ellipse / Circle (O) — Drag on Canvas">
                <PanoramaFishEyeRoundedIcon sx={{ fontSize: 17 }} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="line">
              <Tooltip title="Draw Line (L) — Drag on Canvas">
                <HorizontalRuleRoundedIcon sx={{ fontSize: 18 }} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="pen">
              <Tooltip title="Pen / Vector Path Tool (P) — Click points on Canvas, Enter to finish">
                <GestureRoundedIcon sx={{ fontSize: 18 }} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="text">
              <Tooltip title="Draw Text Box (T) — Click or Drag on Canvas">
                <TextFieldsRoundedIcon sx={{ fontSize: 18 }} />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

          {/* Group / Ungroup Buttons */}
          <Tooltip title="Group Selected Objects (Cmd+G / Ctrl+G) to Convert into Component">
            <span>
              <Button
                size="small"
                variant={selectedNodeIds.length > 1 ? 'contained' : 'text'}
                color="primary"
                disabled={selectedNodeIds.length === 0}
                startIcon={<FolderSpecialRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => groupSelectedNodes()}
                sx={{
                  height: 28,
                  px: 1,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 1.5,
                }}
              >
                Group
              </Button>
            </span>
          </Tooltip>

          {canUngroup && (
            <Tooltip title="Ungroup (Cmd+Shift+G)">
              <IconButton
                size="small"
                color="primary"
                onClick={() => selectedSingleNode && ungroupNode(selectedSingleNode.id)}
                sx={{ p: 0.5 }}
              >
                <FolderOffRoundedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Device Preset Switcher */}
        <ToggleButtonGroup
          value={device}
          exclusive
          onChange={handleDeviceChange}
          size="small"
          sx={{ height: 30, display: { xs: 'none', lg: 'inline-flex' } }}
        >
          <ToggleButton value="phone" sx={{ px: 1 }}>
            <Tooltip title="Mobile View (375 × 812)">
              <SmartphoneRoundedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="tablet" sx={{ px: 1 }}>
            <Tooltip title="Tablet View (768 × 1024)">
              <TabletMacRoundedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="desktop" sx={{ px: 1 }}>
            <Tooltip title="Desktop View (1280 × 800)">
              <DesktopWindowsRoundedIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Zoom Controls */}
        <Stack direction="row" spacing={0.25} alignItems="center">
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
              minWidth: 44,
              height: 26,
              fontSize: '0.72rem',
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

      {/* Right: Presets + Undo / Redo + Split Live Simulator Toggle */}
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Tooltip title="Load Freeform Login Screen Example">
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />}
            onClick={loadLoginTemplate}
            sx={{
              height: 30,
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 1.5,
              px: 1,
            }}
          >
            Login Demo
          </Button>
        </Tooltip>

        <Tooltip title="Clear Canvas to Draw from Scratch">
          <IconButton size="small" onClick={clearCanvas} color="default">
            <DeleteSweepRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

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

        {/* Split-Screen Live Mobile Simulator Button */}
        <Button
          variant={simulatorOpen ? 'contained' : 'outlined'}
          color={simulatorOpen ? 'primary' : 'inherit'}
          size="small"
          startIcon={<PhoneIphoneRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={toggleSimulator}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.78rem',
            height: 32,
            px: 1.5,
          }}
        >
          {simulatorOpen ? 'Live Simulator: ON' : 'Live Simulator'}
        </Button>
      </Stack>
    </Box>
  );
}
