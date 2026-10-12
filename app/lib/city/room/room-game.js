/* eslint-disable no-undef -- LittleJS classic build: the engine's functions are globals */
'use strict';

/**
 * A citizen's room, drawn with LittleJS.
 *
 * This is a plain script, not a module: it runs inside the `/city/room-frame` iframe after
 * `littlejs.min.js`, which keeps the engine (one global loop, canvas sized to its window,
 * listeners on `document`) away from the rest of the site and lets closing the room throw
 * it all away. It talks to `CityRoom.jsx` with postMessage:
 *
 *   in   init { name, kingdom: { key, color, name, role }, hue, passers, light, playing }
 *        hue  { hue }                     the visitor changed colour
 *        goto { id }                      walk to a thing and use it
 *   out  ready                            ask for init
 *        near   { id | null }             the thing the visitor is standing next to
 *        action { id }                    the visitor used a thing
 */

const W = 16;
const H = 10;
const WALL = 2.6;
const REACH = 1.5;
const CHANNEL = 'sotabosc-room';

let room = null;
let you = null;
let people = [];
let things = [];
let props = [];
let blocked = [];
let nearId = null;
let pendingUse = null;
const fx = {};

const post = (message) => window.parent.postMessage({ source: CHANNEL, ...message }, window.location.origin);
const cellOf = (p) => ({ x: Math.max(0, Math.min(W - 1, Math.floor(p.x))), y: Math.max(0, Math.min(H - 1, Math.floor(p.y))) });
const centre = (c) => vec2(c.x + 0.5, c.y + 0.5);
const isFree = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !blocked[y * W + x];
const ink = () => rgb(0.1, 0.1, 0.1);
const hex = (value) => new Color().setHex(value);
const mix = (a, b, t) => a.lerp(b, t);

function block(x, y, w = 1, h = 1) {
  for (let cy = Math.floor(y); cy < y + h; cy++) for (let cx = Math.floor(x); cx < x + w; cx++) blocked[cy * W + cx] = true;
}

/** Breadth-first path over the floor grid; returns cell centres, or null when there is no way. */
function pathTo(from, to) {
  const start = cellOf(from);
  const goal = cellOf(to);
  if (!isFree(goal.x, goal.y)) return null;
  const prev = new Map([[start.y * W + start.x, -1]]);
  const queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const c = queue[i];
    if (c.x === goal.x && c.y === goal.y) break;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = c.x + dx;
        const ny = c.y + dy;
        if (!isFree(nx, ny) || prev.has(ny * W + nx)) continue;
        // no squeezing diagonally between two pieces of furniture
        if (dx && dy && (!isFree(c.x + dx, c.y) || !isFree(c.x, c.y + dy))) continue;
        prev.set(ny * W + nx, c.y * W + c.x);
        queue.push({ x: nx, y: ny });
      }
    }
  }
  if (!prev.has(goal.y * W + goal.x)) return null;
  const path = [];
  for (let k = goal.y * W + goal.x; k !== -1 && k !== start.y * W + start.x; k = prev.get(k)) {
    path.unshift(vec2((k % W) + 0.5, Math.floor(k / W) + 0.5));
  }
  return path;
}

function randomFreeCell() {
  for (let tries = 0; tries < 80; tries++) {
    const c = { x: Math.floor(rand(W)), y: Math.floor(rand(H - 1)) };
    if (isFree(c.x, c.y)) return c;
  }
  return { x: 8, y: 0 };
}

function person(pos, hue, speed) {
  return { pos, hue, speed, path: [], step: rand(9), wait: 0, facing: 1 };
}

// ─── rooms ────────────────────────────────────────────────────────

