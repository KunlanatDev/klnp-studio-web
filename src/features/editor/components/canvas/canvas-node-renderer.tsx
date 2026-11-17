import React from 'react';
import { Box, Typography, Button, TextField, Checkbox, Switch, Divider } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useEditorDocumentStore } from '../../stores/editor-document.store';
import { useEditorUIStore } from '../../stores/editor-ui.store';

interface CanvasNodeRendererProps {
  nodeId: string;
}

export function CanvasNodeRenderer({ nodeId }: CanvasNodeRendererProps) {
  const { document, selectedNodeIds, hoveredNodeId, selectNode, setHoveredNode } = useEditorDocumentStore();
  const { isPreviewMode } = useEditorUIStore();

  if (!document) return null;
  const node = document.nodes[nodeId];
  if (!node || node.visible === false) return null;

  const isSelected = selectedNodeIds.includes(node.id);
  const isHovered = hoveredNodeId === node.id && !isSelected;

  const handleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    selectNode(node.id, e.shiftKey || e.metaKey);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    setHoveredNode(node.id);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    if (hoveredNodeId === node.id) {
      setHoveredNode(null);
    }
  };

  // Convert NodeStyle to CSS properties
  const customStyle: React.CSSProperties = {
    backgroundColor: node.style?.backgroundColor,
    color: node.style?.color,
    fontSize: node.style?.fontSize,
    fontWeight: node.style?.fontWeight,
    fontFamily: node.style?.fontFamily,
    textAlign: node.style?.textAlign,
    lineHeight: node.style?.lineHeight,
    borderRadius: node.style?.borderRadius,
    borderWidth: node.style?.borderWidth,
    borderColor: node.style?.borderColor,
    borderStyle: node.style?.borderStyle,
    opacity: node.style?.opacity,
    boxShadow: node.style?.boxShadow,
    overflow: (node.style?.overflow as any) || 'visible',
    paddingTop: node.style?.paddingTop,
    paddingRight: node.style?.paddingRight,
    paddingBottom: node.style?.paddingBottom,
    paddingLeft: node.style?.paddingLeft,
    marginTop: node.style?.marginTop,
    marginRight: node.style?.marginRight,
    marginBottom: node.style?.marginBottom,
    marginLeft: node.style?.marginLeft,
  };

  // Check if layout mode is flex or grid
  const isFlex = node.layout?.mode === 'flex';
  const flexStyle: React.CSSProperties = isFlex
    ? {
        display: 'flex',
        flexDirection: node.layout?.mode === 'flex' ? node.layout.direction || 'column' : 'column',
        justifyContent: node.layout?.mode === 'flex' ? node.layout.justify || 'flex-start' : 'flex-start',
        alignItems: node.layout?.mode === 'flex' ? node.layout.align || 'stretch' : 'stretch',
        flexWrap: node.layout?.mode === 'flex' ? node.layout.wrap || 'nowrap' : 'nowrap',
        gap: node.layout?.mode === 'flex' ? node.layout.gap || 0 : 0,
      }
    : {};

  // Positioning
  const isRootNode = document.rootNodeIds.includes(node.id);
  const isParentFlex = node.parentId && document.nodes[node.parentId]?.layout?.mode === 'flex';

  const positionStyle: React.CSSProperties = isRootNode || !isParentFlex
    ? {
        position: 'relative',
        left: undefined,
        top: undefined,
        width: node.geometry?.width || 'auto',
        height: node.geometry?.height || 'auto',
      }
    : {
        width: node.geometry?.width || 'auto',
        height: node.geometry?.height || 'auto',
      };

  const renderContent = () => {
    switch (node.type) {
      case 'text':
        return (
          <Typography
            sx={{
              fontSize: 'inherit',
              fontWeight: 'inherit',
              color: 'inherit',
              textAlign: 'inherit',
              lineHeight: 'inherit',
              m: 0,
              userSelect: 'none',
            }}
          >
            {(node.properties.text as string) || 'Text element'}
          </Typography>
        );

      case 'button':
        return (
          <Button
            variant={((node.properties.variant as any) || 'contained')}
            fullWidth
            sx={{
              height: '100%',
              bgcolor: node.style?.backgroundColor || '#2563eb',
              color: node.style?.color || '#ffffff',
              borderRadius: node.style?.borderRadius || 1,
              textTransform: 'none',
              fontWeight: 600,
              pointerEvents: isPreviewMode ? 'auto' : 'none',
            }}
          >
            {(node.properties.label as string) || 'Button'}
          </Button>
        );

      case 'image':
        return (
          <Box
            component="img"
            src={(node.properties.src as string) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop'}
            alt={(node.properties.alt as string) || 'Image'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: (node.properties.fit as any) || 'cover',
              borderRadius: 'inherit',
              display: 'block',
              pointerEvents: 'none',
            }}
          />
        );

      case 'icon':
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              color: node.style?.color || '#2563eb',
            }}
          >
            <StarRoundedIcon sx={{ fontSize: (node.properties.size as number) || 24 }} />
          </Box>
        );

      case 'input':
        return (
          <TextField
            fullWidth
            size="small"
            placeholder={(node.properties.placeholder as string) || 'Enter text...'}
            disabled={!isPreviewMode}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '100%',
                borderRadius: node.style?.borderRadius || 1,
                bgcolor: node.style?.backgroundColor || '#f8fafc',
              },
            }}
          />
        );

      case 'checkbox':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Checkbox
              checked={Boolean(node.properties.checked)}
              disabled={!isPreviewMode}
              size="small"
            />
            <Typography variant="body2" sx={{ fontSize: node.style?.fontSize || 14 }}>
              {(node.properties.label as string) || 'Checkbox'}
            </Typography>
          </Box>
        );

      case 'switch':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Switch
              checked={Boolean(node.properties.checked)}
              disabled={!isPreviewMode}
              size="small"
            />
            <Typography variant="body2" sx={{ fontSize: node.style?.fontSize || 14, ml: 0.5 }}>
              {(node.properties.label as string) || 'Switch'}
            </Typography>
          </Box>
        );

      case 'divider':
        return (
          <Divider
            orientation={(node.properties.orientation as any) || 'horizontal'}
            sx={{ width: '100%', borderColor: node.style?.backgroundColor || '#e2e8f0' }}
          />
        );

      case 'spacer':
        return <Box sx={{ width: '100%', height: '100%' }} />;

      case 'list':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            {[1, 2, 3].map((item) => (
              <Box
                key={item}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  Item #{item}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Detail &gt;
                </Typography>
              </Box>
            ))}
          </Box>
        );

      case 'container':
      case 'group':
      default:
        return (
          <>
            {node.children &&
              node.children.map((childId) => (
                <CanvasNodeRenderer key={childId} nodeId={childId} />
              ))}
          </>
        );
    }
  };

  return (
    <Box
      id={`canvas-node-${node.id}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        ...positionStyle,
        ...customStyle,
        ...flexStyle,
        boxSizing: 'border-box',
        cursor: isPreviewMode ? 'default' : 'pointer',
        outline: !isPreviewMode && isSelected
          ? '2px solid #2563eb'
          : !isPreviewMode && isHovered
          ? '1.5px dashed #3b82f6'
          : 'none',
        outlineOffset: 1,
        position: 'relative',
        transition: 'outline 0.1s ease',
      }}
    >
      {/* Selection Handles indicator when selected in Edit mode */}
      {!isPreviewMode && isSelected && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              left: -4,
              width: 8,
              height: 8,
              bgcolor: '#ffffff',
              border: '2px solid #2563eb',
              borderRadius: '1px',
              zIndex: 10,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 8,
              height: 8,
              bgcolor: '#ffffff',
              border: '2px solid #2563eb',
              borderRadius: '1px',
              zIndex: 10,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              left: -4,
              width: 8,
              height: 8,
              bgcolor: '#ffffff',
              border: '2px solid #2563eb',
              borderRadius: '1px',
              zIndex: 10,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 8,
              height: 8,
              bgcolor: '#ffffff',
              border: '2px solid #2563eb',
              borderRadius: '1px',
              zIndex: 10,
            }}
          />
          {/* Label tag above selected node */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              left: 0,
              bgcolor: '#2563eb',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 600,
              px: 0.75,
              py: 0.1,
              borderRadius: '3px 3px 0 0',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
            }}
          >
            {node.name || node.type}
          </Box>
        </>
      )}

      {renderContent()}
    </Box>
  );
}
