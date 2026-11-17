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

import { BUILTIN_COMPONENTS, ComponentMeta } from '../../../registry/component-registry';
import { useEditorDocumentStore } from '../../../stores/editor-document.store';
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
};

const CATEGORY_LABELS: Record<string, string> = {
  layout: 'Layout & Structure',
  basic: 'Basic Elements',
  action: 'Actions',
  media: 'Media',
  input: 'Forms & Inputs',
  data: 'Data & Collections',
};

export function ComponentsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addNode, selectedNodeIds, document } = useEditorDocumentStore();

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

  const filteredComponents: ComponentMeta[] = BUILTIN_COMPONENTS.filter((comp: ComponentMeta) =>
    comp.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (comp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    comp.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(filteredComponents.map((c: ComponentMeta) => c.category as ComponentCategory)));

  return (
    <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      {/* Search Bar */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search components..."
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

      {/* Component Cards Grouped by Category */}
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
                    <Tooltip title={comp.description || comp.displayName} arrow placement="top">
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderColor: 'divider',
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
                                '& .MuiSvgIcon-root': { fontSize: 24 },
                              }}
                            >
                              <IconComponent sx={{ fontSize: 24 }} />
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
            No components match "{searchTerm}"
          </Typography>
        </Box>
      )}
    </Box>
  );
}