/** Furniture for each kingdom's kind of place. `at` is the floor cell the visitor stands on to use a thing. */
const LAYOUTS = {
  // The Hearth: a café.
  earth() {
    prop('counter', 1, 7.4, 6, 1.2);
    for (const [x, y] of [[4, 3.5], [8.5, 5], [12.5, 3], [11.5, 6.5]]) prop('table', x, y);
    prop('plant', 14.5, 8.5);
    thing('host', 'The counter', 3.5, 6.5, 3.5, 8);
    thing('special', 'Order a coffee', 6.5, 6.5, 6.2, 8, '☕');
  },
  // The Grove: a gallery and studio.
  plants() {
    for (const [x, y, tone] of [[3, 5.5, 0.08], [7.5, 6.5, 0.55], [11.5, 5, 0.85]]) prop('plinth', x, y, 1, 1, tone);
    prop('easel', 13.5, 7.5);
    for (const [x, y] of [[1.5, 8.5], [14.5, 2.5], [1.5, 2.5]]) prop('plant', x, y);
    thing('host', 'The front desk', 5.5, 8.5, 5.5, 9.6);
    thing('special', 'Look at the piece', 7.5, 5.5, 7.5, 7, '✦');
  },
  // The Undernet: a lab and makers' room.
  fungi() {
    prop('bench', 2, 6.2, 5, 1.2);
    prop('bench', 9, 3.2, 5, 1.2);
    prop('rack', 13.5, 8.2, 2, 1.2);
    prop('plant', 1.5, 2.5);
    thing('host', 'The workbench', 4.5, 5.5, 4.5, 6.8);
    thing('special', 'Press the big button', 13.5, 7.5, 14.5, 8.8, '●');
  },
  // The Commons: a venue.
  animals() {
    prop('stage', 4, 7, 8, 2.4);
    prop('speaker', 2.5, 7.5);
    prop('speaker', 12.5, 7.5);
    for (const [x, y] of [[3, 3], [8, 2.5], [13, 3.5]]) prop('hightable', x, y);
    thing('host', 'The bar', 14.5, 6.5, 14.5, 7.4);
    thing('special', 'Call for a song', 8.5, 6.5, 8, 8.2, '♪');
  },
  // The Tidewater: a wellness studio.
  algae() {
    for (const [x, y] of [[3, 5.5], [6.5, 5.5], [10, 5.5], [4.7, 2.8], [8.2, 2.8]]) prop('mat', x, y, 2, 1, x * 0.07);
    prop('fountain', 13.5, 4.5);
    for (const [x, y] of [[1.5, 8.5], [14.5, 8.5]]) prop('plant', x, y);
    thing('host', 'The welcome desk', 5.5, 8.5, 5.5, 9.6);
    thing('special', 'Sit by the water', 12.5, 3.5, 13.5, 4.5, '≈');
  },
};

function prop(kind, x, y, w = 1, h = 1, tone = 0) {
  props.push({ kind, x, y, w, h, tone });
  // mats are walked over; everything else is in the way
  if (kind !== 'mat') block(x - (w > 1 ? 0 : 0.5), y - (h > 1 ? 0 : 0.5), w, h);
}

function thing(id, label, atX, atY, x, y, glyph = '') {
  things.push({ id, label, glyph, at: { x: Math.floor(atX), y: Math.floor(atY) }, pos: vec2(x, y) });
}

function build(data) {
  room = data;
  props = [];
  things = [];
  blocked = new Array(W * H).fill(false);
  (LAYOUTS[data.kingdom.key] || LAYOUTS.earth)();
  // The same four things are in every room, along the back wall and by the door.
  thing('screen', 'The screen', 10.5, 9.5, 10.5, H + 1.1);
  thing('board', 'What’s on here', 13.5, 9.5, 13.5, H + 1.05);
  thing('stamp', 'Stamp your passport', 1.5, 0.5, 0.75, 0.6, '✚');
  thing('door', 'Leave', 8.5, 0.5, 8.5, -0.25);
  for (const t of things) blocked[t.at.y * W + t.at.x] = false;
  blocked[0] = true; // the stamp stand

  you = person(vec2(8.5, 1.5), data.hue, 3.4);
  people = Array.from({ length: data.passers }, (_, i) => person(centre(randomFreeCell()), (i * 67 + 20) % 360, rand(1.1, 1.9)));
  nearId = null;
  post({ type: 'things', things: things.map(({ id, label }) => ({ id, label })) });
}

// ─── update ───────────────────────────────────────────────────────

function walk(p) {
  if (!p.path.length) return false;
  const target = p.path[0];
  const delta = target.subtract(p.pos);
  const reach = p.speed * timeDelta;
  if (delta.length() <= reach) {
    p.pos = target;
    p.path.shift();
  } else {
    p.pos = p.pos.add(delta.normalize(reach));
  }
  if (Math.abs(delta.x) > 0.01) p.facing = Math.sign(delta.x);
  p.step += timeDelta * 9;
  return true;
}

function goTo(id) {
  const t = things.find((item) => item.id === id);
  if (!t) return;
  const path = pathTo(you.pos, centre(t.at));
  if (!path) return;
  you.path = path;
  pendingUse = id;
}

