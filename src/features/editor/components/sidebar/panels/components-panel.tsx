import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import HeightRoundedIcon from '@mui/icons-material/HeightRounded';
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import SmartButtonRoundedIcon from '@mui/icons-material/SmartButtonRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import InputRoundedIcon from '@mui/icons-material/InputRounded';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import ToggleOnRoundedIcon from '@mui/icons-material/ToggleOnRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import PanoramaFishEyeRoundedIcon from '@mui/icons-material/PanoramaFishEyeRounded';
import GestureRoundedIcon from '@mui/icons-material/GestureRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';

import { BUILTIN_COMPONENTS, ComponentMeta } from '../../../registry/component-registry';
import { useEditorDocumentStore } from '../../../stores/editor-document.store';
import { useEditorUIStore, ActiveTool } from '../../../stores/editor-ui.store';
import type { BuiltinComponentType, ComponentCategory } from '@klnp/contracts';

const ICON_COMPONENT_MAP: Record<string, React.ComponentType<{ sx?: any }>> = {
  ViewQuiltRounded: ViewQuiltRoundedIcon,
  FolderOutlined: FolderOutlinedIcon,
  HeightRounded: HeightRoundedIcon,
  HorizontalRuleRounded: HorizontalRuleRoundedIcon,
  TextFieldsRounded: TextFieldsRoundedIcon,
  SmartButtonRounded: SmartButtonRoundedIcon,
  ImageRounded: ImageRoundedIcon,
  StarOutlineRounded: StarOutlineRoundedIcon,
  InputRounded: InputRoundedIcon,
  CheckBoxOutlined: CheckBoxOutlinedIcon,
  ToggleOnRounded: ToggleOnRoundedIcon,
  FormatListBulletedRounded: FormatListBulletedRoundedIcon,
  CropSquareRounded: CropSquareRoundedIcon,
  PanoramaFishEyeRounded: PanoramaFishEyeRoundedIcon,
  GestureRounded: GestureRoundedIcon,
};

const CATEGORY_LABELS: Record<string, string> = {
  basic: 'Freeform Shapes & Basic',
  input: 'Forms & Inputs (Drag & Drop)',
  action: 'Actions (Drag & Drop)',
  layout: 'Layout & Containers',
  media: 'Media',
  data: 'Data & Collections',
};

const FREEFORM_DRAW_TOOLS: Array<{
  tool: ActiveTool;
  label: string;
  shortcut: string;
  icon: React.ComponentType<{ sx?: any }>;
}> = [
  { tool: 'rect', label: 'Rectangle', shortcut: 'R', icon: CropSquareRoundedIcon },
  { tool: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: PanoramaFishEyeRoundedIcon },
  { tool: 'line', label: 'Line', shortcut: 'L', icon: HorizontalRuleRoundedIcon },
  { tool: 'pen', label: 'Pen Vector', shortcut: 'P', icon: GestureRoundedIcon },
  { tool: 'text', label: 'Text Box', shortcut: 'T', icon: TextFieldsRoundedIcon },
];

export function ComponentsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addNode, selectedNodeIds, document } = useEditorDocumentStore();
  const { activeTool, setActiveTool } = useEditorUIStore();

  const handleAddComponent = (type: BuiltinComponentType) => {
    let parentId: string | null = null;
    if (selectedNodeIds.length === 1 && document) {
      const selectedNode = document.nodes[selectedNodeIds[0]];
      if (selectedNode && (selectedNode.type === 'container' || selectedNode.type === 'group')) {
        parentId = selectedNode.id;
      }
    }
    addNode(type, parentId);
  };

  const handleDragStart = (e: React.DragEvent, type: BuiltinComponentType) => {
    e.dataTransfer.setData('application/klnp-component', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredComponents: ComponentMeta[] = BUILTIN_COMPONENTS.filter(
    (comp: ComponentMeta) =>
      comp.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      comp.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(
    new Set(filteredComponents.map((c: ComponentMeta) => c.category as ComponentCategory))
  );

  return (
    <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      {/* Highlighted Freeform Drawing Tools Banner */}
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: 2.5,
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
          border: '1px solid rgba(37, 99, 235, 0.25)',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <AutoFixHighRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" fontWeight={700} color="primary.main">
              FREEFORM DRAW TOOLS
            </Typography>
          </Stack>
          <Chip
            label="Figma Mode"
            size="small"
            color="primary"
            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.2, lineHeight: 1.3 }}>
          Pick a tool and drag on the canvas to draw freely, then Group (Cmd+G) &amp; Convert to Component:
        </Typography>
        <Grid container spacing={0.75}>
          {FREEFORM_DRAW_TOOLS.map((item) => {
            const IconComp = item.icon;
            const isSelected = activeTool === item.tool;
            return (
              <Grid item xs={6} key={item.tool}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: isSelected ? 'primary.main' : '#ffffff',
                    color: isSelected ? '#ffffff' : 'text.primary',
                    borderColor: isSelected ? 'primary.main' : 'rgba(37, 99, 235, 0.2)',
                  }}
                >
                  <CardActionArea
                    onClick={() => setActiveTool(item.tool)}
                    sx={{ px: 1, py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <IconComp sx={{ fontSize: 16, color: isSelected ? '#ffffff' : 'primary.main' }} />
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
                        {item.label}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.65rem',
                        opacity: 0.75,
                        fontWeight: 700,
                      }}
                    >
                      {item.shortcut}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search or drag widgets to canvas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'action.hover',
            fontSize: '0.85rem',
            '& fieldset': { border: 'none' },
          },
        }}
      />

      {/* Component Cards Grouped by Category (Supports Click OR Drag & Drop) */}
      {categories.map((category: ComponentCategory) => {
        const items = filteredComponents.filter((c: ComponentMeta) => c.category === category);
        if (items.length === 0) return null;

        return (
          <Box key={category} sx={{ mb: 2.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                display: 'block',
                mb: 1,
              }}
            >
              {CATEGORY_LABELS[category] || category}
            </Typography>

            <Grid container spacing={1}>
              {items.map((comp: ComponentMeta) => {
                const IconComponent = ICON_COMPONENT_MAP[comp.iconName] || ViewQuiltRoundedIcon;

                return (
                  <Grid item xs={6} key={comp.componentId}>
                    <Tooltip
                      title={`${comp.description || comp.displayName} (Click or Drag to Canvas)`}
                      arrow
                      placement="top"
                    >
                      <Card
                        draggable
                        onDragStart={(e) => handleDragStart(e, comp.type)}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderColor: 'divider',
                          cursor: 'grab',
                          transition: 'all 0.15s ease-in-out',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={() => handleAddComponent(comp.type)}
                          sx={{ p: 1.25, textAlign: 'center' }}
                        >
                          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: 'primary.main',
                                mb: 0.5,
                                '& .MuiSvgIcon-root': { fontSize: 22 },
                              }}
                            >
                              <IconComponent sx={{ fontSize: 22 }} />
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                display: 'block',
                                color: 'text.primary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {comp.displayName}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}

      {filteredComponents.length === 0 && (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No components match &quot;{searchTerm}&quot;
          </Typography>
        </Box>
      )}
    </Box>
  );
}
