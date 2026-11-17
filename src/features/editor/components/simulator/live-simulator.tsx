import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Chip,
  Alert,
  Button,
  Tooltip,
} from '@mui/material';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useEditorDocumentStore } from '../../stores/editor-document.store';
import { useEditorUIStore } from '../../stores/editor-ui.store';
import type { KLNPNode, PathPoint } from '@klnp/contracts';

export function LiveSimulator() {
  const { document, selectNode } = useEditorDocumentStore();
  const { simulatorOpen, toggleSimulator } = useEditorUIStore();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{
    severity: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  if (!simulatorOpen || !document) return null;

  const allNodes = document.nodes;

  // Count how many freeform groups/nodes act as interactive components
  const interactiveInputs = Object.values(allNodes).filter(
    (n) => n.componentRef?.builtinType === 'input' || n.type === 'input'
  );
  const interactiveButtons = Object.values(allNodes).filter(
    (n) => n.componentRef?.builtinType === 'button' || n.type === 'button'
  );

  const handleResetRuntime = () => {
    setFormValues({});
    setFeedback(null);
  };

  const handleButtonAction = (node: KLNPNode) => {
    const actionType = (node.properties.actionType as string) || 'validate_login';

    if (actionType === 'reset') {
      handleResetRuntime();
      setFeedback({ severity: 'info', message: 'Form state cleared.' });
      return;
    }

    if (actionType === 'alert') {
      setFeedback({
        severity: 'info',
        message: (node.properties.successMessage as string) || `Clicked "${node.name || 'Button'}"!`,
      });
      return;
    }

    // Default: validate_login across all Input components on the page
    for (const inputNode of interactiveInputs) {
      const key = (inputNode.properties.fieldKey as string) || inputNode.id;
      const inputType = (inputNode.properties.inputType as string) || 'text';
      const required = inputNode.properties.required !== false;
      const val = (formValues[key] || '').trim();

      if (required && !val) {
        setFeedback({
          severity: 'error',
          message: `Please fill in "${key}" (${inputNode.name || 'Input'})`,
        });
        selectNode(inputNode.id);
        return;
      }

      if (inputType === 'email' && val && !val.includes('@')) {
        setFeedback({
          severity: 'error',
          message: `Invalid email format in "${key}"`,
        });
        selectNode(inputNode.id);
        return;
      }

      if (inputType === 'password' && val && val.length < 6) {
        setFeedback({
          severity: 'error',
          message: 'Password must be at least 6 characters',
        });
        selectNode(inputNode.id);
        return;
      }
    }

    const emailVal = formValues['email'] || 'user@klnp.studio';
    setFeedback({
      severity: 'success',
      message:
        (node.properties.successMessage as string) ||
        `Login Success! Authenticated as ${emailVal}`,
    });
  };

  const renderSimulatorNode = (nodeId: string): React.ReactNode => {
    const node = allNodes[nodeId];
    if (!node || node.visible === false) return null;

    const geom = node.geometry || { x: 0, y: 0, width: 100, height: 40, rotation: 0 };
    const rotation = geom.rotation ?? node.transform?.rotation ?? 0;
    const isParentFlex = Boolean(
      node.parentId && allNodes[node.parentId]?.layout?.mode === 'flex'
    );

    const posStyle: React.CSSProperties = isParentFlex
      ? {
          position: 'relative',
          width: geom.width,
          height: geom.height,
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

    const effectiveRole = node.componentRef?.builtinType || node.type;

    // 1. Interactive INPUT Component (either a converted Freeform Group or a builtin Input)
    if (effectiveRole === 'input') {
      const fieldKey = (node.properties.fieldKey as string) || node.id;
      const inputType = (node.properties.inputType as string) || 'text';

      // Extract styling from child rect/text if this is a Freeform Group!
      let boxBg = node.style?.backgroundColor || '#f8fafc';
      let boxBorderColor = node.style?.borderColor || '#cbd5e1';
      let boxBorderWidth = node.style?.borderWidth ?? 1.5;
      let boxRadius = node.style?.borderRadius ?? 12;
      let textColor = '#0f172a';
      let fontSize = 14;
      let placeholder = (node.properties.placeholder as string) || 'Enter text...';

      for (const cid of node.children) {
        const child = allNodes[cid];
        if (!child) continue;
        if (child.type === 'rect') {
          boxBg = child.style?.backgroundColor || boxBg;
          boxBorderColor = child.style?.borderColor || boxBorderColor;
          boxBorderWidth = child.style?.borderWidth ?? boxBorderWidth;
          boxRadius = child.style?.borderRadius ?? boxRadius;
        } else if (child.type === 'text') {
          fontSize = Number(child.style?.fontSize || fontSize);
          if (typeof child.properties.text === 'string' && !node.properties.placeholder) {
            placeholder = child.properties.text;
          }
        }
      }

      return (
        <Box
          key={node.id}
          sx={{
            ...posStyle,
            boxSizing: 'border-box',
          }}
        >
          <input
            type={inputType === 'password' ? 'password' : inputType === 'email' ? 'email' : 'text'}
            value={formValues[fieldKey] ?? ''}
            placeholder={placeholder}
            onChange={(e) => {
              setFormValues((prev) => ({ ...prev, [fieldKey]: e.target.value }));
              if (feedback) setFeedback(null);
            }}
            style={{
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              backgroundColor: boxBg,
              border: `${boxBorderWidth}px solid ${boxBorderColor}`,
              borderRadius: `${boxRadius}px`,
              padding: '0 14px',
              fontSize: `${fontSize}px`,
              color: textColor,
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = boxBorderColor;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </Box>
      );
    }

    // 2. Interactive BUTTON Component (either a converted Freeform Group or a builtin Button)
    if (effectiveRole === 'button') {
      let btnBg = node.style?.backgroundColor || '#2563eb';
      let btnRadius = node.style?.borderRadius ?? 12;
      let btnShadow = node.style?.boxShadow || '0 8px 16px -4px rgba(37, 99, 235, 0.35)';
      let btnColor = node.style?.color || '#ffffff';
      let btnFontSize = node.style?.fontSize || 15;
      let btnLabel = (node.properties.label as string) || 'Button';

      for (const cid of node.children) {
        const child = allNodes[cid];
        if (!child) continue;
        if (child.type === 'rect') {
          btnBg = child.style?.backgroundColor || btnBg;
          btnRadius = child.style?.borderRadius ?? btnRadius;
          btnShadow = child.style?.boxShadow || btnShadow;
        } else if (child.type === 'text') {
          btnColor = child.style?.color || btnColor;
          btnFontSize = child.style?.fontSize || btnFontSize;
          if (typeof child.properties.text === 'string') {
            btnLabel = child.properties.text;
          }
        }
      }

      return (
        <Box
          key={node.id}
          component="button"
          onClick={() => handleButtonAction(node)}
          sx={{
            ...posStyle,
            bgcolor: btnBg,
            color: btnColor,
            borderRadius: `${btnRadius}px`,
            boxShadow: btnShadow,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: btnFontSize,
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.1s ease, filter 0.15s ease',
            '&:hover': {
              filter: 'brightness(1.06)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          }}
        >
          {btnLabel}
        </Box>
      );
    }

    // 3. Visual Shapes & Containers
    switch (node.type) {
      case 'rect':
        return (
          <Box
            key={node.id}
            sx={{
              ...posStyle,
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
            {node.children.map((cid) => renderSimulatorNode(cid))}
          </Box>
        );

      case 'ellipse':
        return (
          <Box
            key={node.id}
            sx={{
              ...posStyle,
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

      case 'line':
        return (
          <Box key={node.id} sx={posStyle}>
            <svg width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
              <line
                x1={0}
                y1={Math.max(1, geom.height / 2)}
                x2={geom.width}
                y2={Math.max(1, geom.height / 2)}
                stroke={node.style?.borderColor || '#94a3b8'}
                strokeWidth={Number(node.style?.borderWidth ?? 2)}
                strokeLinecap="round"
              />
            </svg>
          </Box>
        );

      case 'path': {
        const pts = (node.properties.points as PathPoint[]) || [];
        const closed = node.properties.closed !== false;
        const d =
          pts.length > 0
            ? pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') +
              (closed ? ' Z' : '')
            : '';
        return (
          <Box key={node.id} sx={posStyle}>
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${Math.max(1, geom.width)} ${Math.max(1, geom.height)}`}
              preserveAspectRatio="none"
              style={{ overflow: 'visible', display: 'block' }}
            >
              <path
                d={d}
                fill={closed ? node.style?.backgroundColor || 'rgba(37, 99, 235, 0.15)' : 'none'}
                stroke={node.style?.borderColor || '#2563eb'}
                strokeWidth={Number(node.style?.borderWidth ?? 2)}
              />
            </svg>
          </Box>
        );
      }

      case 'text':
        return (
          <Typography
            key={node.id}
            sx={{
              ...posStyle,
              fontSize: node.style?.fontSize ?? 16,
              fontWeight: node.style?.fontWeight ?? '500',
              color: node.style?.color || '#0f172a',
              textAlign: node.style?.textAlign || 'left',
              lineHeight: node.style?.lineHeight || 1.35,
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                node.style?.textAlign === 'center'
                  ? 'center'
                  : node.style?.textAlign === 'right'
                  ? 'flex-end'
                  : 'flex-start',
            }}
          >
            {(node.properties.text as string) || ''}
          </Typography>
        );

      case 'image':
        return (
          <Box
            key={node.id}
            component="img"
            src={(node.properties.src as string) || ''}
            alt={(node.properties.alt as string) || ''}
            sx={{
              ...posStyle,
              objectFit: (node.properties.fit as any) || 'cover',
              borderRadius:
                node.style?.borderRadius !== undefined ? `${node.style.borderRadius}px` : '8px',
            }}
          />
        );

      default:
        return (
          <Box key={node.id} sx={posStyle}>
            {node.children.map((cid) => renderSimulatorNode(cid))}
          </Box>
        );
    }
  };

  // Scale simulator down slightly so it fits comfortably alongside the canvas
  const simScale = 0.82;

  return (
    <Box
      sx={{
        width: 360,
        height: '100%',
        bgcolor: '#0f172a',
        color: '#f8fafc',
        borderLeft: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 6,
        userSelect: 'none',
      }}
    >
      {/* Simulator Top Header */}
      <Box
        sx={{
          height: 44,
          px: 1.5,
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <BoltRoundedIcon sx={{ fontSize: 18, color: '#38bdf8' }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>
            Live Native Simulator
          </Typography>
          <Chip
            label="REALTIME"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              fontWeight: 800,
              bgcolor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
            }}
          />
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Reset Simulator Inputs & State">
            <IconButton size="small" onClick={handleResetRuntime} sx={{ color: '#94a3b8' }}>
              <RestartAltRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hide Simulator">
            <IconButton size="small" onClick={toggleSimulator} sx={{ color: '#94a3b8' }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Simulator Viewport Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1.5,
          px: 1,
        }}
      >
        <Box
          sx={{
            width: 375 * simScale,
            height: 812 * simScale,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <Paper
            elevation={12}
            sx={{
              width: 375,
              height: 812,
              transform: `scale(${simScale})`,
              transformOrigin: 'top left',
              bgcolor: document.canvas?.background?.color || '#f1f5f9',
              borderRadius: '38px',
              border: '8px solid #334155',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* Phone Notch */}
            <Box
              sx={{
                width: 110,
                height: 18,
                bgcolor: '#1e293b',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: '0 0 12px 12px',
                zIndex: 50,
              }}
            />

            {/* Rendered Interactive Nodes */}
            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
              {document.rootNodeIds.map((rid) => renderSimulatorNode(rid))}
            </Box>

            {/* Live Toast / Feedback inside the simulated phone */}
            {feedback && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 24,
                  left: 16,
                  right: 16,
                  zIndex: 100,
                }}
              >
                <Alert
                  severity={feedback.severity}
                  icon={
                    feedback.severity === 'success' ? (
                      <CheckCircleRoundedIcon fontSize="inherit" />
                    ) : undefined
                  }
                  onClose={() => setFeedback(null)}
                  sx={{
                    borderRadius: 2.5,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  {feedback.message}
                </Alert>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Bottom Live State & Bound Components Readout */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: '#020617',
          borderTop: '1px solid #1e293b',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
          <Typography variant="caption" fontWeight={700} color="#94a3b8">
            LIVE STATE &amp; COMPONENT BINDINGS
          </Typography>
          <Typography variant="caption" color="#38bdf8" fontWeight={600}>
            {interactiveInputs.length} Inputs · {interactiveButtons.length} Buttons
          </Typography>
        </Stack>

        <Box
          sx={{
            p: 1,
            borderRadius: 1.5,
            bgcolor: '#0f172a',
            border: '1px solid #1e293b',
            fontFamily: 'monospace',
            fontSize: '0.72rem',
            color: '#e2e8f0',
            maxHeight: 84,
            overflowY: 'auto',
          }}
        >
          {Object.keys(formValues).length === 0 ? (
            <span style={{ color: '#64748b' }}>
              Type inside the simulated Email / Password boxes above to test your converted
              components...
            </span>
          ) : (
            JSON.stringify(formValues, null, 2)
          )}
        </Box>

        {feedback?.severity === 'success' && (
          <Button
            fullWidth
            size="small"
            variant="outlined"
            color="info"
            onClick={handleResetRuntime}
            sx={{ mt: 1, height: 26, fontSize: '0.7rem', textTransform: 'none' }}
          >
            Reset Form State
          </Button>
        )}
      </Box>
    </Box>
  );
}