function activate(id) {
  const t = things.find((item) => item.id === id);
  if (!t) return;
  fx[id] = time;
  if (id === 'stamp') burst(t.pos.add(vec2(0, 0.7)), hex('#ffe500'), hex(room.kingdom.color));
  if (id === 'special') burst(t.pos.add(vec2(0, 0.8)), hex(room.kingdom.color), rgb(1, 1, 1));
  post({ type: 'action', id });
}

function burst(pos, a, b) {
  new ParticleEmitter(
    pos, 0, 0.4, 0.15, 160, PI,
    undefined, a, b, a.scale(1, 0), b.scale(1, 0),
    0.9, 0.16, 0.04, 0.09, 0.05, 0.94, 1, 0.4, PI, 0.1, 0.4, false, false,
  );
}

function gameUpdate() {
  if (!room) return;

  if (mouseWasPressed(0)) {
    const hit = things.find((t) => t.pos.distance(mousePos) < 0.9 || centre(t.at).distance(mousePos) < 0.6);
    if (hit) goTo(hit.id);
    else if (mousePos.x >= 0 && mousePos.x < W && mousePos.y >= 0 && mousePos.y < H) {
      const path = pathTo(you.pos, mousePos);
      if (path) {
        you.path = path;
        pendingUse = null;
        fx.tap = time;
        fx.tapPos = centre(cellOf(mousePos));
      }
    }
  }

  // Arrow keys / WASD nudge one cell at a time.
  if (!you.path.length) {
    const dx = (keyIsDown('ArrowRight') || keyIsDown('KeyD') ? 1 : 0) - (keyIsDown('ArrowLeft') || keyIsDown('KeyA') ? 1 : 0);
    const dy = (keyIsDown('ArrowUp') || keyIsDown('KeyW') ? 1 : 0) - (keyIsDown('ArrowDown') || keyIsDown('KeyS') ? 1 : 0);
    const c = cellOf(you.pos);
    if ((dx || dy) && isFree(c.x + dx, c.y + dy)) {
      you.path = [centre({ x: c.x + dx, y: c.y + dy })];
      pendingUse = null;
    }
  }
  if (keyWasPressed('Escape')) post({ type: 'action', id: 'door' });

  const moving = walk(you);
  if (!moving && pendingUse) {
    const id = pendingUse;
    pendingUse = null;
    activate(id);
  }

  let closest = null;
  for (const t of things) {
    const d = centre(t.at).distance(you.pos);
    // the door only counts when you are standing in it, or walking in would offer to leave at once
    if (d < (t.id === 'door' ? 0.7 : REACH) && (!closest || d < closest.d)) closest = { id: t.id, d };
  }
  if ((closest ? closest.id : null) !== nearId) {
    nearId = closest ? closest.id : null;
    post({ type: 'near', id: nearId });
  }
  if (nearId && !moving && (keyWasPressed('Space') || keyWasPressed('Enter') || keyWasPressed('KeyE'))) activate(nearId);

  for (const p of people) {
    if (walk(p)) continue;
    p.wait -= timeDelta;
    if (p.wait > 0) continue;
    p.wait = rand(1.5, 6);
    p.path = pathTo(p.pos, centre(randomFreeCell())) || [];
  }
}

// ─── drawing ──────────────────────────────────────────────────────

function drawPerson(p, isYou) {
  const moving = p.path.length > 0;
  const bob = moving ? Math.abs(Math.sin(p.step)) * 0.07 : 0;
  const sat = isYou ? 0.62 : 0.24;
  const body = hsl(p.hue / 360, sat, isYou ? 0.48 : 0.4);
  const head = hsl(p.hue / 360, sat, isYou ? 0.58 : 0.5);
  const sitting = isYou && fx.special && room.kingdom.key === 'algae' && time - fx.special < 5 && !moving;
  const tall = sitting ? 0.5 : 0.8;
  drawEllipse(p.pos.add(vec2(0, -0.02)), vec2(0.62, 0.24), rgb(0, 0, 0, 0.18));
  if (isYou) drawEllipse(p.pos.add(vec2(0, -0.02)), vec2(0.86, 0.36), rgb(0, 0, 0, 0), 0, 0.05, hex('#ffe500'));
  drawEllipse(p.pos.add(vec2(0, tall / 2 + 0.06 + bob)), vec2(0.44, tall), body, 0, 0.035, ink());
  drawCircle(p.pos.add(vec2(p.facing * 0.03, tall + 0.2 + bob)), 0.36, head, 0.035, ink());
  if (isYou && fx.special && room.kingdom.key === 'earth') {
    // carrying the coffee you ordered
    drawRect(p.pos.add(vec2(p.facing * 0.3, 0.5 + bob)), vec2(0.16, 0.2), rgb(1, 1, 1));
  }
}

