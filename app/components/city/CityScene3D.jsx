/* eslint-disable react/no-unknown-property -- three.js JSX props (args, castShadow, …) */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { ARENA, KINGDOMS, KINGDOMS_BY_KEY } from '~/lib/city/kingdoms';
import {
  ARENA_WORLD,
  GROUND_Y,
  PLAZA_WORLD,
  buildStreets,
  districtCentroid,
  generateFiller,
  insetPoints,
  makeBarcelonaTextures,
  makeWindowTextures,
  parsePath,
  shapeFromPlan,
  toWorld,
} from './scene/geometry';
import { CitizenBuilding, FillerCity, Trees, Turbine, VacantPlot, chimneyOffset } from './scene/architecture';
import {
  ColomColumn,
  DaliMuseum,
  HotelSail,
  MagicFountain,
  ParkGuellBench,
  SagradaFamilia,
  TorreGlories,
} from './scene/landmarks';
import {
  ArenaShow,
  Birds,
  Boats,
  ChimneySmoke,
  Fireflies,
  Mycelium,
  Plankton,
  Promenade,
  Rain,
  Stars,
  StreetLamps,
  SymbiosisFlow,
  Walkers,
} from './scene/life';

const PALETTE = {
  day: {
    sky: '#f3e7c6',
    fog: [90, 190],
    hemiSky: '#fff6e0',
    hemiGround: '#c9b98f',
    hemi: 1.15,
    sun: '#fff1d6',
    sunIntensity: 2.2,
    sunPosition: [-18, 30, 14],
    ground: '#e6d9b6',
    sea: '#7cc6cf',
    districtMix: ['#f7f0dc', 0.74],
  },
  dusk: {
    sky: '#f2b48f',
    fog: [80, 180],
    hemiSky: '#ffdcb8',
    hemiGround: '#7d5b6d',
    hemi: 1.0,
    sun: '#ff9b5a',
    sunIntensity: 1.9,
    sunPosition: [-34, 13, 8],
    ground: '#dcbc9e',
    sea: '#6f9fc0',
    districtMix: ['#f3dcc4', 0.66],
  },
  night: {
    sky: '#1b2246',
    fog: [90, 200],
    hemiSky: '#8a90c8',
    hemiGround: '#4a4258',
    hemi: 0.95,
    sun: '#c3ccff',
    sunIntensity: 0.7,
    sunPosition: [20, 30, -10],
    ground: '#2d3246',
    sea: '#0f2f4a',
    districtMix: ['#2a2e44', 0.66],
  },
};

const SKY = {
  day: ['#bfe0ea', '#f6ecd0'],
  dusk: ['#4f4f94', '#ffb27d'],
  night: ['#070b22', '#3a2f6e'],
};

function SkyDome({ mode }) {
  const geometry = useMemo(() => {
    const g = new THREE.SphereGeometry(320, 32, 16);
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    return g;
  }, []);
  useEffect(() => {
    const [top, horizon] = (SKY[mode] ?? SKY.day).map((c) => new THREE.Color(c));
    const pos = geometry.attributes.position;
    const col = geometry.attributes.color;
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const f = THREE.MathUtils.clamp(pos.getY(i) / 200, 0, 1) ** 0.6;
      c.copy(horizon).lerp(top, f);
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  }, [geometry, mode]);
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}

const OFFSHORE_TURBINES = [
  [985, 430],
  [1012, 470],
  [1040, 512],
];

// ─── ground ───────────────────────────────────────────────────────

function Districts({ focusKingdom, palette }) {
  const shapes = useMemo(
    () => KINGDOMS.map((k) => ({ k, shape: shapeFromPlan(insetPoints(parsePath(k.path), 0.97)) })),
    [],
  );
  const [mixColor, mixAmount] = palette.districtMix;
  return shapes.map(({ k, shape }) => (
    <mesh key={k.key} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <extrudeGeometry args={[shape, { depth: GROUND_Y, bevelEnabled: false }]} />
      <meshStandardMaterial
        color={new THREE.Color(k.color).lerp(new THREE.Color(mixColor), mixAmount)}
        transparent
        opacity={focusKingdom && focusKingdom !== k.key ? 0.55 : 1}
        roughness={0.95}
      />
    </mesh>
  ));
}

