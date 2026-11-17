import React from 'react';
import { Box, Typography, Button, TextField, Checkbox, Switch, Divider } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { useEditorDocumentStore } from '../../stores/editor-document.store';
import { useEditorUIStore } from '../../stores/editor-ui.store';
import type { PathPoint } from '@klnp/contracts';

export type ResizeHandleDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface CanvasNodeRendererProps {
  nodeId: string;
  onStartMoveNode?: (e: React.MouseEvent, nodeId: string) => void;
  onStartResizeNode?: (
    e: React.MouseEvent,
    nodeId: string,
    direction: ResizeHandleDirection
  ) => void;
}

const HANDLE_POSITIONS: Array<{
  dir: ResizeHandleDirection;
  sx: Record<string, unknown>;
  cursor: string;
}> = [
  { dir: 'nw', sx: { top: -5, left: -5 }, cursor: 'nwse-resize' },
  { dir: 'n', sx: { top: -5, left: 'calc(50% - 4px)' }, cursor: 'ns-resize' },
  { dir: 'ne', sx: { top: -5, right: -5 }, cursor: 'nesw-resize' },
  { dir: 'e', sx: { top: 'calc(50% - 4px)', right: -5 }, cursor: 'ew-resize' },
  { dir: 'se', sx: { bottom: -5, right: -5 }, cursor: 'nwse-resize' },
  { dir: 's', sx: { bottom: -5, left: 'calc(50% - 4px)' }, cursor: 'ns-resize' },
  { dir: 'sw', sx: { bottom: -5, left: -5 }, cursor: 'nesw-resize' },
  { dir: 'w', sx: { top: 'calc(50% - 4px)', left: -5 }, cursor: 'ew-resize' },
];

