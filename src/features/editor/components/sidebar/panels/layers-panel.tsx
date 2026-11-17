import { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import SmartButtonRoundedIcon from '@mui/icons-material/SmartButtonRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import InputRoundedIcon from '@mui/icons-material/InputRounded';
import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded';

import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import PanoramaFishEyeRoundedIcon from '@mui/icons-material/PanoramaFishEyeRounded';
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';
import GestureRoundedIcon from '@mui/icons-material/GestureRounded';

import { useEditorDocumentStore } from '../../../stores/editor-document.store';
import type { KLNPNode } from '@klnp/contracts';

function getNodeIcon(type: string) {
  switch (type) {
    case 'container':
    case 'group':
      return <ViewQuiltRoundedIcon fontSize="small" />;
    case 'rect':
      return <CropSquareRoundedIcon fontSize="small" />;
    case 'ellipse':
      return <PanoramaFishEyeRoundedIcon fontSize="small" />;
    case 'line':
      return <HorizontalRuleRoundedIcon fontSize="small" />;
    case 'path':
      return <GestureRoundedIcon fontSize="small" />;
    case 'text':
      return <TextFieldsRoundedIcon fontSize="small" />;
    case 'button':
      return <SmartButtonRoundedIcon fontSize="small" />;
    case 'image':
      return <ImageRoundedIcon fontSize="small" />;
    case 'input':
      return <InputRoundedIcon fontSize="small" />;
    default:
      return <WidgetsRoundedIcon fontSize="small" />;
  }
}

interface LayerItemProps {
  node: KLNPNode;
  depth: number;
  allNodes: Record<string, KLNPNode>;
}

function LayerItem({ node, depth, allNodes }: LayerItemProps) {
  const {
    selectedNodeIds,
    selectNode,
    setHoveredNode,
    toggleNodeVisibility,
    toggleNodeLocked,
    deleteNode,
    renameNode,
  } = useEditorDocumentStore();

  const [isEditing, setIsEditing] = useState(false);
  const [nameVal, setNameVal] = useState(node.name || node.type);

  const isSelected = selectedNodeIds.includes(node.id);
  const isVisible = node.visible !== false;
  const isLocked = Boolean(node.locked);

  const handleFinishRename = () => {
    setIsEditing(false);
    if (nameVal.trim() && nameVal !== node.name) {
      renameNode(node.id, nameVal.trim());
    }
  };

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          bgcolor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
          borderLeft: isSelected ? '3px solid' : '3px solid transparent',
          borderLeftColor: isSelected ? 'primary.main' : 'transparent',
          '&:hover': {
            bgcolor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'action.hover',
            '& .layer-actions': { opacity: 1 },
          },
        }}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <ListItemButton
          dense
          onClick={(e) => {
            selectNode(node.id, e.shiftKey || e.metaKey);
          }}
          sx={{
            py: 0.5,
            pl: 1 + depth * 1.5,
            pr: 1,
          }}
        >
          <ListItemIcon sx={{ minWidth: 26, color: isSelected ? 'primary.main' : 'text.secondary' }}>
            {getNodeIcon(node.type)}
          </ListItemIcon>

          {isEditing ? (
            <TextField
              size="small"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={handleFinishRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinishRename();
                if (e.key === 'Escape') {
                  setNameVal(node.name || node.type);
                  setIsEditing(false);
                }
              }}
              autoFocus
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '0.8rem',
                  py: 0.2,
                  px: 0.5,
                },
              }}
            />
          ) : (
            <ListItemText
              primary={node.name || node.type}
              onDoubleClick={() => setIsEditing(true)}
              primaryTypographyProps={{
                fontSize: '0.8rem',
                fontWeight: isSelected ? 600 : 400,
                color: isVisible ? 'text.primary' : 'text.disabled',
                noWrap: true,
              }}
            />
          )}

          {/* Quick Action Icons: Visibility, Lock, Delete */}
          <Box
            className="layer-actions"
            sx={{
              display: 'flex',
              alignItems: 'center',
              opacity: isSelected || !isVisible || isLocked ? 1 : 0,
              transition: 'opacity 0.15s ease-in-out',
            }}
          >
            <Tooltip title={isVisible ? 'Hide layer' : 'Show layer'}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeVisibility(node.id);
                }}
                sx={{ p: 0.25 }}
              >
                {isVisible ? (
                  <VisibilityRoundedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                ) : (
                  <VisibilityOffRoundedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title={isLocked ? 'Unlock layer' : 'Lock layer'}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeLocked(node.id);
                }}
                sx={{ p: 0.25 }}
              >
                {isLocked ? (
                  <LockRoundedIcon sx={{ fontSize: 15, color: 'warning.main' }} />
                ) : (
                  <LockOpenRoundedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete layer">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                sx={{ p: 0.25, '&:hover': { color: 'error.main' } }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </ListItemButton>
      </ListItem>

      {/* Render Children Recursively */}
      {node.children &&
        node.children.map((childId) => {
          const childNode = allNodes[childId];
          if (!childNode) return null;
          return (
            <LayerItem
              key={childId}
              node={childNode}
              depth={depth + 1}
              allNodes={allNodes}
            />
          );
        })}
    </>
  );
}

export function LayersPanel() {
  const { document } = useEditorDocumentStore();

  if (!document || document.rootNodeIds.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No layers on this page yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', py: 1 }}>
      <List disablePadding>
        {document.rootNodeIds.map((rootId: string) => {
          const rootNode = document.nodes[rootId];
          if (!rootNode) return null;
          return (
            <LayerItem
              key={rootId}
              node={rootNode}
              depth={0}
              allNodes={document.nodes}
            />
          );
        })}
      </List>
    </Box>
  );
}
