import { Box, Typography, Stack, Divider } from '@mui/material';
import NearMeRoundedIcon from '@mui/icons-material/NearMeRounded';
import PanToolRoundedIcon from '@mui/icons-material/PanToolRounded';
import { useEditorUIStore, DEVICE_PRESETS } from '../../stores/editor-ui.store';
import { useEditorDocumentStore } from '../../stores/editor-document.store';

export function EditorStatusBar() {
  const { activeTool, cursorPosition, zoom, device } = useEditorUIStore();
  const { selectedNodeIds, document } = useEditorDocumentStore();

  const selectedNode = selectedNodeIds.length === 1 && document
    ? document.nodes[selectedNodeIds[0]]
    : null;

  const deviceDim = DEVICE_PRESETS[device] || DEVICE_PRESETS.phone;

  return (
    <Box
      sx={{
        height: 28,
        px: 2,
        bgcolor: '#ffffff',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'text.secondary',
        userSelect: 'none',
        zIndex: 10,
      }}
    >
      {/* Left: Active Tool + Selection status */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Stack direction="row" spacing={0.5} alignItems="center">
          {activeTool === 'select' ? (
            <NearMeRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
          ) : (
            <PanToolRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
          )}
          <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
            {activeTool === 'select' ? 'Select Mode' : 'Pan Mode'}
          </Typography>
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />

        <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>
          {selectedNode
            ? `Selected: ${selectedNode.name || selectedNode.type}`
            : selectedNodeIds.length > 1
            ? `${selectedNodeIds.length} items selected`
            : 'No selection'}
        </Typography>
      </Stack>

      {/* Center: Cursor Position & Selection Geometry */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography variant="caption" sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>
          X: {cursorPosition.x} &nbsp; Y: {cursorPosition.y}
        </Typography>

        {selectedNode?.geometry && (
          <>
            <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
            <Typography variant="caption" sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>
              W: {selectedNode.geometry.width} &nbsp; H: {selectedNode.geometry.height}
            </Typography>
          </>
        )}
      </Stack>

      {/* Right: Device Preset & Canvas Dimensions & Zoom */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography variant="caption" sx={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
          {device}: {deviceDim.width} × {deviceDim.height}
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />

        <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
          {Math.round(zoom * 100)}%
        </Typography>
      </Stack>
    </Box>
  );
}