function drawProp(o) {
  const k = hex(room.kingdom.color);
  const wood = hex('#b98a5a');
  const dark = ink();
  const at = vec2(o.x, o.y);
  const box = (pos, size, color) => {
    drawRect(pos, size.add(vec2(0.07)), dark);
    drawRect(pos, size, color);
  };
  switch (o.kind) {
    case 'counter':
    case 'bench': {
      const mid = at.add(vec2(o.w / 2, o.h / 2));
      box(mid, vec2(o.w, o.h), mix(wood, k, 0.25));
      drawRect(mid.add(vec2(0, o.h * 0.22)), vec2(o.w, o.h * 0.5), mix(wood, rgb(1, 1, 1), 0.35));
      if (o.kind === 'counter') {
        drawRect(at.add(vec2(1, o.h + 0.25)), vec2(0.6, 0.5), dark);
        drawRect(at.add(vec2(1, o.h + 0.3)), vec2(0.45, 0.3), hex('#d9d2c0'));
      } else {
        for (let i = 0; i < 3; i++) drawRect(at.add(vec2(0.8 + i * 1.5, o.h + 0.15)), vec2(0.5, 0.3), i % 2 ? k : hex('#2b2b2b'));
      }
      break;
    }
    case 'table':
    case 'hightable': {
      const high = o.kind === 'hightable';
      drawEllipse(at.add(vec2(0, -0.1)), vec2(1, 0.4), rgb(0, 0, 0, 0.18));
      drawRect(at.add(vec2(0, 0.25)), vec2(0.14, high ? 0.9 : 0.5), dark);
      drawEllipse(at.add(vec2(0, high ? 0.75 : 0.5)), vec2(high ? 0.9 : 1.15, high ? 0.42 : 0.55), mix(wood, rgb(1, 1, 1), 0.2), 0, 0.04, dark);
      if (!high) for (const sx of [-0.85, 0.85]) drawEllipse(at.add(vec2(sx, 0.2)), vec2(0.42, 0.26), k, 0, 0.035, dark);
      break;
    }
    case 'plant':
      drawEllipse(at.add(vec2(0, -0.12)), vec2(0.8, 0.3), rgb(0, 0, 0, 0.18));
      box(at.add(vec2(0, 0.15)), vec2(0.55, 0.5), hex('#c9774d'));
      for (const [dx, dy, s] of [[0, 0.95, 0.75], [-0.3, 0.7, 0.55], [0.32, 0.72, 0.55]]) {
        drawCircle(at.add(vec2(dx + Math.sin(time * 1.3 + o.x) * 0.02, dy)), s, hex(dx ? '#5fae5f' : '#3f8f4c'), 0.03, dark);
      }
      break;
    case 'plinth': {
      box(at.add(vec2(0, 0.35)), vec2(0.8, 0.9), hex('#f4f0dc'));
      const lit = fx.special && time - fx.special < 3 ? 0.25 * Math.sin(time * 12) : 0;
      drawCircle(at.add(vec2(0, 1.15)), 0.62, hsl(o.tone, 0.6, 0.55 + lit), 0.04, dark);
      drawRect(at.add(vec2(0.1, 1.2)), vec2(0.22, 0.22), hsl((o.tone + 0.4) % 1, 0.7, 0.6), time * 0.4);
      break;
    }
    case 'easel':
      drawLine(at.add(vec2(-0.35, -0.3)), at.add(vec2(0, 1.4)), 0.07, dark);
      drawLine(at.add(vec2(0.35, -0.3)), at.add(vec2(0, 1.4)), 0.07, dark);
      box(at.add(vec2(0, 0.75)), vec2(0.9, 0.7), rgb(1, 1, 0.95));
      drawCircle(at.add(vec2(-0.1, 0.8)), 0.3, k);
      break;
    case 'rack': {
      const mid = at.add(vec2(o.w / 2, o.h / 2 + 0.3));
      box(mid, vec2(o.w, o.h + 0.6), hex('#23262e'));
      const party = fx.special && time - fx.special < 4;
      for (let i = 0; i < 12; i++) {
        const on = party ? Math.sin(time * 18 + i * 1.7) > 0 : Math.sin(time * 2 + i * 2.1) > 0.3;
        drawRect(at.add(vec2(0.3 + (i % 6) * 0.28, 0.5 + Math.floor(i / 6) * 0.5)), vec2(0.14, 0.14), on ? (party ? hsl((i / 12 + time) % 1, 0.9, 0.6) : k) : hex('#3a3f4a'));
      }
      break;
    }
    case 'stage': {
      const mid = at.add(vec2(o.w / 2, o.h / 2));
      box(mid, vec2(o.w, o.h), hex('#3a2a22'));
      drawRect(mid.add(vec2(0, -o.h / 2 + 0.2)), vec2(o.w, 0.4), hex('#241812'));
      if (fx.special && time - fx.special < 5) {
        const sway = Math.sin(time * 2) * 0.8;
        drawPoly([vec2(-0.3, 2.6), vec2(0.3, 2.6), vec2(1.3 + sway, 0), vec2(-1.3 + sway, 0)], rgb(1, 0.9, 0.3, 0.28), 0, dark, mid.add(vec2(0, -0.4)));
      }
      break;
    }
    case 'speaker':
      box(at.add(vec2(0, 0.55)), vec2(0.8, 1.3), hex('#1f1f1f'));
      drawCircle(at.add(vec2(0, 0.85)), 0.34 + (fx.special && time - fx.special < 5 ? Math.abs(Math.sin(time * 10)) * 0.08 : 0), hex('#555'));
      drawCircle(at.add(vec2(0, 0.3)), 0.5, hex('#444'));
      break;
    case 'mat':
      drawRect(at.add(vec2(o.w / 2, o.h / 2)), vec2(o.w - 0.15, o.h - 0.25), hsl(0.5 + o.tone * 0.2, 0.45, 0.62, 0.9));
      break;
    case 'fountain':
      drawEllipse(at, vec2(1.7, 1.1), hex('#d9d2c0'), 0, 0.05, dark);
      drawEllipse(at, vec2(1.35, 0.8), hex('#7cc6cf'));
      drawEllipse(at, vec2(0.3 + ((time * 0.5) % 1) * 1, 0.18 + ((time * 0.5) % 1) * 0.6), rgb(1, 1, 1, 0), 0, 0.03, rgb(1, 1, 1, 0.8 - ((time * 0.5) % 1) * 0.8));
      break;
    default:
  }
}

