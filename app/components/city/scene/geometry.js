import * as THREE from 'three';
import { ARENA, KINGDOMS, PLAN_SCALE, PLAZA, planToWorld } from '~/lib/city/kingdoms';

/** SVG plan space (1000×640) → world units. */
export const S = PLAN_SCALE;
export const toWorld = planToWorld;
export const GROUND_Y = 0.18;

export function parsePath(d) {
  const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
  const pts = [];
  for (let i = 0; i < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  return pts;
}

export function centroidOf(points) {
  const sum = points.reduce((a, [x, y]) => [a[0] + x, a[1] + y], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

export function insetPoints(points, factor) {
  const [cx, cy] = centroidOf(points);
  return points.map(([x, y]) => [cx + (x - cx) * factor, cy + (y - cy) * factor]);
}

export function shapeFromPlan(points) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => {
    const [wx, wz] = toWorld(x, y);
    if (i === 0) shape.moveTo(wx, -wz);
    else shape.lineTo(wx, -wz);
  });
  shape.closePath();
  return shape;
}

export function insidePolygon([px, py], points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Deterministic PRNG (mulberry32) so the city is identical on every visit. */
export function seeded(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── street network ───────────────────────────────────────────────

function circlePlan(cx, cy, r, n = 18) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}

/** Closed polyline in world space with cumulative lengths, for walking along. */
export function makePath(planPoints, { closed = true } = {}) {
  const pts = planPoints.map(([x, y]) => toWorld(x, y));
  // An open path is walked there-and-back, which is the same as a closed loop over its mirror.
  const loop = closed ? pts : [...pts, ...pts.slice(1, -1).reverse()];
  const cum = [0];
  for (let i = 0; i < loop.length; i++) {
    const [ax, az] = loop[i];
    const [bx, bz] = loop[(i + 1) % loop.length];
    cum.push(cum[i] + Math.hypot(bx - ax, bz - az));
  }
  return { pts: loop, cum, len: cum[cum.length - 1] };
}

/** Writes the point `d` units along `path` into `out` ([x, z, heading]). */
export function samplePath(path, d, out) {
  const { pts, cum, len } = path;
  const t = ((d % len) + len) % len;
  let i = 0;
  while (i < pts.length - 1 && cum[i + 1] < t) i++;
  const [ax, az] = pts[i];
  const [bx, bz] = pts[(i + 1) % pts.length];
  const seg = cum[i + 1] - cum[i] || 1;
  const f = (t - cum[i]) / seg;
  out[0] = ax + (bx - ax) * f;
  out[1] = az + (bz - az) * f;
  out[2] = Math.atan2(bx - ax, bz - az);
  return out;
}

const ARENA_SHORE = [820, 432];
const ARENA_GATE = [832, 461];
export const PROMENADE = [
  [566, 616],
  [708, 496],
  [972, 386],
];

export function buildStreets() {
  const loops = KINGDOMS.map((k) => ({
    key: k.key,
    path: makePath(insetPoints(parsePath(k.path), 0.92)),
  }));
  return {
    loops,
    plazaRing: makePath(circlePlan(PLAZA.x, PLAZA.y, PLAZA.r + 10)),
    plazaInner: makePath(circlePlan(PLAZA.x, PLAZA.y, PLAZA.r - 14, 12)),
    bridge: makePath([ARENA_SHORE, ARENA_GATE], { closed: false }),
    promenade: makePath(PROMENADE, { closed: false }),
    arenaShore: ARENA_SHORE,
  };
}

// ─── landmarks ────────────────────────────────────────────────────

/** Barcelona landmarks, in plan space. `clear` keeps filler out of their footprint. */
export const LANDMARKS = {
  sagrada: { x: 235, y: 205, clear: 44 },
  dali: { x: 738, y: 182, clear: 34 },
  glories: { x: 792, y: 370, clear: 28 },
  fountain: { x: 556, y: 497, clear: 22 },
  colom: { x: 596, y: 584, clear: 14 },
  sail: { x: 968, y: 384, clear: 0 },
};

export const landmarkWorld = (key) => toWorld(LANDMARKS[key].x, LANDMARKS[key].y);

const nearLandmark = ([px, py]) =>
  Object.values(LANDMARKS).some((l) => l.clear && Math.hypot(l.x - px, l.y - py) < l.clear);

// ─── filler ───────────────────────────────────────────────────────

/** Background buildings and trees, deterministic per kingdom. */
export function generateFiller() {
  const blocks = [];
  const trees = [];
  KINGDOMS.forEach((k, ki) => {
    const poly = parsePath(k.path);
    const safe = insetPoints(poly, 0.86);
    const rand = seeded(97 + ki * 131);
    const xs = poly.map((p) => p[0]);
    const ys = poly.map((p) => p[1]);
    const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const treeShare = k.key === 'plants' ? 0.4 : k.key === 'algae' ? 0.3 : 0.14;
    // The Hearth is laid out like Cerdà's Eixample: a strict grid of even, chamfered blocks.
    const eixample = k.key === 'earth';
    for (let gx = minX; gx < maxX; gx += 34) {
      for (let gy = minY; gy < maxY; gy += 34) {
        const jitter = eixample ? 0 : 14;
        const p = [gx + (rand() - 0.5) * jitter, gy + (rand() - 0.5) * jitter];
        if (!insidePolygon(p, safe)) continue;
        if (nearLandmark(p)) continue;
        if (k.plots.some(([x, y]) => Math.hypot(x - p[0], y - p[1]) < 38)) continue;
        if (Math.hypot(PLAZA.x - p[0], PLAZA.y - p[1]) < PLAZA.r + 26) continue;
        if (Math.hypot(k.label.x + 50 - p[0], k.label.y - p[1]) < 42) continue;
        const [wx, wz] = toWorld(p[0], p[1]);
        if (rand() < treeShare) {
          trees.push({ x: wx, y: GROUND_Y, z: wz, s: 0.55 + rand() * 0.45, shade: rand() });
          continue;
        }
        const tall = k.key === 'animals' || k.key === 'fungi' ? 1.9 : k.key === 'earth' ? 0.35 : 1.3;
        const size = eixample ? 1.2 : 0.8 + rand() * 0.5;
        const block = {
          kingdom: k.key,
          x: wx,
          z: wz,
          w: size,
          d: eixample ? size : 0.8 + rand() * 0.5,
          h: (eixample ? 1 : 0.5) + rand() * tall,
          rot: eixample ? 0 : (rand() - 0.5) * 0.5,
          tint: rand(),
          solar: rand() < 0.45,
        };
        blocks.push(block);
        // The Grove grows on its roofs.
        if (k.key === 'plants' && rand() < 0.7) {
          trees.push({ x: wx, y: GROUND_Y + block.h + 0.16, z: wz, s: 0.35 + rand() * 0.2, shade: rand() });
        }
      }
    }
  });
  return { blocks, trees };
}

export function districtCentroid(k) {
  const [cx, cy] = centroidOf(parsePath(k.path));
  return toWorld(cx, cy);
}

export const ARENA_WORLD = (() => {
  const [x, z] = toWorld(ARENA.x, ARENA.y);
  return { x, z, r: ARENA.r * S };
})();

export const PLAZA_WORLD = (() => {
  const [x, z] = toWorld(PLAZA.x, PLAZA.y);
  return { x, z, r: PLAZA.r * S };
})();

// ─── textures ─────────────────────────────────────────────────────

function toTexture(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function makeWindowTextures() {
  const w = 64;
  const h = 128;
  const facade = document.createElement('canvas');
  const glow = document.createElement('canvas');
  facade.width = glow.width = w;
  facade.height = glow.height = h;
  const f = facade.getContext('2d');
  const g = glow.getContext('2d');
  f.fillStyle = '#f7f0e0';
  f.fillRect(0, 0, w, h);
  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);
  const rand = seeded(7);
  const warm = ['#ffd58a', '#ffc36b', '#ffe6b0', '#bfe8ff', '#ffb3d9', '#c9ffb8'];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 4; col++) {
      const x = 6 + col * 14;
      const y = 6 + row * 15;
      f.fillStyle = '#93a9b0';
      f.fillRect(x, y, 8, 9);
      f.fillStyle = 'rgba(255,255,255,0.35)';
      f.fillRect(x, y, 8, 2);
      if (rand() > 0.35) {
        g.fillStyle = warm[Math.floor(rand() * warm.length)];
        g.fillRect(x, y, 8, 9);
      }
    }
  }
  return { map: toTexture(facade), emissiveMap: toTexture(glow) };
}

