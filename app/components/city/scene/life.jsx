/* eslint-disable react/no-unknown-property -- three.js JSX props (args, castShadow, …) */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { KINGDOMS, KINGDOMS_BY_KEY } from '~/lib/city/kingdoms';
import {
  ARENA_WORLD,
  GROUND_Y,
  PLAZA_WORLD,
  PROMENADE,
  districtCentroid,
  insidePolygon,
  makeGlowTexture,
  parsePath,
  samplePath,
  seeded,
  toWorld,
} from './geometry';

let glowTexture = null;
function useGlow() {
  return useMemo(() => {
    glowTexture ??= makeGlowTexture();
    return glowTexture;
  }, []);
}

function pointsGeometry(positions, colors) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  if (colors) g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return g;
}

const OUTFITS = ['#1a1a1a', '#f97316', '#ffe500', '#22c55e', '#a855f7', '#06b6d4', '#f43f5e', '#f7f0dc', '#3b82f6', '#8b5a3c'];
const SKIN = ['#f1c7a5', '#d9a47f', '#a86b4a', '#6e452f', '#f6d9c2'];

// ─── people ───────────────────────────────────────────────────────

/** Citizens strolling the streets, the plaza, the promenade and over the bridge to the Arena. */
export function Walkers({ streets, lit }) {
  const bodies = useRef();
  const heads = useRef();
  const walkers = useMemo(() => {
    const rand = seeded(2024);
    const lanes = [
      ...streets.loops.map((l) => ({ path: l.path, n: 26 })),
      { path: streets.plazaRing, n: 30 },
      { path: streets.plazaInner, n: 12 },
      { path: streets.bridge, n: 12 },
      { path: streets.promenade, n: 26 },
    ];
    const list = [];
    for (const { path, n } of lanes) {
      for (let i = 0; i < n; i++) {
        list.push({
          path,
          d0: rand() * path.len,
          speed: (0.35 + rand() * 0.4) * (rand() < 0.5 ? -1 : 1),
          lane: (rand() - 0.5) * 0.5,
          phase: rand() * Math.PI * 2,
          outfit: OUTFITS[Math.floor(rand() * OUTFITS.length)],
          skin: SKIN[Math.floor(rand() * SKIN.length)],
          scale: 0.9 + rand() * 0.3,
        });
      }
    }
    return list;
  }, [streets]);

  useEffect(() => {
    const c = new THREE.Color();
    walkers.forEach((w, i) => {
      bodies.current.setColorAt(i, c.set(w.outfit));
      heads.current.setColorAt(i, c.set(w.skin));
    });
    bodies.current.instanceColor.needsUpdate = true;
    heads.current.instanceColor.needsUpdate = true;
  }, [walkers]);

  const tmp = useMemo(() => ({ o: new THREE.Object3D(), p: [0, 0, 0] }), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const { o, p } = tmp;
    walkers.forEach((w, i) => {
      samplePath(w.path, w.d0 + w.speed * t, p);
      const heading = p[2] + (w.speed < 0 ? Math.PI : 0);
      const x = p[0] + Math.cos(p[2]) * w.lane;
      const z = p[1] - Math.sin(p[2]) * w.lane;
      const bob = Math.abs(Math.sin(t * 7 + w.phase)) * 0.035;
      o.position.set(x, GROUND_Y + 0.2 * w.scale + bob, z);
      o.rotation.set(0, heading, Math.sin(t * 7 + w.phase) * 0.08);
      o.scale.setScalar(w.scale);
      o.updateMatrix();
      bodies.current.setMatrixAt(i, o.matrix);
      o.position.y += 0.23 * w.scale;
      o.updateMatrix();
      heads.current.setMatrixAt(i, o.matrix);
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    heads.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={bodies} args={[undefined, undefined, walkers.length]} frustumCulled={false}>
        <capsuleGeometry args={[0.075, 0.2, 2, 6]} />
        <meshStandardMaterial roughness={0.7} emissive="#ffffff" emissiveIntensity={lit ? 0.12 : 0} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, walkers.length]} frustumCulled={false}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
    </>
  );
}