function drawRoom() {
  const k = hex(room.kingdom.color);
  const night = room.light === 'night';
  // floor boards
  drawRect(vec2(W / 2, H / 2), vec2(W, H), mix(hex('#e9dcc0'), k, 0.08));
  for (let y = 0; y < H; y++) {
    drawRect(vec2(W / 2, y), vec2(W, 0.03), rgb(0, 0, 0, 0.1));
    for (let x = (y % 2) * 1.5; x < W; x += 3) drawRect(vec2(x, y + 0.5), vec2(0.03, 1), rgb(0, 0, 0, 0.08));
  }
  // back wall, skirting, side walls
  drawRect(vec2(W / 2, H + WALL / 2), vec2(W, WALL), mix(hex('#f6ecd6'), k, 0.22));
  drawRect(vec2(W / 2, H + 0.1), vec2(W, 0.2), ink());
  drawRect(vec2(-0.15, (H + WALL) / 2), vec2(0.3, H + WALL), ink());
  drawRect(vec2(W + 0.15, (H + WALL) / 2), vec2(0.3, H + WALL), ink());
  drawRect(vec2(W / 2, -0.15), vec2(W + 0.6, 0.3), ink());

  // windows show the hour outside
  for (const x of [2.5, 5.5]) {
    drawRect(vec2(x, H + 1.1), vec2(1.9, 1.5), ink());
    drawRect(vec2(x, H + 1.1), vec2(1.7, 1.3), night ? hex('#1b2246') : room.light === 'dusk' ? hex('#f2b48f') : hex('#bfe0ea'));
    drawRect(vec2(x, H + 1.1), vec2(0.08, 1.3), ink());
  }
  // the citizen's screen
  const flash = fx.screen && time - fx.screen < 1.2 ? 0.5 : 0;
  drawRect(vec2(10.5, H + 1.1), vec2(2.9, 1.6), ink());
  drawRect(vec2(10.5, H + 1.1), vec2(2.7, 1.4), mix(hex('#101218'), k, 0.35 + flash + Math.sin(time * 1.5) * 0.08));
  drawText(room.playing || room.kingdom.role, vec2(10.5, H + 1.1), 0.36, hex('#ffe500'), 0, undefined, 'center', 'ui-monospace, monospace', 'bold', 2.5);
  // noticeboard
  drawRect(vec2(13.5, H + 1.05), vec2(1.5, 1.3), ink());
  drawRect(vec2(13.5, H + 1.05), vec2(1.34, 1.14), hex('#c9a26b'));
  for (const [dx, dy, tone] of [[-0.3, 0.2, '#fffdf3'], [0.25, 0.25, '#ffe500'], [-0.05, -0.25, '#fffdf3']]) {
    drawRect(vec2(13.5 + dx, H + 1.05 + dy), vec2(0.42, 0.36), hex(tone), dx);
  }
  // name over the door, doorway, passport stand
  drawText(room.name, vec2(W / 2, H + 2.22), 0.5, ink(), 0, undefined, 'center', 'system-ui, sans-serif', '900', W - 1);
  drawRect(vec2(8.5, -0.15), vec2(1.6, 0.34), hex('#ffe500'));
  drawRect(vec2(0.6, 0.45), vec2(0.75, 0.75), ink());
  drawRect(vec2(0.6, 0.47), vec2(0.6, 0.6), hex('#ffe500'), fx.stamp && time - fx.stamp < 0.4 ? 0.2 : 0);
}

