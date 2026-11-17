/** 2D affine matrix [a, b, c, d, e, f] (SVG/CSS compatible). Pure TS, no DOM/React. */
export type Matrix = readonly [number, number, number, number, number, number];
export interface Point {
  x: number;
  y: number;
}

export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

/** Returns m1 × m2 (apply m2 first, then m1). */
export function multiply(m1: Matrix, m2: Matrix): Matrix {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

export const translate = (x: number, y: number): Matrix => [1, 0, 0, 1, x, y];
export const scale = (sx: number, sy: number = sx): Matrix => [sx, 0, 0, sy, 0, 0];

export function rotate(degrees: number): Matrix {
  const r = (degrees * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return [cos, sin, -sin, cos, 0, 0];
}

export function determinant(m: Matrix): number {
  return m[0] * m[3] - m[1] * m[2];
}

/** Returns null if the matrix is singular. */
export function invert(m: Matrix): Matrix | null {
  const det = determinant(m);
  if (Math.abs(det) < 1e-12) return null;
  const [a, b, c, d, e, f] = m;
  return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
}

export function applyToPoint(m: Matrix, p: Point): Point {
  return { x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] };
}

export interface NodeTransform {
  x: number;
  y: number;
  /** degrees, clockwise (y-down space) */
  rotation: number;
  flipX?: boolean;
  flipY?: boolean;
  width: number;
  height: number;
}

/**
 * Local matrix: translate(x,y) · rotate about node center · flip about center.
 * Local-space origin is the node's top-left (ADR-02).
 */
export function localMatrix(t: NodeTransform): Matrix {
  const cx = t.width / 2;
  const cy = t.height / 2;
  let m = translate(t.x + cx, t.y + cy);
  m = multiply(m, rotate(t.rotation));
  m = multiply(m, scale(t.flipX ? -1 : 1, t.flipY ? -1 : 1));
  return multiply(m, translate(-cx, -cy));
}

/** World matrix = parentWorld × local. */
export const worldMatrix = (parentWorld: Matrix, t: NodeTransform): Matrix =>
  multiply(parentWorld, localMatrix(t));