// ─── transport ────────────────────────────────────────────────────

export function Promenade({ streets, lit }) {
  const segments = useMemo(() => {
    const pts = PROMENADE.map(([x, y]) => toWorld(x, y));
    return pts.slice(0, -1).map((a, i) => {
      const b = pts[i + 1];
      return {
        key: i,
        pos: [(a[0] + b[0]) / 2, 0.13, (a[1] + b[1]) / 2],
        len: Math.hypot(b[0] - a[0], b[1] - a[1]) + 1.1,
        rot: Math.atan2(b[0] - a[0], b[1] - a[1]),
      };
    });
  }, []);
  const cars = useRef([]);
  const tmp = useMemo(() => [0, 0, 0], []);
  useFrame(({ clock }) => {
    const d = clock.elapsedTime * 1.6;
    cars.current.forEach((car, i) => {
      if (!car) return;
      samplePath(streets.promenade, d - i * 0.95, tmp);
      car.position.set(tmp[0], 0.42, tmp[1]);
      car.rotation.y = tmp[2];
    });
  });
  return (
    <>
      {segments.map((s) => (
        <group key={s.key} position={s.pos} rotation={[0, s.rot, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[1.15, 0.1, s.len]} />
            <meshStandardMaterial color={lit ? '#5a5566' : '#d8c9a2'} roughness={0.9} />
          </mesh>
          {[-0.18, 0.18].map((x) => (
            <mesh key={x} position={[x, 0.06, 0]}>
              <boxGeometry args={[0.04, 0.03, s.len]} />
              <meshStandardMaterial color="#7a6d5c" metalness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          ref={(g) => {
            cars.current[i] = g;
          }}
        >
          <mesh>
            <boxGeometry args={[0.52, 0.42, 0.85]} />
            <meshStandardMaterial color="#ffe500" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.54, 0.14, 0.7]} />
            <meshStandardMaterial color="#1a1a1a" emissive="#fff2b0" emissiveIntensity={lit ? 2.2 : 0.1} />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[0.56, 0.05, 0.9]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ))}
    </>
  );
}

export function Boats({ lit }) {
  const boats = useMemo(() => {
    const rand = seeded(88);
    return Array.from({ length: 6 }, (_, i) => ({
      key: i,
      cx: ARENA_WORLD.x + 1 + rand() * 2,
      cz: ARENA_WORLD.z + 1.5 + rand() * 1.5,
      rx: 5.5 + i * 0.9,
      rz: 2.6 + i * 0.35,
      speed: (0.05 + rand() * 0.06) * (i % 2 ? 1 : -1),
      phase: rand() * Math.PI * 2,
      sail: i % 3 === 0 ? '#ffe500' : '#fffdf3',
    }));
  }, []);
  const refs = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    boats.forEach((b, i) => {
      const g = refs.current[i];
      if (!g) return;
      const a = b.phase + t * b.speed;
      g.position.set(b.cx + Math.cos(a) * b.rx, 0.08 + Math.sin(t * 1.4 + i) * 0.03, b.cz + Math.sin(a) * b.rz);
      const dir = Math.sign(b.speed);
      g.rotation.y = Math.atan2(-Math.sin(a) * b.rx * dir, Math.cos(a) * b.rz * dir);
      g.rotation.z = Math.sin(t * 1.1 + i) * 0.05;
    });
  });
  return boats.map((b, i) => (
    <group
      key={b.key}
      ref={(g) => {
        refs.current[i] = g;
      }}
    >
      <mesh>
        <boxGeometry args={[0.32, 0.14, 0.9]} />
        <meshStandardMaterial color="#8b5a3c" />
      </mesh>
      <mesh position={[0, 0.5, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <coneGeometry args={[0.32, 0.85, 3]} />
        <meshStandardMaterial color={b.sail} />
      </mesh>
      <mesh position={[0, 0.2, -0.38]}>
        <sphereGeometry args={[0.05, 6, 4]} />
        <meshStandardMaterial color="#fff" emissive="#ffd58a" emissiveIntensity={lit ? 4 : 0} toneMapped={false} />
      </mesh>
    </group>
  ));
}

export function Birds({ visible }) {
  const ref = useRef();
  const birds = useMemo(() => {
    const rand = seeded(5);
    const flocks = [
      [-12, -6],
      [6, -9],
      [-4, 8],
    ];
    return flocks.flatMap(([cx, cz], f) =>
      Array.from({ length: 7 }, (_, i) => ({
        cx,
        cz,
        r: 5 + f * 1.5 + (rand() - 0.5) * 1.2,
        y: 7 + f * 0.8 + rand() * 0.8,
        speed: 0.22 + f * 0.04,
        lag: i * 0.07 + rand() * 0.03,
        phase: rand() * Math.PI * 2,
      })),
    );
  }, []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([0, 0, 0.12, -0.3, 0.06, -0.08, 0, 0, -0.05, 0, 0, 0.12, 0, 0, -0.05, 0.3, 0.06, -0.08]), 3),
    );
    g.computeVertexNormals();
    return g;
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    if (!ref.current || !visible) return;
    const t = clock.elapsedTime;
    birds.forEach((b, i) => {
      const a = t * b.speed - b.lag;
      o.position.set(b.cx + Math.cos(a) * b.r, b.y + Math.sin(t * 0.6 + b.phase) * 0.3, b.cz + Math.sin(a) * b.r);
      o.rotation.set(0, -a, 0);
      o.scale.set(1.2, 1 + Math.sin(t * 9 + b.phase) * 1.4, 1.2);
      o.updateMatrix();
      ref.current.setMatrixAt(i, o.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, birds.length]} visible={visible} frustumCulled={false}>
      <meshBasicMaterial color="#2b2b2b" side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ─── lights ───────────────────────────────────────────────────────

export function StreetLamps({ streets, lit }) {
  const poles = useRef();
  const heads = useRef();
  const glow = useGlow();
  const lamps = useMemo(() => {
    const out = [];
    const p = [0, 0, 0];
    const paths = [...streets.loops.map((l) => l.path), streets.plazaRing, streets.promenade];
    for (const path of paths) {
      const spacing = 1.7;
      const n = Math.floor(path.len / spacing);
      for (let i = 0; i < n; i++) {
        samplePath(path, i * spacing, p);
        const side = path === streets.promenade ? 0.62 : 0.42;
        out.push([p[0] + Math.cos(p[2]) * side, p[1] - Math.sin(p[2]) * side]);
      }
    }
    return out;
  }, [streets]);

  const glowGeometry = useMemo(() => {
    const arr = new Float32Array(lamps.length * 3);
    lamps.forEach(([x, z], i) => arr.set([x, GROUND_Y + 0.62, z], i * 3));
    return pointsGeometry(arr);
  }, [lamps]);

  useEffect(() => {
    const m = new THREE.Matrix4();
    lamps.forEach(([x, z], i) => {
      m.makeTranslation(x, GROUND_Y + 0.3, z);
      poles.current.setMatrixAt(i, m);
      m.makeTranslation(x, GROUND_Y + 0.62, z);
      heads.current.setMatrixAt(i, m);
    });
    poles.current.instanceMatrix.needsUpdate = true;
    heads.current.instanceMatrix.needsUpdate = true;
  }, [lamps]);

  return (
    <>
      <instancedMesh ref={poles} args={[undefined, undefined, lamps.length]}>
        <cylinderGeometry args={[0.018, 0.024, 0.6, 5]} />
        <meshStandardMaterial color="#2d2d2d" />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, lamps.length]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <meshStandardMaterial color="#fff6dc" emissive="#ffcf7a" emissiveIntensity={lit ? 4 : 0.15} toneMapped={false} />
      </instancedMesh>
      <points geometry={glowGeometry} visible={lit}>
        <pointsMaterial
          map={glow}
          color="#ffc56b"
          size={1.1}
          sizeAttenuation
          transparent
          opacity={0.75}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

function scatterInKingdom(key, count, seed, yRange) {
  const k = KINGDOMS_BY_KEY[key];
  const poly = parsePath(k.path);
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const rand = seeded(seed);
  const arr = new Float32Array(count * 3);
  let n = 0;
  while (n < count) {
    const p = [Math.min(...xs) + rand() * (Math.max(...xs) - Math.min(...xs)), Math.min(...ys) + rand() * (Math.max(...ys) - Math.min(...ys))];
    if (!insidePolygon(p, poly)) continue;
    const [x, z] = toWorld(p[0], p[1]);
    arr.set([x, yRange[0] + rand() * (yRange[1] - yRange[0]), z], n * 3);
    n++;
  }
  return arr;
}

/** Fireflies over The Grove. */
export function Fireflies({ visible }) {
  const glow = useGlow();
  const base = useMemo(() => scatterInKingdom('plants', 160, 31, [GROUND_Y + 0.4, 2.6]), []);
  const geometry = useMemo(() => pointsGeometry(base.slice()), [base]);
  const material = useRef();
  useFrame(({ clock }) => {
    if (!visible) return;
    const t = clock.elapsedTime;
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i] = base[i] + Math.sin(t * 0.7 + i) * 0.35;
      pos[i + 1] = base[i + 1] + Math.sin(t * 1.3 + i * 0.5) * 0.25;
      pos[i + 2] = base[i + 2] + Math.cos(t * 0.6 + i) * 0.35;
    }
    geometry.attributes.position.needsUpdate = true;
    if (material.current) material.current.opacity = 0.75 + Math.sin(t * 3) * 0.2;
  });
  return (
    <points geometry={geometry} visible={visible}>
      <pointsMaterial
        ref={material}
        map={glow}
        color="#d9ff7a"
        size={0.5}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Bioluminescent plankton along The Tidewater shore. */
export function Plankton({ visible }) {
  const glow = useGlow();
  const [a, b] = useMemo(() => {
    const rand = seeded(61);
    const make = () => {
      const arr = new Float32Array(180 * 3);
      for (let i = 0; i < 180; i++) {
        const t = rand();
        const [x0, y0] = t < 0.35 ? [560, 600] : [700, 480];
        const [x1, y1] = t < 0.35 ? [700, 480] : [980, 362];
        const f = t < 0.35 ? t / 0.35 : (t - 0.35) / 0.65;
        const px = x0 + (x1 - x0) * f + rand() * 60 + 8;
        const py = y0 + (y1 - y0) * f + rand() * 70 + 12;
        const [x, z] = toWorld(px, py);
        arr.set([x, 0.08, z], i * 3);
      }
      return pointsGeometry(arr);
    };
    return [make(), make()];
  }, []);
  const ma = useRef();
  const mb = useRef();
  useFrame(({ clock }) => {
    if (!visible) return;
    const t = clock.elapsedTime;
    if (ma.current) ma.current.opacity = 0.35 + Math.max(0, Math.sin(t * 1.2)) * 0.6;
    if (mb.current) mb.current.opacity = 0.35 + Math.max(0, Math.sin(t * 1.2 + Math.PI)) * 0.6;
  });
  return (
    <group visible={visible}>
      <points geometry={a}>
        <pointsMaterial ref={ma} map={glow} color="#4ff5ff" size={0.45} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points geometry={b}>
        <pointsMaterial ref={mb} map={glow} color="#7affd4" size={0.35} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

export function Stars({ visible }) {
  const glow = useGlow();
  const geometry = useMemo(() => {
    const rand = seeded(404);
    const arr = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      const theta = rand() * Math.PI * 2;
      const phi = 0.15 + rand() * 1.1;
      const r = 150;
      arr.set([Math.cos(theta) * Math.sin(phi) * r, Math.cos(phi) * r * 0.8 + 10, Math.sin(theta) * Math.sin(phi) * r], i * 3);
    }
    return pointsGeometry(arr);
  }, []);
  return (
    <points geometry={geometry} visible={visible}>
      <pointsMaterial map={glow} color="#ffffff" size={1.6} transparent opacity={0.9} fog={false} depthWrite={false} />
    </points>
  );
}

/** The Undernet's mycelium: glowing threads between its buildings and down to the plaza. */
export function Mycelium({ lit }) {
  const geometry = useMemo(() => {
    const k = KINGDOMS_BY_KEY.fungi;
    const nodes = k.plots.map(([x, y]) => toWorld(x, y));
    nodes.push([PLAZA_WORLD.x, PLAZA_WORLD.z]);
    const rand = seeded(12);
    const segs = [];
    const y = GROUND_Y + 0.03;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]) > 8.5) continue;
        // Wiggle each thread through a few midpoints so it reads organic.
        let [px, pz] = nodes[i];
        for (let s = 1; s <= 4; s++) {
          const f = s / 4;
          const nx = nodes[i][0] + (nodes[j][0] - nodes[i][0]) * f + (s < 4 ? (rand() - 0.5) * 0.9 : 0);
          const nz = nodes[i][1] + (nodes[j][1] - nodes[i][1]) * f + (s < 4 ? (rand() - 0.5) * 0.9 : 0);
          segs.push(px, y, pz, nx, y, nz);
          [px, pz] = [nx, nz];
        }
      }
    }
    return pointsGeometry(new Float32Array(segs));
  }, []);
  const mat = useRef();
  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = (lit ? 0.7 : 0.25) + Math.sin(clock.elapsedTime * 2) * 0.15;
  });
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial ref={mat} color="#d49bff" transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

