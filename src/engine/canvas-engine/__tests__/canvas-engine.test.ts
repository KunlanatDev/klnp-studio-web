import { describe, expect, it } from 'vitest';
import {
  IDENTITY,
  applyToPoint,
  createViewport,
  invert,
  localMatrix,
  multiply,
  panBy,
  rotate,
  screenToLocal,
  screenToWorld,
  translate,
  worldMatrix,
  worldToScreen,
  zoomAt,
  MAX_ZOOM,
} from '..';

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 6);

describe('matrix', () => {
  it('multiply applies right operand first', () => {
    const p = applyToPoint(multiply(translate(10, 0), rotate(90)), { x: 1, y: 0 });
    close(p.x, 10);
    close(p.y, 1);
  });

  it('invert round-trips', () => {
    const m = multiply(translate(5, 7), rotate(33));
    const inv = invert(m)!;
    const p = applyToPoint(inv, applyToPoint(m, { x: 3, y: 4 }));
    close(p.x, 3);
    close(p.y, 4);
  });

  it('invert returns null for singular matrix', () => {
    expect(invert([0, 0, 0, 0, 0, 0])).toBeNull();
  });

  it('rotates about node center', () => {
    const m = localMatrix({ x: 0, y: 0, width: 100, height: 50, rotation: 180 });
    const p = applyToPoint(m, { x: 0, y: 0 });
    close(p.x, 100);
    close(p.y, 50);
  });

  it('flipX mirrors about center', () => {
    const m = localMatrix({ x: 0, y: 0, width: 100, height: 50, rotation: 0, flipX: true });
    close(applyToPoint(m, { x: 0, y: 0 }).x, 100);
  });

  it('world = parent × local', () => {
    const parent = translate(100, 100);
    const w = worldMatrix(parent, { x: 10, y: 20, width: 10, height: 10, rotation: 0 });
    const p = applyToPoint(w, { x: 0, y: 0 });
    expect(p).toEqual({ x: 110, y: 120 });
    expect(applyToPoint(IDENTITY, p)).toEqual(p);
  });
});

describe('viewport', () => {
  it('screen/world round trip', () => {
    const v = panBy({ ...createViewport(800, 600), zoom: 2 }, 30, -10);
    const p = worldToScreen(v, screenToWorld(v, { x: 123, y: 45 }));
    close(p.x, 123);
    close(p.y, 45);
  });

  it('zoomAt keeps cursor world point fixed', () => {
    const v = createViewport(800, 600);
    const cursor = { x: 200, y: 150 };
    const before = screenToWorld(v, cursor);
    const after = screenToWorld(zoomAt(v, cursor, 3), cursor);
    close(after.x, before.x);
    close(after.y, before.y);
  });

  it('clamps zoom', () => {
    expect(zoomAt(createViewport(), { x: 0, y: 0 }, 1000).zoom).toBe(MAX_ZOOM);
  });

  it('screenToLocal inverts node world matrix', () => {
    const v = createViewport();
    const w = translate(50, 50);
    expect(screenToLocal(v, w, { x: 60, y: 70 })).toEqual({ x: 10, y: 20 });
  });
});