function drawThingMarker(t) {
  const near = t.id === nearId;
  const lift = Math.sin(time * 3 + t.pos.x) * 0.06;
  const spot = centre(t.at);
  drawEllipse(spot, vec2(0.8, 0.5), rgb(0, 0, 0, 0), 0, near ? 0.07 : 0.035, near ? hex('#ffe500') : rgb(0, 0, 0, 0.25));
  if (t.id === 'door') return;
  const tag = t.pos.add(vec2(t.pos.y > H ? 1.1 : 0, (t.pos.y > H ? -0.75 : 1.6) + lift));
  drawCircle(tag, near ? 0.66 : 0.5, near ? hex('#ffe500') : rgb(1, 0.99, 0.95), 0.045, ink());
  drawText(t.glyph || '!', tag.add(vec2(0, -0.01)), near ? 0.46 : 0.34, ink(), 0, undefined, 'center', 'system-ui, sans-serif', '900');
}

function gameRender() {
  if (!room) return;
  drawRoom();
  if (fx.tap && time - fx.tap < 0.5) {
    const a = (time - fx.tap) / 0.5;
    drawEllipse(fx.tapPos, vec2(0.4 + a * 0.6, 0.25 + a * 0.4), rgb(0, 0, 0, 0), 0, 0.05, rgb(0.1, 0.1, 0.1, 1 - a));
  }
  // Painter's order: whatever stands further back is drawn first.
  const scene = [
    ...props.map((o) => ({ y: o.h > 1 || o.w > 1 ? o.y : o.y - 0.3, draw: () => drawProp(o), flat: o.kind === 'mat' })),
    ...people.map((p) => ({ y: p.pos.y, draw: () => drawPerson(p, false) })),
    { y: you.pos.y, draw: () => drawPerson(you, true) },
  ];
  scene.filter((s) => s.flat).forEach((s) => s.draw());
  scene.filter((s) => !s.flat).sort((a, b) => b.y - a.y).forEach((s) => s.draw());
  things.forEach(drawThingMarker);
  if (room.light === 'night') drawRect(vec2(W / 2, (H + WALL) / 2), vec2(W + 1, H + WALL + 1), rgb(0.05, 0.07, 0.25, 0.22));
}

function gameUpdatePost() {
  // Fit the whole room, whatever shape the frame is.
  setCameraPos(vec2(W / 2, (H + WALL) / 2 - 0.1));
  setCameraScale(Math.min(mainCanvasSize.x / (W + 1), mainCanvasSize.y / (H + WALL + 1)));
}

window.addEventListener('message', (e) => {
  if (e.origin !== window.location.origin || !e.data || e.data.source !== CHANNEL) return;
  if (e.data.type === 'init') build(e.data.room);
  if (e.data.type === 'hue' && you) you.hue = e.data.hue;
  if (e.data.type === 'goto' && room) goTo(e.data.id);
});

setShowSplashScreen(false);
setSoundEnable(false);
setTouchGamepadEnable(false);
setCanvasClearColor(hex('#1a140f'));
engineInit(() => post({ type: 'ready' }), gameUpdate, gameUpdatePost, gameRender);
/* eslint-enable no-undef */
