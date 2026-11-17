import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import { useEditorUIStore } from '../../stores/editor-ui.store';
import { useEditorDocumentStore } from '../../stores/editor-document.store';
import type { FlexDirection, FlexJustify, FlexAlign } from '@klnp/contracts';

export function EditorInspector() {
  const { rightSidebarOpen, toggleRightSidebar } = useEditorUIStore();
  const {
    document,
    selectedNodeIds,
    updateNodeGeometry,
    updateNodeLayout,
    updateNodeStyle,
    updateNodeProperties,
    renameNode,
    deleteNode,
  } = useEditorDocumentStore();

  const selectedNodeId = selectedNodeIds.length === 1 ? selectedNodeIds[0] : null;
  const selectedNode = selectedNodeId && document ? document.nodes[selectedNodeId] : null;

  if (!rightSidebarOpen) {
    return (
      <Box
        sx={{
          width: 48,
          bgcolor: '#ffffff',
          borderLeft: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1,
          zIndex: 5,
        }}
      >
        <Tooltip title="Expand Inspector" placement="left">
          <IconButton size="small" onClick={toggleRightSidebar}>
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Properties" placement="left">
          <IconButton size="small" sx={{ mt: 1, color: 'text.secondary' }}>
            <TuneRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 300,
        height: '100%',
        bgcolor: '#ffffff',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 5,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: 44,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
          {selectedNode ? selectedNode.name || selectedNode.type : 'Page Canvas'}
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {selectedNode && (
            <Tooltip title="Delete Element">
              <IconButton
                size="small"
                onClick={() => deleteNode(selectedNode.id)}
                sx={{ '&:hover': { color: 'error.main' } }}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Collapse Inspector">
            <IconButton size="small" onClick={toggleRightSidebar}>
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Inspector Body */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {!selectedNode ? (
          /* Canvas Settings (No node selected) */
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
              Canvas Document Settings
            </Typography>

            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Page Title"
                size="small"
                fullWidth
                value={document?.metadata?.name || ''}
                disabled
              />
              <TextField
                label="Document ID"
                size="small"
                fullWidth
                value={document?.documentId || ''}
                disabled
              />
              <TextField
                label="Total Root Elements"
                size="small"
                fullWidth
                value={document?.rootNodeIds.length ?? 0}
                disabled
              />
            </Stack>
          </Box>
        ) : (
          /* Node Properties Accordions */
          <Box>
            {/* 1. General Info */}
            <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}>
                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
                  General
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="Element Name"
                    size="small"
                    fullWidth
                    value={selectedNode.name || ''}
                    onChange={(e) => renameNode(selectedNode.id, e.target.value)}
                  />
                  <TextField
                    label="Component Type"
                    size="small"
                    fullWidth
                    value={selectedNode.type}
                    disabled
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Divider />

            {/* 2. Geometry / Dimensions */}
            <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}>
                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
                  Dimensions & Size
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label="Width"
                    size="small"
                    type="number"
                    value={selectedNode.geometry?.width || ''}
                    onChange={(e) =>
                      updateNodeGeometry(selectedNode.id, {
                        width: Number(e.target.value) || 0,
                      })
                    }
                  />
                  <TextField
                    label="Height"
                    size="small"
                    type="number"
                    value={selectedNode.geometry?.height || ''}
                    onChange={(e) =>
                      updateNodeGeometry(selectedNode.id, {
                        height: Number(e.target.value) || 0,
                      })
                    }
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Divider />

            {/* 3. Layout (Container / Group) */}
            {(selectedNode.type === 'container' || selectedNode.type === 'group') && (
              <>
                <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}>
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
                      Layout System
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                    <Stack spacing={1.5}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Layout Mode</InputLabel>
                        <Select
                          label="Layout Mode"
                          value={selectedNode.layout?.mode || 'flex'}
                          onChange={(e) => {
                            const mode = e.target.value as any;
                            if (mode === 'flex') {
                              updateNodeLayout(selectedNode.id, {
                                mode: 'flex',
                                direction: 'column',
                                gap: 16,
                              });
                            } else {
                              updateNodeLayout(selectedNode.id, { mode });
                            }
                          }}
                        >
                          <MenuItem value="flex">Flexbox</MenuItem>
                          <MenuItem value="absolute">Absolute Coordinates</MenuItem>
                          <MenuItem value="grid">CSS Grid</MenuItem>
                        </Select>
                      </FormControl>

                      {selectedNode.layout?.mode === 'flex' && (
                        <>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Direction</InputLabel>
                            <Select
                              label="Direction"
                              value={selectedNode.layout.direction || 'column'}
                              onChange={(e) => {
                                updateNodeLayout(selectedNode.id, {
                                  ...selectedNode.layout,
                                  mode: 'flex',
                                  direction: e.target.value as FlexDirection,
                                });
                              }}
                            >
                              <MenuItem value="column">Vertical (Column)</MenuItem>
                              <MenuItem value="row">Horizontal (Row)</MenuItem>
                            </Select>
                          </FormControl>

                          <FormControl size="small" fullWidth>
                            <InputLabel>Justify Content</InputLabel>
                            <Select
                              label="Justify Content"
                              value={selectedNode.layout.justify || 'flex-start'}
                              onChange={(e) => {
                                updateNodeLayout(selectedNode.id, {
                                  ...selectedNode.layout,
                                  mode: 'flex',
                                  justify: e.target.value as FlexJustify,
                                });
                              }}
                            >
                              <MenuItem value="flex-start">Start</MenuItem>
                              <MenuItem value="center">Center</MenuItem>
                              <MenuItem value="flex-end">End</MenuItem>
                              <MenuItem value="space-between">Space Between</MenuItem>
                            </Select>
                          </FormControl>

                          <FormControl size="small" fullWidth>
                            <InputLabel>Align Items</InputLabel>
                            <Select
                              label="Align Items"
                              value={selectedNode.layout.align || 'stretch'}
                              onChange={(e) => {
                                updateNodeLayout(selectedNode.id, {
                                  ...selectedNode.layout,
                                  mode: 'flex',
                                  align: e.target.value as FlexAlign,
                                });
                              }}
                            >
                              <MenuItem value="flex-start">Start</MenuItem>
                              <MenuItem value="center">Center</MenuItem>
                              <MenuItem value="flex-end">End</MenuItem>
                              <MenuItem value="stretch">Stretch</MenuItem>
                            </Select>
                          </FormControl>

                          <TextField
                            label="Gap (px)"
                            size="small"
                            type="number"
                            value={selectedNode.layout.gap ?? 16}
                            onChange={(e) => {
                              updateNodeLayout(selectedNode.id, {
                                ...selectedNode.layout,
                                mode: 'flex',
                                gap: Number(e.target.value) || 0,
                              });
                            }}
                          />
                        </>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
                <Divider />
              </>
            )}

            {/* 4. Content / Properties */}
            <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}>
                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
                  Component Properties
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                <Stack spacing={1.5}>
                  {selectedNode.type === 'text' && (
                    <TextField
                      label="Text Value"
                      size="small"
                      multiline
                      rows={3}
                      fullWidth
                      value={(selectedNode.properties.text as string) || ''}
                      onChange={(e) =>
                        updateNodeProperties(selectedNode.id, { text: e.target.value })
                      }
                    />
                  )}

                  {selectedNode.type === 'button' && (
                    <>
                      <TextField
                        label="Button Label"
                        size="small"
                        fullWidth
                        value={(selectedNode.properties.label as string) || ''}
                        onChange={(e) =>
                          updateNodeProperties(selectedNode.id, { label: e.target.value })
                        }
                      />
                      <FormControl size="small" fullWidth>
                        <InputLabel>Variant</InputLabel>
                        <Select
                          label="Variant"
                          value={(selectedNode.properties.variant as string) || 'contained'}
                          onChange={(e) =>
                            updateNodeProperties(selectedNode.id, { variant: e.target.value })
                          }
                        >
                          <MenuItem value="contained">Contained</MenuItem>
                          <MenuItem value="outlined">Outlined</MenuItem>
                          <MenuItem value="text">Text</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}

                  {selectedNode.type === 'image' && (
                    <>
                      <TextField
                        label="Image URL"
                        size="small"
                        fullWidth
                        value={(selectedNode.properties.src as string) || ''}
                        onChange={(e) =>
                          updateNodeProperties(selectedNode.id, { src: e.target.value })
                        }
                      />
                      <TextField
                        label="Alt Text"
                        size="small"
                        fullWidth
                        value={(selectedNode.properties.alt as string) || ''}
                        onChange={(e) =>
                          updateNodeProperties(selectedNode.id, { alt: e.target.value })
                        }
                      />
                    </>
                  )}

                  {selectedNode.type === 'input' && (
                    <TextField
                      label="Placeholder"
                      size="small"
                      fullWidth
                      value={(selectedNode.properties.placeholder as string) || ''}
                      onChange={(e) =>
                        updateNodeProperties(selectedNode.id, { placeholder: e.target.value })
                      }
                    />
                  )}

                  {(selectedNode.type === 'checkbox' || selectedNode.type === 'switch') && (
                    <>
                      <TextField
                        label="Label"
                        size="small"
                        fullWidth
                        value={(selectedNode.properties.label as string) || ''}
                        onChange={(e) =>
                          updateNodeProperties(selectedNode.id, { label: e.target.value })
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(selectedNode.properties.checked)}
                            onChange={(e) =>
                              updateNodeProperties(selectedNode.id, { checked: e.target.checked })
                            }
                          />
                        }
                        label="Default Checked"
                      />
                    </>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Divider />

            {/* 5. Styling / Appearance */}
            <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}>
                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
                  Style & Appearance
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                <Stack spacing={1.5}>
                  <TextField
                    label="Background Color"
                    size="small"
                    fullWidth
                    value={selectedNode.style?.backgroundColor || ''}
                    onChange={(e) =>
                      updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })
                    }
                    placeholder="#ffffff"
                  />
                  <TextField
                    label="Text Color"
                    size="small"
                    fullWidth
                    value={selectedNode.style?.color || ''}
                    onChange={(e) =>
                      updateNodeStyle(selectedNode.id, { color: e.target.value })
                    }
                    placeholder="#1e293b"
                  />
                  <Stack direction="row" spacing={1.5}>
                    <TextField
                      label="Font Size (px)"
                      size="small"
                      type="number"
                      value={selectedNode.style?.fontSize || ''}
                      onChange={(e) =>
                        updateNodeStyle(selectedNode.id, { fontSize: Number(e.target.value) || 14 })
                      }
                    />
                    <TextField
                      label="Corner Radius"
                      size="small"
                      type="number"
                      value={selectedNode.style?.borderRadius || ''}
                      onChange={(e) =>
                        updateNodeStyle(selectedNode.id, { borderRadius: Number(e.target.value) || 0 })
                      }
                    />
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Box>
    </Box>
  );
}
