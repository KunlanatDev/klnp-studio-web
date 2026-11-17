import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Paper, Typography, Button, Stack, Chip } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useEditorUIStore, DEVICE_PRESETS } from '../../stores/editor-ui.store';
import { useEditorDocumentStore } from '../../stores/editor-document.store';
import { CanvasNodeRenderer, ResizeHandleDirection } from './canvas-node-renderer';
import type { BuiltinComponentType, KLNPDocument, NodeGeometry } from '@klnp/contracts';

interface DragMoveState {
  snapshot: KLNPDocument;
  startScreenX: number;
  startScreenY: number;
  initialGeometries: Record<string, NodeGeometry>;
  moved: boolean;
}

interface DragResizeState {
  snapshot: KLNPDocument;
  nodeId: string;
  direction: ResizeHandleDirection;
  startScreenX: number;
  startScreenY: number;
  initialGeom: NodeGeometry;
  childInitialGeoms: Record<string, NodeGeometry>;
  moved: boolean;
}

interface DrawingBoxState {
  tool: 'rect' | 'ellipse' | 'line' | 'text';
  startX: number;
  startY: number;
  curX: number;
  curY: number;
}

interface MarqueeState {
  startX: number;
  startY: number;
  curX: number;
  curY: number;
}

export function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [moveState, setMoveState] = useState<DragMoveState | null>(null);
  const [resizeState, setResizeState] = useState<DragResizeState | null>(null);
  const [drawingBox, setDrawingBox] = useState<DrawingBoxState | null>(null);
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const [penPoints, setPenPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [penCursor, setPenCursor] = useState<{ x: number; y: number } | null>(null);

  const {
    device,
    zoom,
    pan,
    updatePan,
    activeTool,
    setActiveTool,
    setCursorPosition,
    isPreviewMode,
  } = useEditorUIStore();

  const {
    document,
    selectedNodeIds,
    selectNodes,
    clearSelection,
    addNode,
    updateNodeGeometry,
    commitSnapshotToHistory,
  } = useEditorDocumentStore();

  const deviceDim = DEVICE_PRESETS[device] || DEVICE_PRESETS.phone;

  const clientToSurfacePoint = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      if (!surfaceRef.current) return { x: 0, y: 0 };
      const rect = surfaceRef.current.getBoundingClientRect();
      return {
        x: Math.round((clientX - rect.left) / zoom),
        y: Math.round((clientY - rect.top) / zoom),
      };
    },
    [zoom]
  );

  // Commit Pen Path helper
  const finishPenPath = useCallback(
    (closed = true) => {
      if (penPoints.length < 2) {
        setPenPoints([]);
        setPenCursor(null);
        setActiveTool('select');
        return;
      }
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of penPoints) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
      const width = Math.max(16, Math.round(maxX - minX));
      const height = Math.max(16, Math.round(maxY - minY));
      const localPoints = penPoints.map((p) => ({
        x: Math.round(p.x - minX),
        y: Math.round(p.y - minY),
      }));

      addNode(
        'path',
        null,
        { x: Math.round(minX), y: Math.round(minY), width, height },
        { closed, points: localPoints }
      );
      setPenPoints([]);
      setPenCursor(null);
      setActiveTool('select');
    },
    [penPoints, addNode, setActiveTool]
  );

  // Listen for Enter/Escape while drawing with Pen tool
  useEffect(() => {
    if (activeTool !== 'pen' || penPoints.length === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishPenPath(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setPenPoints([]);
        setPenCursor(null);
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTool, penPoints, finishPenPath, setActiveTool]);

  const handleStartMoveNode = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (!document) return;
      const idsToMove = selectedNodeIds.includes(nodeId) ? selectedNodeIds : [nodeId];
      const initialGeometries: Record<string, NodeGeometry> = {};
      for (const id of idsToMove) {
        const n = document.nodes[id];
        if (n && !n.locked) {
          initialGeometries[id] = {
            x: n.geometry?.x ?? 0,
            y: n.geometry?.y ?? 0,
            width: n.geometry?.width ?? 100,
            height: n.geometry?.height ?? 48,
            rotation: n.geometry?.rotation ?? 0,
          };
        }
      }
      setMoveState({
        snapshot: document,
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        initialGeometries,
        moved: false,
      });
    },
    [document, selectedNodeIds]
  );

  const handleStartResizeNode = useCallback(
    (e: React.MouseEvent, nodeId: string, direction: ResizeHandleDirection) => {
      if (!document || !document.nodes[nodeId]) return;
      const target = document.nodes[nodeId];
      const initialGeom: NodeGeometry = {
        x: target.geometry?.x ?? 0,
        y: target.geometry?.y ?? 0,
        width: target.geometry?.width ?? 100,
        height: target.geometry?.height ?? 48,
        rotation: target.geometry?.rotation ?? 0,
      };
      const childInitialGeoms: Record<string, NodeGeometry> = {};
      if (target.type === 'group') {
        for (const cid of target.children) {
          const c = document.nodes[cid];
          if (c && c.geometry) {
            childInitialGeoms[cid] = { ...c.geometry };
          }
        }
      }
      setResizeState({
        snapshot: document,
        nodeId,
        direction,
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        initialGeom,
        childInitialGeoms,
        moved: false,
      });
    },
    [document]
  );

  const handleSurfaceMouseDown = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    if (e.button === 1 || activeTool === 'pan' || e.altKey) return;

    const pt = clientToSurfacePoint(e.clientX, e.clientY);

    if (activeTool === 'pen') {
      e.stopPropagation();
      // If clicking near first point with >= 3 points, close & finish path
      if (penPoints.length >= 3) {
        const first = penPoints[0];
        const dist = Math.hypot(pt.x - first.x, pt.y - first.y);
        if (dist <= 12) {
          finishPenPath(true);
          return;
        }
      }
      setPenPoints((prev) => [...prev, pt]);
      return;
    }

    if (
      activeTool === 'rect' ||
      activeTool === 'ellipse' ||
      activeTool === 'line' ||
      activeTool === 'text'
    ) {
      e.stopPropagation();
      setDrawingBox({
        tool: activeTool,
        startX: pt.x,
        startY: pt.y,
        curX: pt.x,
        curY: pt.y,
      });
      return;
    }

    // In select mode: clicking empty surface starts Marquee Selection
    if (activeTool === 'select') {
      if (!e.shiftKey) {
        clearSelection();
      }
      setMarquee({
        startX: pt.x,
        startY: pt.y,
        curX: pt.x,
        curY: pt.y,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || activeTool === 'pan' || e.altKey) {
      e.preventDefault();
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (e.target === containerRef.current) {
      clearSelection();
    }
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pt = clientToSurfacePoint(e.clientX, e.clientY);
      setCursorPosition(pt);

      if (activeTool === 'pen' && penPoints.length > 0) {
        setPenCursor(pt);
      }

      if (isDraggingCanvas) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        updatePan(newX - pan.x, newY - pan.y);
        return;
      }

      if (moveState) {
        const dx = Math.round((e.clientX - moveState.startScreenX) / zoom);
        const dy = Math.round((e.clientY - moveState.startScreenY) / zoom);
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || moveState.moved) {
          for (const [id, init] of Object.entries(moveState.initialGeometries)) {
            updateNodeGeometry(
              id,
              {
                x: init.x + dx,
                y: init.y + dy,
              },
              false
            );
          }
          if (!moveState.moved) {
            setMoveState({ ...moveState, moved: true });
          }
        }
        return;
      }

      if (resizeState) {
        const dx = Math.round((e.clientX - resizeState.startScreenX) / zoom);
        const dy = Math.round((e.clientY - resizeState.startScreenY) / zoom);
        const init = resizeState.initialGeom;
        let nextX = init.x;
        let nextY = init.y;
        let nextW = init.width;
        let nextH = init.height;

        const dir = resizeState.direction;
        if (dir.includes('e')) nextW = Math.max(16, init.width + dx);
        if (dir.includes('s')) nextH = Math.max(16, init.height + dy);
        if (dir.includes('w')) {
          const proposedW = Math.max(16, init.width - dx);
          nextX = init.x + (init.width - proposedW);
          nextW = proposedW;
        }
        if (dir.includes('n')) {
          const proposedH = Math.max(16, init.height - dy);
          nextY = init.y + (init.height - proposedH);
          nextH = proposedH;
        }

        updateNodeGeometry(
          resizeState.nodeId,
          { x: nextX, y: nextY, width: nextW, height: nextH },
          false
        );

        // Proportionally scale group children if resizing a group
        const scaleX = init.width > 0 ? nextW / init.width : 1;
        const scaleY = init.height > 0 ? nextH / init.height : 1;
        for (const [cid, cInit] of Object.entries(resizeState.childInitialGeoms)) {
          updateNodeGeometry(
            cid,
            {
              x: Math.round(cInit.x * scaleX),
              y: Math.round(cInit.y * scaleY),
              width: Math.max(8, Math.round(cInit.width * scaleX)),
              height: Math.max(8, Math.round(cInit.height * scaleY)),
            },
            false
          );
        }

        if (!resizeState.moved) {
          setResizeState({ ...resizeState, moved: true });
        }
        return;
      }

      if (drawingBox) {
        setDrawingBox({
          ...drawingBox,
          curX: pt.x,
          curY: pt.y,
        });
        return;
      }

      if (marquee) {
        setMarquee({
          ...marquee,
          curX: pt.x,
          curY: pt.y,
        });
      }
    },
    [
      clientToSurfacePoint,
      setCursorPosition,
      activeTool,
      penPoints.length,
      isDraggingCanvas,
      dragStart,
      updatePan,
      pan,
      moveState,
      zoom,
      updateNodeGeometry,
      resizeState,
      drawingBox,
      marquee,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingCanvas) {
      setIsDraggingCanvas(false);
    }

    if (moveState) {
      if (moveState.moved) {
        commitSnapshotToHistory(moveState.snapshot);
      }
      setMoveState(null);
    }

    if (resizeState) {
      if (resizeState.moved) {
        commitSnapshotToHistory(resizeState.snapshot);
      }
      setResizeState(null);
    }

    if (drawingBox) {
      const minX = Math.min(drawingBox.startX, drawingBox.curX);
      const minY = Math.min(drawingBox.startY, drawingBox.curY);
      const rawW = Math.abs(drawingBox.curX - drawingBox.startX);
      const rawH = Math.abs(drawingBox.curY - drawingBox.startY);

      if (drawingBox.tool === 'line') {
        const w = rawW < 10 ? 180 : rawW;
        addNode('line', null, { x: minX, y: minY, width: w, height: 4 });
      } else if (drawingBox.tool === 'text') {
        const w = rawW < 20 ? 180 : rawW;
        const h = rawH < 14 ? 32 : rawH;
        addNode('text', null, { x: minX, y: minY, width: w, height: h }, { text: 'New Text' });
      } else if (drawingBox.tool === 'ellipse') {
        const w = rawW < 12 ? 72 : rawW;
        const h = rawH < 12 ? 72 : rawH;
        addNode('ellipse', null, { x: minX, y: minY, width: w, height: h });
      } else {
        const w = rawW < 12 ? 240 : rawW;
        const h = rawH < 12 ? 48 : rawH;
        addNode('rect', null, { x: minX, y: minY, width: w, height: h });
      }

      setDrawingBox(null);
      setActiveTool('select');
    }

    if (marquee && document) {
      const minX = Math.min(marquee.startX, marquee.curX);
      const minY = Math.min(marquee.startY, marquee.curY);
      const maxX = Math.max(marquee.startX, marquee.curX);
      const maxY = Math.max(marquee.startY, marquee.curY);

      if (maxX - minX > 6 || maxY - minY > 6) {
        const hitIds: string[] = [];
        for (const rootId of document.rootNodeIds) {
          // Skip full-screen background card from accidental marquee unless fully enclosed
          const n = document.nodes[rootId];
          if (!n || n.locked || n.visible === false) continue;
          const g = n.geometry || { x: 0, y: 0, width: 100, height: 40 };
          if (n.id === 'node_card_bg' && (minX > g.x || minY > g.y)) continue;
          const intersects =
            g.x < maxX && g.x + g.width > minX && g.y < maxY && g.y + g.height > minY;
          if (intersects) {
            hitIds.push(rootId);
          }
        }
        if (hitIds.length > 0) {
          selectNodes(hitIds);
        }
      }
      setMarquee(null);
    }
  }, [
    isDraggingCanvas,
    moveState,
    resizeState,
    drawingBox,
    marquee,
    document,
    commitSnapshotToHistory,
    addNode,
    setActiveTool,
    selectNodes,
  ]);

  // Handle Drag-and-Drop of component from Left Sidebar onto Canvas
  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/klnp-component')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    const type = e.dataTransfer.getData('application/klnp-component') as BuiltinComponentType;
    if (!type) return;
    e.preventDefault();
    const pt = clientToSurfacePoint(e.clientX, e.clientY);
    addNode(type, null, { x: Math.max(12, pt.x - 60), y: Math.max(24, pt.y - 20) });
  };

  const isDrawingTool =
    activeTool === 'rect' ||
    activeTool === 'ellipse' ||
    activeTool === 'line' ||
    activeTool === 'pen' ||
    activeTool === 'text';

  return (
    <Box
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      sx={{
        flex: 1,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#e2e8f0',
        backgroundImage: 'radial-gradient(#94a3b8 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        cursor:
          activeTool === 'pan' || isDraggingCanvas
            ? 'grab'
            : isDrawingTool
            ? 'crosshair'
            : 'default',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Floating Mode Banner when a Freeform Drawing Tool is active */}
      {isDrawingTool && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            px: 2,
            py: 0.75,
            borderRadius: 99,
            bgcolor: '#1e293b',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Chip
            label={`Tool: ${activeTool.toUpperCase()}`}
            size="small"
            color="primary"
            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
          />
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {activeTool === 'pen'
              ? `Click points on the canvas (${penPoints.length} pts). Click 1st point or Finish to create Vector Path.`
              : 'Click and drag on the canvas to draw freely.'}
          </Typography>
          {activeTool === 'pen' && penPoints.length >= 2 && (
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckRoundedIcon sx={{ fontSize: 14 }} />}
              onClick={() => finishPenPath(true)}
              sx={{ height: 22, fontSize: '0.68rem', textTransform: 'none', px: 1 }}
            >
              Finish Path
            </Button>
          )}
          <Button
            size="small"
            color="inherit"
            startIcon={<CloseRoundedIcon sx={{ fontSize: 14 }} />}
            onClick={() => {
              setPenPoints([]);
              setPenCursor(null);
              setActiveTool('select');
            }}
            sx={{ height: 22, fontSize: '0.68rem', textTransform: 'none', px: 0.75 }}
          >
            Cancel
          </Button>
        </Paper>
      )}

      {/* Transformed Canvas Container (Pan + Zoom) */}
      <Box
        sx={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition:
            isDraggingCanvas || moveState || resizeState ? 'none' : 'transform 0.05s ease-out',
          willChange: 'transform',
        }}
      >
        {/* Canvas Header Tag */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 0.75, px: 0.5 }}
        >
          <Typography variant="caption" fontWeight={700} color="#475569">
            DESIGN CANVAS ({deviceDim.width} × {deviceDim.height})
          </Typography>
          <Typography variant="caption" color="#64748b" sx={{ fontSize: '0.7rem' }}>
            Drag shapes or widgets · Shift+Click / Marquee to Group
          </Typography>
        </Stack>

        {/* Device Frame */}
        <Paper
          elevation={8}
          sx={{
            width: deviceDim.width,
            height: deviceDim.height,
            bgcolor: document?.canvas?.background?.color || '#f1f5f9',
            borderRadius: device === 'phone' ? '36px' : device === 'tablet' ? '24px' : '12px',
            border:
              device === 'phone'
                ? '8px solid #1e293b'
                : device === 'tablet'
                ? '10px solid #1e293b'
                : '4px solid #334155',
            overflow: 'hidden',
            position: 'relative',
            boxSizing: 'content-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Top Notch indicator for Phone */}
          {device === 'phone' && (
            <Box
              sx={{
                width: 120,
                height: 18,
                bgcolor: '#1e293b',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: '0 0 12px 12px',
                zIndex: 100,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Freeform Design Surface */}
          <Box
            ref={surfaceRef}
            onMouseDown={handleSurfaceMouseDown}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
            {document && document.rootNodeIds.length > 0 ? (
              document.rootNodeIds.map((rootId) => (
                <CanvasNodeRenderer
                  key={rootId}
                  nodeId={rootId}
                  onStartMoveNode={handleStartMoveNode}
                  onStartResizeNode={handleStartResizeNode}
                />
              ))
            ) : (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: 'text.secondary',
                  border: '2px dashed #cbd5e1',
                  borderRadius: 4,
                  p: 3,
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>
                  Empty Freeform Canvas
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select Rectangle (R), Ellipse (O), Pen (P), or Text (T) from the top bar and drag
                  here to draw your UI, or drag components from the left panel!
                </Typography>
              </Box>
            )}

            {/* Live Drawing Box Wireframe Preview */}
            {drawingBox && (
              <Box
                sx={{
                  position: 'absolute',
                  left: Math.min(drawingBox.startX, drawingBox.curX),
                  top: Math.min(drawingBox.startY, drawingBox.curY),
                  width: Math.max(4, Math.abs(drawingBox.curX - drawingBox.startX)),
                  height: Math.max(4, Math.abs(drawingBox.curY - drawingBox.startY)),
                  border: '2px solid #2563eb',
                  bgcolor: 'rgba(37, 99, 235, 0.12)',
                  borderRadius: drawingBox.tool === 'ellipse' ? '50%' : '8px',
                  pointerEvents: 'none',
                  zIndex: 90,
                }}
              />
            )}

            {/* Live Pen Tool Vector Preview */}
            {activeTool === 'pen' && penPoints.length > 0 && (
              <svg
                width="100%"
                height="100%"
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  zIndex: 95,
                  overflow: 'visible',
                }}
              >
                <polyline
                  fill="rgba(37, 99, 235, 0.1)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  points={[
                    ...penPoints.map((p) => `${p.x},${p.y}`),
                    ...(penCursor ? [`${penCursor.x},${penCursor.y}`] : []),
                  ].join(' ')}
                />
                {penPoints.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r={idx === 0 ? 6 : 4}
                    fill={idx === 0 ? '#2563eb' : '#ffffff'}
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                ))}
              </svg>
            )}

            {/* Marquee Selection Box */}
            {marquee &&
              (Math.abs(marquee.curX - marquee.startX) > 4 ||
                Math.abs(marquee.curY - marquee.startY) > 4) && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: Math.min(marquee.startX, marquee.curX),
                    top: Math.min(marquee.startY, marquee.curY),
                    width: Math.abs(marquee.curX - marquee.startX),
                    height: Math.abs(marquee.curY - marquee.startY),
                    border: '1.5px solid #3b82f6',
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    pointerEvents: 'none',
                    zIndex: 90,
                  }}
                />
              )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
