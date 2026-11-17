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
  Button,
  Chip,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FolderSpecialRoundedIcon from '@mui/icons-material/FolderSpecialRounded';
import FolderOffRoundedIcon from '@mui/icons-material/FolderOffRounded';

import { useEditorUIStore } from '../../stores/editor-ui.store';
import { useEditorDocumentStore, ComponentRole } from '../../stores/editor-document.store';
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
    groupSelectedNodes,
    ungroupNode,
    convertToComponent,
  } = useEditorDocumentStore();

  const selectedNodeId = selectedNodeIds.length === 1 ? selectedNodeIds[0] : null;
  const selectedNode = selectedNodeId && document ? document.nodes[selectedNodeId] : null;

  const currentRole: ComponentRole =
    (selectedNode?.componentRef?.builtinType as ComponentRole) ||
    (selectedNode?.type === 'button' ||
    selectedNode?.type === 'input' ||
    selectedNode?.type === 'container'
      ? (selectedNode.type as ComponentRole)
      : 'none');

  if (!rightSidebarOpen) {
    return (
      <Box
        sx={{
          width: 44,
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
        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }} noWrap>
          {selectedNodeIds.length > 1
            ? `${selectedNodeIds.length} Objects Selected`
            : selectedNode
            ? selectedNode.name || selectedNode.type
            : 'Inspector'}
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {selectedNode && (
            <Tooltip title="Delete Element (Backspace)">
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

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {/* Multi-Selection State: Prompt to Group */}
        {selectedNodeIds.length > 1 && (
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                background:
                  'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                border: '1px solid rgba(37, 99, 235, 0.3)',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Combine into a Group
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Group these {selectedNodeIds.length} freeform shapes together, then convert the
                group into a live Button or Text Input component!
              </Typography>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FolderSpecialRoundedIcon />}
                onClick={() => groupSelectedNodes()}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                Group Selection (Cmd+G)
              </Button>
            </Box>
          </Box>
        )}

        {/* Empty Selection State */}
        {selectedNodeIds.length === 0 && (
          <Box sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              How to Build Your Screen
            </Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>1. Draw Freely (Figma style):</strong> Use Rectangle (R), Ellipse (O), Line
                (L), Pen Vector (P), or Text (T) from the top bar and drag on the canvas.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>2. Group Objects:</strong> Shift+Click or drag-marquee around a Rectangle +
                Text, then click <strong>Group (Cmd+G)</strong>.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>3. Convert to Component:</strong> Select the Group and pick{' '}
                <strong>Text Input</strong> or <strong>Button</strong> right here in the Inspector.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>4. Test Live:</strong> Type and click directly in the{' '}
                <strong>Live Native Simulator</strong> on the right!
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Single Node Selected */}
        {selectedNode && (
          <>
            {/* Node Name & Type Row */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
                <Chip
                  label={selectedNode.type.toUpperCase()}
                  size="small"
                  color="default"
                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                />
                {currentRole !== 'none' && (
                  <Chip
                    label={`⚡ COMPONENT: ${currentRole.toUpperCase()}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(124, 58, 237, 0.12)',
                      color: '#6d28d9',
                    }}
                  />
                )}
              </Stack>

              <TextField
                fullWidth
                size="small"
                label="Layer / Object Name"
                value={selectedNode.name || ''}
                onChange={(e) => renameNode(selectedNode.id, e.target.value)}
              />

              {selectedNode.type === 'group' && selectedNode.children.length > 0 && (
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<FolderOffRoundedIcon fontSize="small" />}
                  onClick={() => ungroupNode(selectedNode.id)}
                  sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
                >
                  Ungroup ({selectedNode.children.length} items)
                </Button>
              )}
            </Box>

            {/* 1. COMPONENT INTELLIGENCE (Convert Group / Shape -> Functional Component) */}
            <Accordion defaultExpanded disableGutters elevation={0}>
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon fontSize="small" />}
                sx={{
                  bgcolor: 'rgba(124, 58, 237, 0.05)',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: '#7c3aed' }} />
                  <Typography variant="caption" fontWeight={700} color="#6d28d9">
                    COMPONENT INTELLIGENCE (S4)
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Convert Object / Group Into</InputLabel>
                    <Select
                      label="Convert Object / Group Into"
                      value={currentRole}
                      onChange={(e) =>
                        convertToComponent(selectedNode.id, e.target.value as ComponentRole)
                      }
                    >
                      <MenuItem value="none">Pure Graphic / Freeform Shape</MenuItem>
                      <MenuItem value="input">⚡ Text Input (Email / Password / Text)</MenuItem>
                      <MenuItem value="button">⚡ Button (Clickable Action)</MenuItem>
                      <MenuItem value="container">⚡ Container / Card</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Configuration when converted to INPUT */}
                  {currentRole === 'input' && (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        label="Field Variable Name (fieldKey)"
                        placeholder="e.g. email, password"
                        value={(selectedNode.properties.fieldKey as string) || ''}
                        onChange={(e) =>
                          updateNodeProperties(selectedNode.id, { fieldKey: e.target.value })
                        }
                      />

                      <FormControl fullWidth size="small">
                        <InputLabel>Input Mode</InputLabel>
                        <Select
                          label="Input Mode"
                          value={(selectedNode.properties.inputType as string) || 'text'}
                          onChange={(e) =>
                            updateNodeProperties(selectedNode.id, { inputType: e.target.value })
                          }
                        >
                          <MenuItem value="email">Email Address</MenuItem>
                          <MenuItem value="password">Password (Masked ••••)</MenuItem>
                          <MenuItem value="text">Standard Text</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        size="small"
                        label="Placeholder Text"
                        value={(selectedNode.properties.placeholder as string) || ''}
                        onChange={(e) =>
                          updateNodeProperties(selectedNode.id, { placeholder: e.target.value })
                        }
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={selectedNode.properties.required !== false}
                            onChange={(e) =>
                              updateNodeProperties(selectedNode.id, { required: e.target.checked })
                            }
                          />
                        }
                        label={<Typography variant="caption">Required Field</Typography>}
                      />
                    </>
                  )}

                  {/* Configuration when converted to BUTTON */}
                  {currentRole === 'button' && (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        label="Button Label"
                        value={(selectedNode.properties.label as string) || ''}
                        onChange={(e) =>
                          updateNodeProperties(selectedNode.id, { label: e.target.value })
                        }
                      />

                      <FormControl fullWidth size="small">
                        <InputLabel>On Tap Workflow Action</InputLabel>
                        <Select
                          label="On Tap Workflow Action"
                          value={(selectedNode.properties.actionType as string) || 'validate_login'}
                          onChange={(e) =>
                            updateNodeProperties(selectedNode.id, { actionType: e.target.value })
                          }
                        >
                          <MenuItem value="validate_login">
                            Validate Inputs &amp; Submit Login
                          </MenuItem>
                          <MenuItem value="alert">Show Toast / Alert Message</MenuItem>
                          <MenuItem value="reset">Clear / Reset Form State</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        size="small"
                        label="Success / Toast Message"
                        value={(selectedNode.properties.successMessage as string) || ''}
                        onChange={(e) =>
                          updateNodeProperties(selectedNode.id, {
                            successMessage: e.target.value,
                          })
                        }
                      />
                    </>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Divider />

            {/* 2. Content Properties for Text / Image */}
            {(selectedNode.type === 'text' || selectedNode.type === 'image') && (
              <>
                <Accordion defaultExpanded disableGutters elevation={0}>
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon fontSize="small" />}>
                    <Typography variant="caption" fontWeight={700}>
                      CONTENT
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    {selectedNode.type === 'text' && (
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        size="small"
                        label="Text Content"
                        value={(selectedNode.properties.text as string) || ''}
                        onChange={(e) =>
                          updateNodeProperties(selectedNode.id, { text: e.target.value })
                        }
                      />
                    )}
                    {selectedNode.type === 'image' && (
                      <TextField
                        fullWidth
                        size="small"
                        label="Image URL"
                        value={(selectedNode.properties.src as string) || ''}
                        onChange={(e) =>
                          updateNodeProperties(selectedNode.id, { src: e.target.value })
                        }
                      />
                    )}
                  </AccordionDetails>
                </Accordion>
                <Divider />
              </>
            )}

            {/* 3. Freeform Geometry & Transform (X, Y, Width, Height, Rotation) */}
            <Accordion defaultExpanded disableGutters elevation={0}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon fontSize="small" />}>
                <Typography variant="caption" fontWeight={700}>
                  POSITION &amp; SIZE (FREEFORM)
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      type="number"
                      label="X"
                      value={selectedNode.geometry?.x ?? 0}
                      onChange={(e) =>
                        updateNodeGeometry(selectedNode.id, { x: Number(e.target.value) })
                      }
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Y"
                      value={selectedNode.geometry?.y ?? 0}
                      onChange={(e) =>
                        updateNodeGeometry(selectedNode.id, { y: Number(e.target.value) })
                      }
                    />
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      type="number"
                      label="Width"
                      value={selectedNode.geometry?.width ?? 100}
                      onChange={(e) =>
                        updateNodeGeometry(selectedNode.id, {
                          width: Math.max(8, Number(e.target.value)),
                        })
                      }
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Height"
                      value={selectedNode.geometry?.height ?? 48}
                      onChange={(e) =>
                        updateNodeGeometry(selectedNode.id, {
                          height: Math.max(4, Number(e.target.value)),
                        })
                      }
                    />
                  </Stack>

                  <TextField
                    size="small"
                    type="number"
                    label="Rotation (deg)"
                    value={selectedNode.geometry?.rotation ?? 0}
                    onChange={(e) =>
                      updateNodeGeometry(selectedNode.id, { rotation: Number(e.target.value) })
                    }
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Divider />

            {/* 4. Style & Appearance (Fill, Stroke, Radius, Typography) */}
            <Accordion defaultExpanded disableGutters elevation={0}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon fontSize="small" />}>
                <Typography variant="caption" fontWeight={700}>
                  STYLE &amp; APPEARANCE
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      fullWidth
                      size="small"
                      label="Fill / Background"
                      value={selectedNode.style?.backgroundColor || ''}
                      onChange={(e) =>
                        updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })
                      }
                    />
                    <input
                      type="color"
                      value={
                        selectedNode.style?.backgroundColor?.startsWith('#')
                          ? selectedNode.style.backgroundColor
                          : '#2563eb'
                      }
                      onChange={(e) =>
                        updateNodeStyle(selectedNode.id, { backgroundColor: e.target.value })
                      }
                      style={{
                        width: 36,
                        height: 36,
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      fullWidth
                      size="small"
                      label="Stroke / Border Color"
                      value={selectedNode.style?.borderColor || ''}
                      onChange={(e) =>
                        updateNodeStyle(selectedNode.id, { borderColor: e.target.value })
                      }
                    />
                    <input
                      type="color"
                      value={
                        selectedNode.style?.borderColor?.startsWith('#')
                          ? selectedNode.style.borderColor
                          : '#cbd5e1'
                      }
                      onChange={(e) =>
                        updateNodeStyle(selectedNode.id, { borderColor: e.target.value })
                      }
                      style={{
                        width: 36,
                        height: 36,
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      type="number"
                      label="Corner Radius"
                      value={selectedNode.style?.borderRadius ?? 0}
                      onChange={(e) =>
                        updateNodeStyle(selectedNode.id, { borderRadius: Number(e.target.value) })
                      }
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Border Width"
                      value={selectedNode.style?.borderWidth ?? 0}
                      onChange={(e) =>
                        updateNodeStyle(selectedNode.id, { borderWidth: Number(e.target.value) })
                      }
                    />
                  </Stack>

                  {(selectedNode.type === 'text' ||
                    selectedNode.type === 'button' ||
                    selectedNode.type === 'input') && (
                    <>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          fullWidth
                          size="small"
                          label="Text Color"
                          value={selectedNode.style?.color || ''}
                          onChange={(e) => updateNodeStyle(selectedNode.id, { color: e.target.value })}
                        />
                        <input
                          type="color"
                          value={
                            selectedNode.style?.color?.startsWith('#')
                              ? selectedNode.style.color
                              : '#0f172a'
                          }
                          onChange={(e) => updateNodeStyle(selectedNode.id, { color: e.target.value })}
                          style={{
                            width: 36,
                            height: 36,
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        />
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          type="number"
                          label="Font Size"
                          value={selectedNode.style?.fontSize ?? 15}
                          onChange={(e) =>
                            updateNodeStyle(selectedNode.id, { fontSize: Number(e.target.value) })
                          }
                        />
                        <FormControl fullWidth size="small">
                          <InputLabel>Align</InputLabel>
                          <Select
                            label="Align"
                            value={selectedNode.style?.textAlign || 'left'}
                            onChange={(e) =>
                              updateNodeStyle(selectedNode.id, {
                                textAlign: e.target.value as any,
                              })
                            }
                          >
                            <MenuItem value="left">Left</MenuItem>
                            <MenuItem value="center">Center</MenuItem>
                            <MenuItem value="right">Right</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                    </>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Divider />

            {/* 5. Auto Layout / Positioning Mode */}
            {(selectedNode.type === 'container' || selectedNode.type === 'group') && (
              <Accordion disableGutters elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon fontSize="small" />}>
                  <Typography variant="caption" fontWeight={700}>
                    LAYOUT MODE (ABSOLUTE / AUTO LAYOUT)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Stack spacing={1.25}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Layout Mode</InputLabel>
                      <Select
                        label="Layout Mode"
                        value={selectedNode.layout?.mode || 'absolute'}
                        onChange={(e) => {
                          const mode = e.target.value as 'absolute' | 'flex';
                          if (mode === 'flex') {
                            updateNodeLayout(selectedNode.id, {
                              mode: 'flex',
                              direction: 'column',
                              justify: 'flex-start',
                              align: 'stretch',
                              gap: 12,
                            });
                          } else {
                            updateNodeLayout(selectedNode.id, { mode: 'absolute' });
                          }
                        }}
                      >
                        <MenuItem value="absolute">Freeform (Absolute X, Y)</MenuItem>
                        <MenuItem value="flex">Auto Layout (Flex)</MenuItem>
                      </Select>
                    </FormControl>

                    {selectedNode.layout?.mode === 'flex' && (
                      <>
                        <FormControl fullWidth size="small">
                          <InputLabel>Direction</InputLabel>
                          <Select
                            label="Direction"
                            value={selectedNode.layout.direction || 'column'}
                            onChange={(e) =>
                              updateNodeLayout(selectedNode.id, {
                                ...selectedNode.layout,
                                mode: 'flex',
                                direction: e.target.value as FlexDirection,
                              })
                            }
                          >
                            <MenuItem value="column">Vertical (Column)</MenuItem>
                            <MenuItem value="row">Horizontal (Row)</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                          <InputLabel>Justify</InputLabel>
                          <Select
                            label="Justify"
                            value={selectedNode.layout.justify || 'flex-start'}
                            onChange={(e) =>
                              updateNodeLayout(selectedNode.id, {
                                ...selectedNode.layout,
                                mode: 'flex',
                                justify: e.target.value as FlexJustify,
                              })
                            }
                          >
                            <MenuItem value="flex-start">Start</MenuItem>
                            <MenuItem value="center">Center</MenuItem>
                            <MenuItem value="flex-end">End</MenuItem>
                            <MenuItem value="space-between">Space Between</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                          <InputLabel>Align</InputLabel>
                          <Select
                            label="Align"
                            value={selectedNode.layout.align || 'stretch'}
                            onChange={(e) =>
                              updateNodeLayout(selectedNode.id, {
                                ...selectedNode.layout,
                                mode: 'flex',
                                align: e.target.value as FlexAlign,
                              })
                            }
                          >
                            <MenuItem value="flex-start">Start</MenuItem>
                            <MenuItem value="center">Center</MenuItem>
                            <MenuItem value="flex-end">End</MenuItem>
                            <MenuItem value="stretch">Stretch</MenuItem>
                          </Select>
                        </FormControl>
                      </>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