const TRENCADIS = ['#2f6fb5', '#3fa7c9', '#f2c14e', '#e4572e', '#6bbf59', '#ffffff', '#1d3f7a', '#f7a8c4', '#8fd3c7'];
const BATLLO = ['#6fb7c9', '#a7d8d0', '#3f8fb0', '#e7c9a0', '#f3e3c3', '#8cc6a8', '#d98fa8', '#4c7fb8'];

function drawShards(ctx, size, palette, rand, count) {
  for (let i = 0; i < count; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const r = 3 + rand() * 6;
    const sides = 4 + Math.floor(rand() * 3);
    const spin = rand() * Math.PI;
    ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
    ctx.beginPath();
    for (let s = 0; s < sides; s++) {
      const a = spin + (s / sides) * Math.PI * 2;
      const rr = r * (0.65 + rand() * 0.45);
      const px = cx + Math.cos(a) * rr;
      const py = cy + Math.sin(a) * rr;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function makeCanvas(w, h = w) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return [canvas, canvas.getContext('2d')];
}

function repeating(texture, rx, ry) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(rx, ry);
  return texture;
}

/**
 * Canvas textures for the Barcelona architecture: Gaudí's broken-tile trencadís,
 * the Casa Batlló facade, the perforated Sagrada Família spires and the Torre Glòries LED skin.
 */
export function makeBarcelonaTextures() {
  const [mosaic, m] = makeCanvas(128);
  m.fillStyle = '#efe8d8';
  m.fillRect(0, 0, 128, 128);
  drawShards(m, 128, TRENCADIS, seeded(11), 420);

  const [batllo, b] = makeCanvas(64, 128);
  const [batlloGlow, bg] = makeCanvas(64, 128);
  b.fillStyle = '#d7ebe6';
  b.fillRect(0, 0, 64, 128);
  drawShards(b, 128, BATLLO, seeded(23), 520);
  bg.fillStyle = '#000';
  bg.fillRect(0, 0, 64, 128);
  const rand = seeded(5);
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 3; col++) {
      const x = 12 + col * 20;
      const y = 14 + row * 20;
      b.fillStyle = '#26303a';
      b.beginPath();
      b.ellipse(x, y, 5, 7, 0, 0, Math.PI * 2);
      b.fill();
      // Bone-white "mask" balcony under each window.
      b.fillStyle = '#f6f1e4';
      b.fillRect(x - 6, y + 6, 12, 2);
      if (rand() > 0.3) {
        bg.fillStyle = rand() > 0.5 ? '#ffd58a' : '#bfe8ff';
        bg.beginPath();
        bg.ellipse(x, y, 5, 7, 0, 0, Math.PI * 2);
        bg.fill();
      }
    }
  }

  const [spire, s] = makeCanvas(64);
  const [spireGlow, sg] = makeCanvas(64);
  s.fillStyle = '#d4bd93';
  s.fillRect(0, 0, 64, 64);
  sg.fillStyle = '#000';
  sg.fillRect(0, 0, 64, 64);
  for (let row = 0; row < 8; row++) {
    s.fillStyle = 'rgba(120,90,60,0.25)';
    s.fillRect(0, row * 8 + 6, 64, 1);
    for (let col = 0; col < 8; col++) {
      s.fillStyle = '#5a4634';
      s.fillRect(col * 8 + 3, row * 8 + 2, 2, 4);
      sg.fillStyle = '#ffcf8a';
      sg.fillRect(col * 8 + 3, row * 8 + 2, 2, 4);
    }
  }

  const [led, l] = makeCanvas(64, 128);
  for (let y = 0; y < 128; y++) {
    const c = new THREE.Color().setHSL(0.02 + (y / 128) * 0.62, 0.85, 0.55);
    l.fillStyle = `#${c.getHexString()}`;
    l.fillRect(0, y, 64, 1);
  }
  l.fillStyle = 'rgba(10,14,30,0.55)';
  for (let x = 0; x < 64; x += 4) l.fillRect(x, 0, 1, 128);
  for (let y = 0; y < 128; y += 4) l.fillRect(0, y, 64, 1);

  return {
    mosaic: repeating(toTexture(mosaic), 2, 2),
    batllo: { map: toTexture(batllo), emissiveMap: toTexture(batlloGlow) },
    spire: { map: repeating(toTexture(spire), 3, 4), emissiveMap: repeating(toTexture(spireGlow), 3, 4) },
    led: repeating(toTexture(led), 3, 1),
  };
}

/** Soft round sprite used for every glow (lamps, fireflies, fireworks). */
export function makeGlowTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.7)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}