export function CanvasNodeRenderer({
  nodeId,
  onStartMoveNode,
  onStartResizeNode,
}: CanvasNodeRendererProps) {
  const { document, selectedNodeIds, hoveredNodeId, selectNode, setHoveredNode } =
    useEditorDocumentStore();
  const { isPreviewMode, activeTool } = useEditorUIStore();

  if (!document) return null;
  const node = document.nodes[nodeId];
  if (!node || node.visible === false) return null;

  const isSelected = selectedNodeIds.includes(node.id);
  const isHovered = hoveredNodeId === node.id && !isSelected;
  const componentRole = node.componentRef?.builtinType;
  const isComponentGroup = Boolean(componentRole);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    // Allow drawing tools to pass through to the canvas surface
    if (activeTool !== 'select') return;

    e.stopPropagation();

    // If this node is inside a group and the group is not yet selected, select the group first
    // unless the user double-clicks or holds Cmd/Ctrl to deep-select child
    if (
      node.parentId &&
      document.nodes[node.parentId]?.type === 'group' &&
      !selectedNodeIds.includes(node.parentId) &&
      !selectedNodeIds.includes(node.id) &&
      !e.metaKey &&
      !e.ctrlKey
    ) {
      const parentGroupId = node.parentId;
      selectNode(parentGroupId, e.shiftKey);
      if (!document.nodes[parentGroupId]?.locked) {
        onStartMoveNode?.(e, parentGroupId);
      }
      return;
    }

    const isAlreadySelected = selectedNodeIds.includes(node.id);
    if (!isAlreadySelected || e.shiftKey) {
      selectNode(node.id, e.shiftKey);
    }

    if (!node.locked) {
      onStartMoveNode?.(e, node.id);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isPreviewMode || activeTool !== 'select') return;
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

  const isParentFlex = Boolean(
    node.parentId && document.nodes[node.parentId]?.layout?.mode === 'flex'
  );
  const isFlex = node.layout?.mode === 'flex';

  const geom = node.geometry || { x: 0, y: 0, width: 120, height: 48, rotation: 0 };
  const rotation = geom.rotation ?? node.transform?.rotation ?? 0;

  const positionStyle: React.CSSProperties = isParentFlex
    ? {
        position: 'relative',
        width: geom.width || 'auto',
        height: geom.height || 'auto',
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
      }
    : {
        position: 'absolute',
        left: geom.x,
        top: geom.y,
        width: geom.width,
        height: geom.height,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
      };

  const isPrimitiveShape =
    node.type === 'rect' ||
    node.type === 'ellipse' ||
    node.type === 'line' ||
    node.type === 'path' ||
    node.type === 'group';

  const customStyle: React.CSSProperties = isPrimitiveShape
    ? {
        opacity: node.style?.opacity,
      }
    : {
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
      };

  const flexStyle: React.CSSProperties = isFlex
    ? {
        display: 'flex',
        flexDirection: node.layout?.mode === 'flex' ? node.layout.direction || 'column' : 'column',
        justifyContent:
          node.layout?.mode === 'flex' ? node.layout.justify || 'flex-start' : 'flex-start',
        alignItems: node.layout?.mode === 'flex' ? node.layout.align || 'stretch' : 'stretch',
        flexWrap: node.layout?.mode === 'flex' ? node.layout.wrap || 'nowrap' : 'nowrap',
        gap: node.layout?.mode === 'flex' ? node.layout.gap || 0 : 0,
      }
    : {};

  const renderContent = () => {
    switch (node.type) {
      case 'rect':
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: node.style?.backgroundColor ?? '#f8fafc',
              borderRadius:
                node.style?.borderRadius !== undefined ? `${node.style.borderRadius}px` : '8px',
              borderWidth: node.style?.borderWidth ?? 1.5,
              borderStyle: (node.style?.borderStyle as any) || 'solid',
              borderColor: node.style?.borderColor || '#cbd5e1',
              boxShadow: node.style?.boxShadow,
              boxSizing: 'border-box',
            }}
          >
            {node.children.map((childId) => (
              <CanvasNodeRenderer
                key={childId}
                nodeId={childId}
                onStartMoveNode={onStartMoveNode}
                onStartResizeNode={onStartResizeNode}
              />
            ))}
          </Box>
        );

      case 'ellipse':
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: node.style?.backgroundColor ?? '#dbeafe',
              borderRadius: '50%',
              borderWidth: node.style?.borderWidth ?? 2,
              borderStyle: (node.style?.borderStyle as any) || 'solid',
              borderColor: node.style?.borderColor || '#2563eb',
              boxShadow: node.style?.boxShadow,
              boxSizing: 'border-box',
            }}
          />
        );

      case 'line': {
        const stroke = node.style?.borderColor || node.style?.backgroundColor || '#64748b';
        const strokeWidth = Number(node.style?.borderWidth ?? 2);
        return (
          <svg
            width="100%"
            height="100%"
            style={{ overflow: 'visible', display: 'block', pointerEvents: 'none' }}
          >
            <line
              x1={0}
              y1={Math.max(1, geom.height / 2)}
              x2={geom.width}
              y2={Math.max(1, geom.height / 2)}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </svg>
        );
      }

      case 'path': {
        const pts = (node.properties.points as PathPoint[]) || [
          { x: geom.width / 2, y: 0 },
          { x: geom.width, y: geom.height },
          { x: 0, y: geom.height },
        ];
        const closed = node.properties.closed !== false;
        const d =
          pts.length > 0
            ? pts
                .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                .join(' ') + (closed ? ' Z' : '')
            : '';
        return (
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${Math.max(1, geom.width)} ${Math.max(1, geom.height)}`}
            preserveAspectRatio="none"
            style={{ overflow: 'visible', display: 'block', pointerEvents: 'none' }}
          >
            <path
              d={d}
              fill={closed ? node.style?.backgroundColor || 'rgba(37, 99, 235, 0.15)' : 'none'}
              stroke={node.style?.borderColor || '#2563eb'}
              strokeWidth={Number(node.style?.borderWidth ?? 2)}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        );
      }

      case 'text':
        return (
          <Typography
            sx={{
              fontSize: node.style?.fontSize ?? 16,
              fontWeight: node.style?.fontWeight ?? '500',
              color: node.style?.color || '#0f172a',
              textAlign: node.style?.textAlign || 'left',
              lineHeight: node.style?.lineHeight || 1.35,
              m: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                node.style?.textAlign === 'center'
                  ? 'center'
                  : node.style?.textAlign === 'right'
                  ? 'flex-end'
                  : 'flex-start',
              userSelect: 'none',
              overflow: 'hidden',
            }}
          >
            {(node.properties.text as string) || 'Text'}
          </Typography>
        );

      case 'button':
        return (
          <Button
            variant={(node.properties.variant as any) || 'contained'}
            fullWidth
            sx={{
              height: '100%',
              bgcolor: node.style?.backgroundColor || '#2563eb',
              color: node.style?.color || '#ffffff',
              borderRadius:
                node.style?.borderRadius !== undefined ? `${node.style.borderRadius}px` : '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: node.style?.fontSize || 14,
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
            src={
              (node.properties.src as string) ||
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop'
            }
            alt={(node.properties.alt as string) || 'Image'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: (node.properties.fit as any) || 'cover',
              borderRadius:
                node.style?.borderRadius !== undefined ? `${node.style.borderRadius}px` : '8px',
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
              height: '100%',
              pointerEvents: isPreviewMode ? 'auto' : 'none',
              '& .MuiOutlinedInput-root': {
                height: '100%',
                borderRadius:
                  node.style?.borderRadius !== undefined ? `${node.style.borderRadius}px` : '10px',
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
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            {node.children &&
              node.children.map((childId) => (
                <CanvasNodeRenderer
                  key={childId}
                  nodeId={childId}
                  onStartMoveNode={onStartMoveNode}
                  onStartResizeNode={onStartResizeNode}
                />
              ))}
          </Box>
        );
    }
  };

  const accentColor = isComponentGroup ? '#7c3aed' : '#2563eb';

  return (
    <Box
      id={`canvas-node-${node.id}`}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        ...positionStyle,
        ...customStyle,
        ...flexStyle,
        boxSizing: 'border-box',
        cursor:
          isPreviewMode || activeTool !== 'select'
            ? 'inherit'
            : node.locked
            ? 'not-allowed'
            : 'move',
        outline:
          !isPreviewMode && isSelected
            ? `2px solid ${accentColor}`
            : !isPreviewMode && isHovered
            ? `1.5px dashed ${accentColor}`
            : 'none',
        outlineOffset: 1,
      }}
    >
      {/* Component Role Badge even when not selected (subtle indicator) */}
      {!isPreviewMode && isComponentGroup && !isSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: -17,
            right: 0,
            bgcolor: 'rgba(124, 58, 237, 0.12)',
            color: '#6d28d9',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            fontSize: '9px',
            fontWeight: 700,
            px: 0.6,
            py: 0.05,
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 8,
            whiteSpace: 'nowrap',
          }}
        >
          ⚡ {componentRole?.toUpperCase()}
          {componentRole === 'input' && node.properties.fieldKey
            ? `: ${String(node.properties.fieldKey)}`
            : ''}
        </Box>
      )}

      {/* Selection Handles & Header Badge when selected in Edit mode */}
      {!isPreviewMode && isSelected && (
        <>
          {HANDLE_POSITIONS.map((h) => (
            <Box
              key={h.dir}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (!node.locked) {
                  onStartResizeNode?.(e, node.id, h.dir);
                }
              }}
              sx={{
                position: 'absolute',
                ...h.sx,
                width: 8,
                height: 8,
                bgcolor: '#ffffff',
                border: `2px solid ${accentColor}`,
                borderRadius: '2px',
                zIndex: 20,
                cursor: h.cursor,
              }}
            />
          ))}

          {/* Label tag above selected node */}
          <Box
            sx={{
              position: 'absolute',
              top: -21,
              left: 0,
              bgcolor: accentColor,
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              px: 0.75,
              py: 0.15,
              borderRadius: '4px 4px 0 0',
              pointerEvents: 'none',
              zIndex: 20,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <span>{node.name || node.type}</span>
            {componentRole && (
              <span style={{ opacity: 0.9 }}>
                · [{componentRole.toUpperCase()}]
              </span>
            )}
            <span style={{ opacity: 0.75 }}>
              ({Math.round(geom.width)}×{Math.round(geom.height)})
            </span>
          </Box>
        </>
      )}

      {renderContent()}
    </Box>
  );
}