function Sea({ color }) {
  const shape = useMemo(
    () =>
      shapeFromPlan([
        [400, 760],
        [520, 640],
        [560, 600],
        [700, 480],
        [960, 370],
        [1000, 360],
        [1500, 180],
        [1500, 1400],
        [300, 1400],
      ]),
    [],
  );
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = 0.03 + Math.sin(clock.elapsedTime * 0.8) * 0.015;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
    </mesh>
  );
}

// ─── landmarks ────────────────────────────────────────────────────

/** Plaça del Sotabosc: the city's shared screen tower. */
function PlazaTower({ onSelect, lit }) {
  const screens = useRef([]);
  const halo = useRef();
  const colors = useMemo(() => KINGDOMS.map((k) => new THREE.Color(k.color)), []);
  const { x, z, r } = PLAZA_WORLD;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.25;
    const i = Math.floor(t) % colors.length;
    const next = colors[(i + 1) % colors.length];
    screens.current.forEach((m) => m && m.emissive.copy(colors[i]).lerp(next, t % 1));
    if (halo.current) {
      halo.current.rotation.z = clock.elapsedTime * 0.4;
      halo.current.position.y = 6.1 + Math.sin(clock.elapsedTime) * 0.12;
    }
  });
  return (
    <group
      position={[x, 0, z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[r, r, 0.24, 48]} />
        <meshStandardMaterial color="#e2d6b8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <ringGeometry args={[r * 0.55, r * 0.72, 40]} />
        <meshStandardMaterial color="#7cc6cf" emissive="#4ff5ff" emissiveIntensity={lit ? 0.8 : 0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.9, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.55, 5.4, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((side) => {
        const a = (side * Math.PI) / 3 + Math.PI / 6;
        return (
          <mesh key={side} rotation={[0, a, 0]} position={[Math.sin(a) * 0.46, 3.7, Math.cos(a) * 0.46]}>
            <planeGeometry args={[0.44, 2.6]} />
            <meshStandardMaterial
              ref={(m) => {
                screens.current[side] = m;
              }}
              color="#000"
              emissive="#ffe500"
              emissiveIntensity={lit ? 2.6 : 1.6}
              toneMapped={false}
            />
          </mesh>
        );
      })}
      <mesh ref={halo} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.05, 8, 48]} />
        <meshStandardMaterial color="#ffe500" emissive="#ffe500" emissiveIntensity={lit ? 3 : 0.8} toneMapped={false} />
      </mesh>
      <mesh position={[0, 16, 0]} visible={lit}>
        <cylinderGeometry args={[0.25, 0.45, 20, 12, 1, true]} />
        <meshBasicMaterial
          color="#ffe500"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          fog={false}
        />
      </mesh>
    </group>
  );
}