/** Light travelling from each kingdom to the one it feeds — the symbiosis loop, live. */
export function SymbiosisFlow({ lit }) {
  const glow = useGlow();
  const PER_ARC = 14;
  const arcs = useMemo(
    () =>
      KINGDOMS.map((k) => {
        const [ax, az] = districtCentroid(k);
        const [bx, bz] = districtCentroid(KINGDOMS_BY_KEY[k.feeds]);
        return {
          curve: new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(ax, 2.6, az),
            new THREE.Vector3((ax + bx) / 2, 7.5, (az + bz) / 2),
            new THREE.Vector3(bx, 2.6, bz),
          ),
          color: new THREE.Color(k.color),
        };
      }),
    [],
  );
  const geometry = useMemo(() => {
    const n = arcs.length * PER_ARC;
    const colors = new Float32Array(n * 3);
    arcs.forEach((a, i) => {
      for (let j = 0; j < PER_ARC; j++) colors.set([a.color.r, a.color.g, a.color.b], (i * PER_ARC + j) * 3);
    });
    return pointsGeometry(new Float32Array(n * 3), colors);
  }, [arcs]);
  const lines = useMemo(
    () =>
      arcs.map((a) => {
        const g = new THREE.BufferGeometry().setFromPoints(a.curve.getPoints(40));
        return { g, color: a.color };
      }),
    [arcs],
  );
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.09;
    const pos = geometry.attributes.position.array;
    arcs.forEach((a, i) => {
      for (let j = 0; j < PER_ARC; j++) {
        a.curve.getPoint((t + j / PER_ARC) % 1, v);
        pos.set([v.x, v.y, v.z], (i * PER_ARC + j) * 3);
      }
    });
    geometry.attributes.position.needsUpdate = true;
  });
  return (
    <>
      <points geometry={geometry}>
        <pointsMaterial
          map={glow}
          vertexColors
          size={lit ? 1.1 : 0.8}
          transparent
          depthWrite={false}
          blending={lit ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>
      {lines.map(({ g, color }) => (
        <line key={color.getHexString()} geometry={g}>
          <lineBasicMaterial color={color} transparent opacity={lit ? 0.35 : 0.28} depthWrite={false} />
        </line>
      ))}
    </>
  );
}

