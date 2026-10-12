import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EYE_SPACING_CM, eyeFromFace, oneEuroFilter, windowFrustum } from './offAxis.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`);

test('a centred eye gives a symmetric frustum', () => {
  const f = windowFrustum({ x: 0, y: 0, z: 50 }, 40, 20, 1);
  close(f.left, -0.4);
  close(f.right, 0.4);
  close(f.bottom, -0.2);
  close(f.top, 0.2);
});

test('the frustum edges keep passing through the screen edges when the eye moves', () => {
  const eye = { x: 12, y: -5, z: 70 };
  const near = 0.5;
  const f = windowFrustum(eye, 40, 20, near);
  // Project each near-plane bound out to the screen plane and it must land on the edge.
  close(eye.x + (f.left * eye.z) / near, -20);
  close(eye.x + (f.right * eye.z) / near, 20);
  close(eye.y + (f.bottom * eye.z) / near, -10);
  close(eye.y + (f.top * eye.z) / near, 10);
});

test('eyes further apart in frame mean a closer head', () => {
  const camera = { aspect: 4 / 3, screenHeightCm: 20 };
  const near = eyeFromFace({ x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 }, camera);
  const far = eyeFromFace({ x: 0.45, y: 0.5 }, { x: 0.55, y: 0.5 }, camera);
  assert.ok(near.z < far.z);
  close(far.z, near.z * 2);
  close(near.z, EYE_SPACING_CM / (2 * Math.tan(Math.PI / 6) * 0.2));
});

test('a head on the left of the frame is to the viewer\'s right, and the camera sits above centre', () => {
  const eye = eyeFromFace({ x: 0.2, y: 0.5 }, { x: 0.3, y: 0.5 }, { aspect: 4 / 3, screenHeightCm: 20 });
  assert.ok(eye.x > 0);
  close(eye.y, 10);
});

test('the filter steadies a still head and keeps up with a moving one', () => {
  // A head held at 10 cm with ±0.5 cm of detector wobble, sampled at 30 Hz.
  const still = oneEuroFilter();
  let widest = 0;
  for (let i = 0; i < 90; i += 1) {
    const out = still(10 + (i % 2 ? 0.5 : -0.5), i / 30);
    if (i > 30) widest = Math.max(widest, Math.abs(out - 10));
  }
  assert.ok(widest < 0.15, `wobble left: ${widest}`);

  // A head sweeping sideways at 40 cm/s must not be left far behind.
  const moving = oneEuroFilter();
  let out = 0;
  for (let i = 0; i < 60; i += 1) out = moving((40 * i) / 30, i / 30);
  assert.ok(40 * (59 / 30) - out < 4, `lag: ${40 * (59 / 30) - out}`);
});
