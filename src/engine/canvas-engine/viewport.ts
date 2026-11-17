import { applyToPoint, invert, type Matrix, type Point } from './matrix';

export const MIN_ZOOM = 0.02;
export const MAX_ZOOM = 64;

/** screen = world × zoom + pan (ADR-02). */
export interface Viewport {
  zoom: number;
  panX: number;
  panY: number;
  width: number;
  height: number;
}

export const createViewport = (width = 0, height = 0): Viewport => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  width,
  height,
});

export const clampZoom = (z: number): number => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

export const viewportMatrix = (v: Viewport): Matrix => [v.zoom, 0, 0, v.zoom, v.panX, v.panY];

export const screenToWorld = (v: Viewport, p: Point): Point => ({
  x: (p.x - v.panX) / v.zoom,
  y: (p.y - v.panY) / v.zoom,
});

export const worldToScreen = (v: Viewport, p: Point): Point => ({
  x: p.x * v.zoom + v.panX,
  y: p.y * v.zoom + v.panY,
});

export const panBy = (v: Viewport, dx: number, dy: number): Viewport => ({
  ...v,
  panX: v.panX + dx,
  panY: v.panY + dy,
});

/** Zoom so that the world point under `screenPoint` stays fixed. */
export function zoomAt(v: Viewport, screenPoint: Point, nextZoom: number): Viewport {
  const zoom = clampZoom(nextZoom);
  const world = screenToWorld(v, screenPoint);
  return {
    ...v,
    zoom,
    panX: screenPoint.x - world.x * zoom,
    panY: screenPoint.y - world.y * zoom,
  };
}

/** Convert a world-space matrix point to screen via a node world matrix. */
export function localToScreen(v: Viewport, world: Matrix, p: Point): Point {
  return worldToScreen(v, applyToPoint(world, p));
}

export function screenToLocal(v: Viewport, world: Matrix, p: Point): Point | null {
  const inv = invert(world);
  return inv ? applyToPoint(inv, screenToWorld(v, p)) : null;
}