export function ChimneySmoke({ sources, dark }) {
  const ref = useRef();
  const PUFFS = 6;
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    sources.forEach(([x, y, z], s) => {
      for (let j = 0; j < PUFFS; j++) {
        const p = (t * 0.28 + j / PUFFS + s * 0.13) % 1;
        o.position.set(x + p * 0.6, y + p * 1.8, z - p * 0.2);
        o.scale.setScalar((0.5 + p * 1.6) * (1 - p * 0.5));
        o.updateMatrix();
        ref.current.setMatrixAt(s * PUFFS + j, o.matrix);
      }
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  if (!sources.length) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, sources.length * PUFFS]} frustumCulled={false}>
      <icosahedronGeometry args={[0.16, 0]} />
      <meshStandardMaterial color={dark ? '#8d8aa0' : '#ffffff'} transparent opacity={0.6} flatShading depthWrite={false} />
    </instancedMesh>
  );
}

// ─── the Arena after dark ─────────────────────────────────────────

export function ArenaShow({ lit, dark }) {
  const { x, z, r } = ARENA_WORLD;
  const crowd = useRef();
  const beams = useRef([]);
  const glow = useGlow();

  const fans = useMemo(() => {
    const rand = seeded(77);
    return Array.from({ length: 220 }, () => {
      const t = 0.12 + rand() * 0.72;
      const a = rand() * Math.PI * 2;
      const rad = r * (0.6 + 0.36 * t);
      return {
        x: x + Math.cos(a) * rad,
        z: z + Math.sin(a) * rad,
        y: 0.2 + 0.35 + 1.1 * t + 0.08,
        phase: rand() * Math.PI * 2,
        color: OUTFITS[Math.floor(rand() * OUTFITS.length)],
      };
    });
  }, [x, z, r]);

  useEffect(() => {
    const c = new THREE.Color();
    fans.forEach((f, i) => crowd.current.setColorAt(i, c.set(f.color)));
    crowd.current.instanceColor.needsUpdate = true;
  }, [fans]);

  const BURSTS = 3;
  const SPARKS = 80;
  const bursts = useMemo(
    () =>
      Array.from({ length: BURSTS }, (_, b) => {
        const rand = seeded(300 + b);
        const dirs = new Float32Array(SPARKS * 3);
        for (let i = 0; i < SPARKS; i++) {
          const u = rand() * 2 - 1;
          const th = rand() * Math.PI * 2;
          const s = Math.sqrt(1 - u * u);
          dirs.set([s * Math.cos(th), u, s * Math.sin(th)], i * 3);
        }
        return { dirs, geometry: pointsGeometry(new Float32Array(SPARKS * 3)), offset: b * 1.6 };
      }),
    [],
  );
  const burstMats = useRef([]);
  const palette = useMemo(() => KINGDOMS.map((k) => new THREE.Color(k.color)).concat(new THREE.Color('#ffe500')), []);
  const o = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const amp = dark ? 0.14 : lit ? 0.08 : 0.03;
    const speed = dark ? 9 : 5;
    fans.forEach((f, i) => {
      o.position.set(f.x, f.y + Math.max(0, Math.sin(t * speed + f.phase)) * amp, f.z);
      o.updateMatrix();
      crowd.current.setMatrixAt(i, o.matrix);
    });
    crowd.current.instanceMatrix.needsUpdate = true;

    beams.current.forEach((beam, i) => {
      if (!beam) return;
      beam.rotation.z = Math.sin(t * 0.7 + i * 1.7) * 0.45;
      beam.rotation.x = Math.cos(t * 0.5 + i) * 0.3;
    });

    if (!dark) return;
    bursts.forEach((b, bi) => {
      const cycle = 4.8;
      const local = (t + b.offset) % cycle;
      const round = Math.floor((t + b.offset) / cycle);
      const mat = burstMats.current[bi];
      const pos = b.geometry.attributes.position.array;
      const life = 1.8;
      if (local > life) {
        if (mat) mat.opacity = 0;
        return;
      }
      const rand = seeded(round * 7 + bi);
      const ox = x + (rand() - 0.5) * 6;
      const oy = 9 + rand() * 3;
      const oz = z + (rand() - 0.5) * 4;
      const speedK = 2.6 + rand();
      for (let i = 0; i < SPARKS; i++) {
        pos[i * 3] = ox + b.dirs[i * 3] * local * speedK;
        pos[i * 3 + 1] = oy + b.dirs[i * 3 + 1] * local * speedK - 0.9 * local * local;
        pos[i * 3 + 2] = oz + b.dirs[i * 3 + 2] * local * speedK;
      }
      b.geometry.attributes.position.needsUpdate = true;
      if (mat) {
        mat.opacity = Math.max(0, 1 - local / life);
        if (local < 0.05) mat.color.copy(palette[Math.floor(rand() * palette.length)]);
      }
    });
  });

  return (
    <>
      <instancedMesh ref={crowd} args={[undefined, undefined, fans.length]} frustumCulled={false}>
        <capsuleGeometry args={[0.07, 0.14, 2, 6]} />
        <meshStandardMaterial roughness={0.7} emissive="#ffffff" emissiveIntensity={lit ? 0.15 : 0} />
      </instancedMesh>
      <group visible={lit}>
        {[0, 1, 2, 3].map((i) => {
          const a = Math.PI / 4 + (i * Math.PI) / 2;
          return (
            <group key={i} position={[x + Math.cos(a) * r * 1.15, 2.9, z + Math.sin(a) * r * 1.15]}>
              <group
                ref={(g) => {
                  beams.current[i] = g;
                }}
              >
                <mesh position={[0, 6, 0]}>
                  <coneGeometry args={[1.3, 12, 18, 1, true]} />
                  <meshBasicMaterial
                    color={i % 2 ? '#ffe500' : '#f97316'}
                    transparent
                    opacity={dark ? 0.16 : 0.1}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    fog={false}
                  />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
      <group visible={dark}>
        {bursts.map((b, i) => (
          <points key={b.offset} geometry={b.geometry} frustumCulled={false}>
            <pointsMaterial
              ref={(m) => {
                burstMats.current[i] = m;
              }}
              map={glow}
              color="#ffe500"
              size={0.7}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              fog={false}
            />
          </points>
        ))}
      </group>
    </>
  );
}

// ─── weather ──────────────────────────────────────────────────────

/** Rain, only when it is actually raining in Barcelona. */
export function Rain() {
  const COUNT = 1100;
  const geometry = useMemo(() => {
    const rand = seeded(9);
    const arr = new Float32Array(COUNT * 6);
    for (let i = 0; i < COUNT; i++) {
      const px = (rand() - 0.5) * 70;
      const py = rand() * 22;
      const pz = (rand() - 0.5) * 50;
      arr.set([px, py, pz, px + 0.05, py - 0.45, pz], i * 6);
    }
    return pointsGeometry(arr);
  }, []);
  useFrame((_, delta) => {
    const pos = geometry.attributes.position.array;
    const fall = delta * 16;
    for (let i = 0; i < COUNT; i++) {
      const k = i * 6;
      pos[k + 1] -= fall;
      pos[k + 4] -= fall;
      if (pos[k + 4] < 0) {
        pos[k + 1] += 22;
        pos[k + 4] += 22;
      }
    }
    geometry.attributes.position.needsUpdate = true;
  });
  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial color="#cfe0ff" transparent opacity={0.45} depthWrite={false} />
    </lineSegments>
  );
}
/* eslint-enable react/no-unknown-property */
