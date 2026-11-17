import React, { useRef, useState, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import { useEditorUIStore, DEVICE_PRESETS } from '../../stores/editor-ui.store';
import { useEditorDocumentStore } from '../../stores/editor-document.store';
import { CanvasNodeRenderer } from './canvas-node-renderer';

export function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const {
    device,
    zoom,
    pan,
    updatePan,
    activeTool,
    setCursorPosition,
    isPreviewMode,
  } = useEditorUIStore();

  const { document, clearSelection } = useEditorDocumentStore();

  const deviceDim = DEVICE_PRESETS[device] || DEVICE_PRESETS.phone;

  // Handle panning via mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    // If middle button or activeTool === 'pan' or spacebar
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
      // Track coordinates relative to container
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const rawX = e.clientX - rect.left - rect.width / 2 - pan.x;
        const rawY = e.clientY - rect.top - rect.height / 2 - pan.y;
        const logicalX = Math.round(rawX / zoom);
        const logicalY = Math.round(rawY / zoom);
        setCursorPosition({ x: logicalX, y: logicalY });
      }

      if (isDraggingCanvas) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        updatePan(newX - pan.x, newY - pan.y);
      }
    },
    [isDraggingCanvas, dragStart, pan, zoom, updatePan, setCursorPosition]
  );

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
  };

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
        bgcolor: '#f1f5f9',
        // Dot grid background
        backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
        backgroundPosition: `${pan.x}px ${pan.y}px`,
        cursor: activeTool === 'pan' || isDraggingCanvas ? 'grab' : 'default',
        userSelect: isDraggingCanvas ? 'none' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Transformed Canvas Container (Pan + Zoom) */}
      <Box
        sx={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDraggingCanvas ? 'none' : 'transform 0.05s ease-out',
          willChange: 'transform',
        }}
      >
        {/* Device Frame */}
        <Paper
          elevation={isPreviewMode ? 4 : 8}
          sx={{
            width: deviceDim.width,
            minHeight: deviceDim.height,
            maxHeight: deviceDim.height,
            bgcolor: document?.canvas?.background?.color || '#ffffff',
            borderRadius: device === 'phone' ? '36px' : device === 'tablet' ? '24px' : '12px',
            border: device === 'phone' ? '8px solid #1e293b' : device === 'tablet' ? '10px solid #1e293b' : '4px solid #334155',
            overflow: 'auto',
            position: 'relative',
            boxSizing: 'content-box',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Top Notch / Speaker indicator for Phone & Tablet */}
          {device === 'phone' && (
            <Box
              sx={{
                width: 140,
                height: 20,
                bgcolor: '#1e293b',
                position: 'sticky',
                top: 0,
                left: '50%',
                transform: 'translateX(83px)',
                borderRadius: '0 0 12px 12px',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 4,
                  bgcolor: '#334155',
                  borderRadius: 2,
                }}
              />
            </Box>
          )}

          {/* Root Nodes Container */}
          <Box
            sx={{
              p: 2,
              minHeight: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {document && document.rootNodeIds.length > 0 ? (
              document.rootNodeIds.map((rootId) => (
                <CanvasNodeRenderer key={rootId} nodeId={rootId} />
              ))
            ) : (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  color: 'text.secondary',
                  border: '2px dashed #cbd5e1',
                  borderRadius: 3,
                  mt: 8,
                }}
              >
                No elements yet. Select a component from the left panel to insert.
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