function Arena({ active, onSelect, lit }) {
  const { x, z, r } = ARENA_WORLD;
  const ring = useRef();
  const bowl = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(r * 1.02, 0),
          new THREE.Vector2(r * 1.06, 1.35),
          new THREE.Vector2(r * 0.96, 1.45),
          new THREE.Vector2(r * 0.6, 0.35),
          new THREE.Vector2(r * 0.55, 0.3),
        ],
        56,
      ),
    [r],
  );
  const [sx, sz] = toWorld(820, 432);
  const bridgeLen = Math.hypot(x - sx, z - sz);
  const bridgeAngle = Math.atan2(x - sx, z - sz);
  useFrame(({ clock }) => {
    if (ring.current) ring.current.emissiveIntensity = (lit ? 2.8 : 1.2) + Math.sin(clock.elapsedTime * 3) * 0.5;
  });
  const orange = KINGDOMS_BY_KEY[ARENA.kingdom].color;
  return (
    <group>
      <mesh position={[(x + sx) / 2, 0.12, (z + sz) / 2]} rotation={[0, bridgeAngle, 0]} receiveShadow>
        <boxGeometry args={[0.9, 0.12, bridgeLen]} />
        <meshStandardMaterial color="#d9cfb4" />
      </mesh>
      <group
        position={[x, 0, z]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <cylinderGeometry args={[r * 1.3, r * 1.35, 0.2, 48]} />
          <meshStandardMaterial color="#e6d9b6" />
        </mesh>
        <mesh geometry={bowl} position={[0, 0.2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={active ? '#fff3dc' : '#f1e6cc'} side={THREE.DoubleSide} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[r * 0.56, r * 0.56, 0.04, 40]} />
          <meshStandardMaterial color="#2f6b3c" emissive="#1f7a3a" emissiveIntensity={lit ? 0.6 : 0} />
        </mesh>
        <mesh position={[0, 1.66, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * 1.01, 0.06, 8, 64]} />
          <meshStandardMaterial ref={ring} color={orange} emissive={orange} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
        <mesh position={[0, 2.6, -r * 0.2]}>
          <boxGeometry args={[1.8, 0.9, 0.1]} />
          <meshStandardMaterial color="#111" emissive={orange} emissiveIntensity={lit ? 2.2 : 0.9} toneMapped={false} />
        </mesh>
        {[0, 1, 2, 3].map((i) => {
          const a = Math.PI / 4 + (i * Math.PI) / 2;
          return (
            <group key={i} position={[Math.cos(a) * r * 1.15, 0, Math.sin(a) * r * 1.15]}>
              <mesh position={[0, 1.4, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 2.8, 6]} />
                <meshStandardMaterial color="#2b2b2b" />
              </mesh>
              <mesh position={[0, 2.85, 0]}>
                <boxGeometry args={[0.35, 0.18, 0.35]} />
                <meshStandardMaterial color="#fff" emissive="#fff6d0" emissiveIntensity={lit ? 4 : 0.6} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
      </group>
      <Html position={[x, 3.8, z]} center zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
        <div className="city-3d__label city-3d__label--arena">
          <span>{lit ? 'Open late · online events' : 'Online events'}</span>
          <strong>{ARENA.name}</strong>
        </div>
      </Html>
    </group>
  );
}

function KingdomLabels() {
  return KINGDOMS.map((k) => {
    const [x, z] = districtCentroid(k);
    return (
      <Html key={k.key} position={[x, 4.2, z]} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
        <div className="city-3d__label" style={{ '--k': k.color }}>
          <span>{k.role}</span>
          <strong>{k.name}</strong>
        </div>
      </Html>
    );
  });
}

// ─── collectibles ─────────────────────────────────────────────────

/** Passport collectibles: a faint wireframe while they stir, a lit gem once surfaced. */
function Finds({ finds, onSelect, lit }) {
  const gems = useRef([]);
  useFrame(({ clock }) => {
    gems.current.forEach((gem, i) => {
      if (!gem) return;
      gem.rotation.y = clock.elapsedTime * 1.1 + i;
      gem.position.y = 2.2 + Math.sin(clock.elapsedTime * 1.7 + i * 1.3) * 0.2;
    });
  });
  return finds.map((find, i) => {
    if (find.state === 'hidden') return null;
    const [x, z] = toWorld(find.x, find.y);
    const stirring = find.state === 'stirring';
    const found = find.state === 'collected';
    return (
      <group
        key={find.id}
        position={[x, 0, z]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect({ type: 'find', id: find.id });
        }}
      >
        <mesh
          ref={(m) => {
            gems.current[i] = m;
          }}
          scale={stirring ? 0.75 : 1}
        >
          <octahedronGeometry args={[0.46]} />
          <meshStandardMaterial
            color={found ? '#b9b19a' : '#ffe500'}
            emissive={found ? '#000000' : '#ffe500'}
            emissiveIntensity={stirring ? 0.5 : lit ? 2.4 : 1.2}
            wireframe={stirring}
            toneMapped={false}
          />
        </mesh>
        {find.state === 'surfaced' ? (
          <mesh position={[0, 3.2, 0]}>
            <cylinderGeometry args={[0.05, 0.22, 6, 10, 1, true]} />
            <meshBasicMaterial
              color="#ffe500"
              transparent
              opacity={0.3}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              fog={false}
            />
          </mesh>
        ) : null}
        {/* Generous invisible target so the gem is easy to tap */}
        <mesh position={[0, 2.2, 0]} visible={false}>
          <sphereGeometry args={[0.9, 8, 6]} />
        </mesh>
      </group>
    );
  });
}

// ─── rendering cost ───────────────────────────────────────────────

/**
 * Nothing that casts a shadow moves, so the shadow map is drawn once and kept.
 * It is redrawn for a moment whenever `refreshKey` changes (light mode, selection lift).
 */
function StaticShadows({ refreshKey }) {
  const gl = useThree((state) => state.gl);
  const pending = useRef(60);
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl]);
  useEffect(() => {
    pending.current = Math.max(pending.current, 45);
  }, [refreshKey]);
  useFrame(() => {
    if (pending.current <= 0) return;
    pending.current -= 1;
    gl.shadowMap.needsUpdate = true;
  });
  return null;
}

/** `/?stats` readout: draw calls, triangles and frame rate, written straight to the DOM. */
function StatsReadout() {
  const gl = useThree((state) => state.gl);
  const acc = useRef({ frames: 0, time: 0, calls: 0, tris: 0 });
  useFrame((_, delta) => {
    const a = acc.current;
    a.frames += 1;
    a.time += delta;
    a.calls += gl.info.render.calls;
    a.tris += gl.info.render.triangles;
    if (a.frames < 30) return;
    const el = document.getElementById('city-stats');
    if (el) {
      el.textContent = `${Math.round(a.frames / a.time)} fps · ${Math.round(a.calls / a.frames)} draw calls · ${Math.round(
        a.tris / a.frames / 1000,
      )}k triangles · ×${gl.getPixelRatio()} · shadows ${gl.shadowMap.autoUpdate ? 'every frame' : 'once'}`;
    }
    acc.current = { frames: 0, time: 0, calls: 0, tris: 0 };
  });
  return null;
}

// ─── camera ───────────────────────────────────────────────────────

// Must be a stable reference: R3F re-applies a changed camera prop and resets the view.
const CAMERA = { position: [4, 36, 43], fov: 32, near: 1, far: 700 };
const ORIGIN = [0, 0, 1];
const HOME = new THREE.Spherical().setFromVector3(new THREE.Vector3(4, 36, 43));

/**
 * Orbit camera that can also be flown: a `shot` ({ key, target: [x, z], radius, phi?, theta?, lift?, shift? })
 * glides the camera to a subject, and clearing it glides home. `lift` and `shift` move the subject up and
 * left on screen, out from under the panel that opens beside or below it. Any drag or pinch takes over at once.
 */
function CameraRig({ shot, controlsApi, onUserMove, still }) {
  const controls = useRef();
  const { camera, size } = useThree();
  const goal = useRef(null);
  const fit = useRef(1);
  const arrived = useRef(false);
  const hadShot = useRef(false);
  const tmp = useMemo(() => ({ offset: new THREE.Vector3(), sph: new THREE.Spherical(), aim: new THREE.Vector3() }), []);

  // Narrow viewports need more distance to fit the whole city.
  useEffect(() => {
    if (!size.width || !size.height) return;
    const aspect = size.width / size.height;
    fit.current = Math.min(2, aspect < 1.56 ? 1.56 / aspect : 1);
    const c = controls.current;
    if (!c) return;
    if (!arrived.current) {
      arrived.current = true;
      // Arrive from high and wide, then settle over the city.
      const start = new THREE.Vector3()
        .setFromSpherical(
          new THREE.Spherical(HOME.radius * fit.current * (still ? 1 : 1.85), still ? HOME.phi : 0.5, HOME.theta - (still ? 0 : 1.1)),
        )
        .add(c.target);
      camera.position.copy(start);
      c.update();
      if (!still) {
        goal.current = { subject: c.target.clone(), radius: HOME.radius * fit.current, phi: HOME.phi, theta: HOME.theta, lift: 0, ttl: 5 };
      }
    } else if (!hadShot.current) {
      goal.current = { subject: new THREE.Vector3(...ORIGIN), radius: HOME.radius * fit.current, lift: 0, ttl: 2 };
    }
  }, [camera, size.width, size.height, still]);

  const shotKey = shot?.key ?? '';
  useEffect(() => {
    if (shot) {
      goal.current = {
        subject: new THREE.Vector3(shot.target[0], 0, shot.target[1]),
        radius: shot.radius * Math.min(fit.current, 1.4),
        phi: shot.phi,
        theta: shot.theta,
        lift: shot.lift ?? 0,
        shift: shot.shift ?? 0,
        ttl: 3.2,
      };
    } else if (hadShot.current) {
      goal.current = { subject: new THREE.Vector3(...ORIGIN), radius: HOME.radius * fit.current, phi: HOME.phi, lift: 0, ttl: 3.2 };
    }
    hadShot.current = Boolean(shot);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a shot is identified by its key
  }, [shotKey]);

  useEffect(() => {
    controlsApi.current = {
      zoom(direction) {
        const c = controls.current;
        if (!c) return;
        goal.current = null;
        const offset = camera.position.clone().sub(c.target);
        const next = THREE.MathUtils.clamp(offset.length() * (direction > 0 ? 0.8 : 1.25), 10, 130);
        camera.position.copy(c.target).add(offset.setLength(next));
        c.update();
      },
    };
  }, [camera, controlsApi]);

  useEffect(() => {
    const el = controls.current?.domElement;
    // The homepage does not scroll, so the city takes every gesture.
    if (el) el.style.touchAction = 'none';
  });

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;
    const g = goal.current;
    if (g) {
      const { offset, sph, aim } = tmp;
      const k = still ? 1 : 1 - Math.exp(-delta * 2.4);
      sph.setFromVector3(offset.copy(camera.position).sub(c.target));
      sph.radius += (g.radius - sph.radius) * k;
      if (g.phi != null) sph.phi += (g.phi - sph.phi) * k;
      if (g.theta != null) {
        const turn = g.theta - sph.theta;
        sph.theta += Math.atan2(Math.sin(turn), Math.cos(turn)) * k;
      }
      // Aim a little in front of, or beside, the subject so it sits clear of the open panel.
      aim
        .set(
          Math.sin(sph.theta) * g.lift + Math.cos(sph.theta) * (g.shift ?? 0),
          0,
          Math.cos(sph.theta) * g.lift - Math.sin(sph.theta) * (g.shift ?? 0),
        )
        .multiplyScalar(sph.radius)
        .add(g.subject);
      c.target.lerp(aim, k);
      camera.position.setFromSpherical(sph).add(c.target);
      g.ttl -= delta;
      if (g.ttl <= 0) goal.current = null;
    }
    c.target.x = THREE.MathUtils.clamp(c.target.x, -24, 26);
    c.target.z = THREE.MathUtils.clamp(c.target.z, -15, 16);
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      enableZoom
      zoomSpeed={0.7}
      minDistance={9}
      maxDistance={130}
      screenSpacePanning={false}
      minPolarAngle={0.4}
      maxPolarAngle={1.25}
      autoRotate={!shot && !still}
      autoRotateSpeed={0.22}
      target={ORIGIN}
      onStart={() => {
        goal.current = null;
        onUserMove?.();
      }}
    />
  );
}

const citizenHeight = (ki, pi) => 2.6 + ((ki * 5 + pi * 7) % 9) * 0.2;

/**
 * Stylised 3D Sotabosc. Client-only — lazy-loaded by `CityStage`.
 *
 * @param {{
 *   citizens: any[];
 *   plotMap: Map<string, any>;
 *   selection: any;
 *   onSelect: (selection: any) => void;
 *   mode: 'day' | 'dusk' | 'night';
 *   raining?: boolean;
 *   running: boolean;
 *   controlsApi: { current: null | { zoom: (direction: number) => void } };
 *   shot?: null | { key: string; target: [number, number]; radius: number; phi?: number; theta?: number; lift?: number; shift?: number };
 *   focusKingdom?: string | null;
 *   finds?: Array<{ id: string; x: number; y: number; state: string }>;
 *   onUserMove?: () => void;
 *   still?: boolean;
 *   stats?: null | string;
 * }} props
 */
export default function CityScene3D({
  citizens,
  plotMap,
  selection,
  onSelect,
  mode,
  raining,
  running,
  controlsApi,
  shot = null,
  focusKingdom = null,
  finds = [],
  onUserMove,
  still = false,
  stats = null,
}) {
  // Start sharp where the device can afford it; step down if frames start dropping.
  const [dprMax] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 1.5 : 1.75,
  );
  const [dpr, setDpr] = useState(dprMax);
  const textures = useMemo(() => ({ ...makeWindowTextures(), bcn: makeBarcelonaTextures() }), []);
  const filler = useMemo(() => generateFiller(), []);
  const streets = useMemo(() => buildStreets(), []);
  const palette = PALETTE[mode] ?? PALETTE.day;
  const lit = mode !== 'day';
  const dark = mode === 'night';

  const chimneys = useMemo(() => {
    const out = [];
    KINGDOMS_BY_KEY.earth.plots.forEach(([px, py], pi) => {
      if (!plotMap.get(`earth:${pi}`)) return;
      const [x, z] = toWorld(px, py);
      const [ox, oy, oz] = chimneyOffset('earth', citizenHeight(0, pi));
      out.push([x + ox, GROUND_Y + oy, z + oz]);
    });
    filler.blocks
      .filter((b) => b.kingdom === 'earth')
      .filter((_, i) => i % 4 === 0)
      .forEach((b) => out.push([b.x, GROUND_Y + b.h + 0.55, b.z]));
    return out;
  }, [plotMap, filler]);

  const selectedCitizen =
    selection?.type === 'citizen' ? citizens.find((c) => c.slug === selection.slug) : null;

  return (
    <Canvas
      shadows
      dpr={dpr}
      frameloop={running ? 'always' : 'never'}
      camera={CAMERA}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => onSelect(null)}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(dprMax)}
        onFallback={() => setDpr(1)}
      />
      {stats === 'live-shadows' ? null : (
        <StaticShadows refreshKey={`${mode}:${selection ? JSON.stringify(selection) : ''}`} />
      )}
      {stats != null ? <StatsReadout /> : null}
      <color attach="background" args={[SKY[mode]?.[1] ?? palette.sky]} />
      <fog attach="fog" args={[SKY[mode]?.[1] ?? palette.sky, ...palette.fog]} />
      <SkyDome mode={mode} />
      <hemisphereLight args={[palette.hemiSky, palette.hemiGround, palette.hemi]} />
      <directionalLight
        position={palette.sunPosition}
        intensity={palette.sunIntensity}
        color={palette.sun}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-bias={-0.0005}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color={palette.ground} roughness={1} />
      </mesh>
      <Sea color={palette.sea} />
      <Districts focusKingdom={focusKingdom} palette={palette} />
      <FillerCity blocks={filler.blocks} textures={textures} night={lit} />
      <Trees trees={filler.trees} night={dark} />
      <PlazaTower onSelect={() => onSelect(null)} lit={lit} />
      <ParkGuellBench bcn={textures.bcn} />
      <SagradaFamilia bcn={textures.bcn} lit={lit} />
      <TorreGlories bcn={textures.bcn} lit={lit} />
      <DaliMuseum lit={lit} />
      <MagicFountain lit={lit} />
      <ColomColumn lit={lit} />
      <HotelSail windows={textures} lit={lit} />
      <Arena active={selection?.type === 'arena'} onSelect={() => onSelect({ type: 'arena' })} lit={lit} />
      {OFFSHORE_TURBINES.map(([px, py]) => {
        const [x, z] = toWorld(px, py);
        return <Turbine key={px} position={[x, 0, z]} scale={1.7} speed={1.4} />;
      })}

      {KINGDOMS.map((k, ki) => {
        const openCount = k.plots.filter((_, pi) => !plotMap.get(`${k.key}:${pi}`)).length;
        return k.plots.map(([px, py], pi) => {
          const position = toWorld(px, py);
          const citizen = plotMap.get(`${k.key}:${pi}`);
          if (citizen) {
            return (
              <CitizenBuilding
                key={citizen.slug}
                citizen={citizen}
                kingdom={k}
                position={position}
                height={citizenHeight(ki, pi)}
                active={selectedCitizen?.slug === citizen.slug}
                happening={Boolean(citizen.happening)}
                onSelect={() => onSelect({ type: 'citizen', slug: citizen.slug })}
                textures={textures}
                night={lit}
              />
            );
          }
          return (
            <VacantPlot
              key={`vacant-${k.key}-${px}-${py}`}
              kingdom={k}
              position={position}
              night={lit}
              active={selection?.type === 'vacant' && selection.kingdom === k.key && selection.plot === pi}
              onSelect={() => onSelect({ type: 'vacant', kingdom: k.key, plot: pi, openCount })}
            />
          );
        });
      })}

      <Walkers streets={streets} lit={lit} />
      <Promenade streets={streets} lit={lit} />
      <Boats lit={lit} />
      <Birds visible={!dark && !raining} />
      <StreetLamps streets={streets} lit={lit} />
      <ChimneySmoke sources={chimneys} dark={dark} />
      <Mycelium lit={lit} />
      <SymbiosisFlow lit={lit} />
      <ArenaShow lit={lit} dark={dark} />
      <Fireflies visible={lit} />
      <Plankton visible={dark} />
      <Stars visible={dark} />
      {raining ? <Rain /> : null}

      <Finds finds={finds} onSelect={onSelect} lit={lit} />
      <KingdomLabels />
      <CameraRig shot={shot} controlsApi={controlsApi} onUserMove={onUserMove} still={still} />
    </Canvas>
  );
}
/* eslint-enable react/no-unknown-property */
