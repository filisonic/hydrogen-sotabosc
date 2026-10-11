/* eslint-disable react/no-unknown-property -- three.js JSX props (args, castShadow, …) */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GROUND_Y } from './geometry';

export const WINDOW_GLOW = { day: 0.06, night: 1.7 };

const HEMISPHERE_ARGS = [0.5, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2];
/** Cerdà's Eixample block: a unit square with chamfered corners, centred, height 1. */
function makeChamferGeometry() {
  const c = 0.2;
  const shape = new THREE.Shape();
  [
    [-0.5 + c, -0.5],
    [0.5 - c, -0.5],
    [0.5, -0.5 + c],
    [0.5, 0.5 - c],
    [0.5 - c, 0.5],
    [-0.5 + c, 0.5],
    [-0.5, 0.5 - c],
    [-0.5, -0.5 + c],
  ].forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -0.5, 0);
  return g;
}
const CHAMFER = makeChamferGeometry();

/** La Pedrera's undulating stone skin: a cylinder with rippled radius. */
function makeWavyGeometry() {
  const g = new THREE.CylinderGeometry(1, 1, 1, 48, 12);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const a = Math.atan2(x, z);
    const r = 1 + 0.07 * Math.sin(a * 7 + y * 5) + 0.04 * Math.sin(a * 3);
    p.setXYZ(i, x * r, y, z * r);
  }
  g.computeVertexNormals();
  return g;
}

/** Casa Batlló's dragon-back roof: a half cylinder along x, curved side up. */
function makeRidgeGeometry() {
  const g = new THREE.CylinderGeometry(0.5, 0.5, 1, 14, 1, false, 0, Math.PI);
  g.rotateZ(Math.PI / 2);
  return g;
}

/** Gaudí's four-armed cross, on the Park Güell pavilions and Batlló turret. */
function GaudiCross({ position, scale = 1, night }) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[0.07, 0.3, 0.07]} />
        <meshStandardMaterial color="#f3e6c0" emissive="#ffe7a8" emissiveIntensity={night ? 1.4 : 0} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.3, 0.07, 0.07]} />
        <meshStandardMaterial color="#f3e6c0" emissive="#ffe7a8" emissiveIntensity={night ? 1.4 : 0} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.07, 0.07, 0.3]} />
        <meshStandardMaterial color="#f3e6c0" emissive="#ffe7a8" emissiveIntensity={night ? 1.4 : 0} />
      </mesh>
    </group>
  );
}

function tint(hex, toward, amount) {
  return new THREE.Color(hex).lerp(new THREE.Color(toward), amount);
}

/**
 * Per-kingdom architecture. Each style returns meshes for a building of height `h`
 * and reports where its street screen and (optionally) chimney sit.
 */
const STYLES = {
  // Eixample corner block: Cerdà's chamfered octagon, iron balconies, a mosaic tribune dome on the corner.
  earth: {
    screenY: (h) => h * 0.2,
    screenZ: 0.92,
    screenSize: [0.95, 0.5],
    chimney: (h) => [0.42, h + 0.62, -0.42],
    Body({ h, accent, facade, night, bcn }) {
      const floors = Math.max(3, Math.round(h / 0.6));
      return (
        <>
          <mesh geometry={CHAMFER} position={[0, h / 2, 0]} scale={[1.8, h, 1.8]} castShadow receiveShadow>
            <meshStandardMaterial {...facade} color="#f0d6ae" />
          </mesh>
          {Array.from({ length: floors - 1 }, (_, f) => (
            <mesh key={f} geometry={CHAMFER} position={[0, ((f + 1) * h) / floors, 0]} scale={[1.9, 0.035, 1.9]}>
              <meshStandardMaterial color="#2e2723" metalness={0.4} roughness={0.5} />
            </mesh>
          ))}
          <mesh geometry={CHAMFER} position={[0, h + 0.06, 0]} scale={[1.84, 0.12, 1.84]}>
            <meshStandardMaterial color="#c9774d" roughness={0.85} />
          </mesh>
          <group position={[0.62, h, 0.62]}>
            <mesh position={[0, 0.22, 0]} castShadow>
              <cylinderGeometry args={[0.26, 0.26, 0.44, 12]} />
              <meshStandardMaterial {...facade} color="#f6e4c4" />
            </mesh>
            <mesh position={[0, 0.44, 0]} scale={[0.3, 0.36, 0.3]} castShadow>
              <sphereGeometry args={HEMISPHERE_ARGS} />
              <meshStandardMaterial map={bcn.mosaic} roughness={0.4} />
            </mesh>
          </group>
          <mesh position={[0.42, h + 0.32, -0.42]} castShadow>
            <boxGeometry args={[0.2, 0.6, 0.2]} />
            <meshStandardMaterial color="#8a5a40" />
          </mesh>
          <mesh position={[0, h * 0.2 + 0.4, 1.05]} rotation={[0.35, 0, 0]} castShadow>
            <boxGeometry args={[1.05, 0.05, 0.34]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={night ? 0.5 : 0} />
          </mesh>
        </>
      );
    },
  },

  // Park Güell gatehouse: rubble-stone walls, a rippling trencadís roof and a spire topped by Gaudí's cross.
  plants: {
    screenY: (h) => h * 0.22,
    screenZ: 0.76,
    screenSize: [1.05, 0.52],
    Body({ h, facade, night, bcn }) {
      const wall = h * 0.5;
      return (
        <>
          <mesh position={[0, wall / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.7, wall, 1.5]} />
            <meshStandardMaterial {...facade} color="#dcb98a" />
          </mesh>
          <mesh position={[0, wall, 0]} scale={[1.95, 0.9, 1.75]} castShadow>
            <sphereGeometry args={HEMISPHERE_ARGS} />
            <meshStandardMaterial map={bcn.mosaic} color="#ffe6d6" roughness={0.45} />
          </mesh>
          <mesh position={[-0.45, wall + 0.25, 0.3]} scale={[0.9, 0.7, 0.9]} castShadow>
            <sphereGeometry args={HEMISPHERE_ARGS} />
            <meshStandardMaterial map={bcn.mosaic} color="#d8f0ff" roughness={0.45} />
          </mesh>
          <mesh position={[0.35, wall + h * 0.28, -0.2]} castShadow>
            <cylinderGeometry args={[0.1, 0.2, h * 0.62, 10]} />
            <meshStandardMaterial map={bcn.mosaic} color="#c9dcff" roughness={0.45} />
          </mesh>
          <GaudiCross position={[0.35, wall + h * 0.62, -0.2]} scale={1.3} night={night} />
          {/* Tilted stone colonnade along the side, like the Park Güell viaducts. */}
          {[-0.45, 0, 0.45].map((z) => (
            <mesh key={z} position={[1.02, 0.36, z]} rotation={[0, 0, -0.18]} castShadow>
              <cylinderGeometry args={[0.07, 0.11, 0.72, 7]} />
              <meshStandardMaterial color="#b89a6e" roughness={1} flatShading />
            </mesh>
          ))}
          <mesh position={[1.1, 0.74, 0]} castShadow>
            <boxGeometry args={[0.36, 0.08, 1.3]} />
            <meshStandardMaterial color="#5caa5a" roughness={0.9} />
          </mesh>
          {[-0.4, 0.1, 0.45].map((z, i) => (
            <mesh key={z} position={[1.12, 0.9, z]} castShadow>
              <icosahedronGeometry args={[0.14 + i * 0.03, 0]} />
              <meshStandardMaterial color={i % 2 ? '#3f8f4c' : '#78c16b'} flatShading />
            </mesh>
          ))}
        </>
      );
    },
  },

  // La Pedrera: rippling cream stone, seaweed-iron balconies, and the rooftop "warrior" chimneys.
  fungi: {
    screenY: (h) => h * 0.3,
    screenZ: 0.98,
    screenSize: [0.8, 0.5],
    Body({ h, accent, facade, night, bcn }) {
      const wavy = useMemo(makeWavyGeometry, []);
      const warriors = useMemo(
        () =>
          Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + 0.4;
            return { x: Math.sin(a) * 0.55, z: Math.cos(a) * 0.5, s: 0.8 + (i % 3) * 0.2, mosaic: i % 2 === 0 };
          }),
        [],
      );
      return (
        <>
          <mesh geometry={wavy} position={[0, h / 2, 0]} scale={[0.95, h, 0.9]} castShadow receiveShadow>
            <meshStandardMaterial {...facade} color="#f1e6dc" />
          </mesh>
          {[0.3, 0.52, 0.74].map((f) => (
            <mesh key={f} geometry={wavy} position={[0, h * f, 0]} scale={[1.0, 0.045, 0.95]}>
              <meshStandardMaterial color="#3a3833" metalness={0.5} roughness={0.5} />
            </mesh>
          ))}
          <mesh geometry={wavy} position={[0, h + 0.08, 0]} scale={[0.98, 0.16, 0.93]} castShadow>
            <meshStandardMaterial color="#e7d8c6" roughness={0.9} />
          </mesh>
          {warriors.map((w) => (
            <group key={w.x} position={[w.x, h + 0.16, w.z]} scale={w.s}>
              <mesh position={[0, 0.16, 0]} rotation={[0, w.x * 3, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.12, 0.32, 5]} />
                <meshStandardMaterial color="#e9dccb" flatShading />
              </mesh>
              <mesh position={[0, 0.42, 0]} rotation={[0, w.z * 4, 0]} castShadow>
                <coneGeometry args={[0.13, 0.26, 5]} />
                <meshStandardMaterial
                  map={w.mosaic ? bcn.mosaic : null}
                  color={w.mosaic ? '#ffffff' : tint(accent, '#ffffff', 0.5)}
                  emissive={accent}
                  emissiveIntensity={night ? 0.9 : 0}
                  flatShading
                />
              </mesh>
            </group>
          ))}
        </>
      );
    },
  },

  animals: {
    screenY: (h) => h * 0.36,
    screenZ: 0.72,
    screenSize: [1.2, 0.5],
    // Casa Batlló: shimmering blue-green trencadís facade, bone columns, a dragon-back roof and a bulb turret.
    Body({ h, accent, facade, night, bcn }) {
      const ridge = useMemo(makeRidgeGeometry, []);
      const spine = useMemo(() => Array.from({ length: 7 }, (_, i) => -0.75 + i * 0.25), []);
      return (
        <>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.7, h, 1.4]} />
            <meshStandardMaterial
              map={bcn.batllo.map}
              emissiveMap={bcn.batllo.emissiveMap}
              emissive="#ffffff"
              emissiveIntensity={facade.emissiveIntensity}
              roughness={0.35}
              metalness={0.15}
            />
          </mesh>
          {[-0.6, -0.2, 0.2, 0.6].map((x) => (
            <mesh key={x} position={[x, h * 0.12, 0.74]} castShadow>
              <cylinderGeometry args={[0.07, 0.1, h * 0.24, 8]} />
              <meshStandardMaterial color="#efe6d2" roughness={0.6} />
            </mesh>
          ))}
          <mesh geometry={ridge} position={[0, h, 0]} scale={[1.8, 1.1, 1.45]} castShadow>
            <meshStandardMaterial
              map={bcn.mosaic}
              color={tint(accent, '#9fe0c0', 0.55)}
              emissive={accent}
              emissiveIntensity={night ? 0.45 : 0}
              roughness={0.3}
              metalness={0.25}
            />
          </mesh>
          {spine.map((x) => (
            <mesh key={x} position={[x, h + 0.56, 0]}>
              <sphereGeometry args={[0.07, 8, 6]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={night ? 3 : 0.5} toneMapped={false} />
            </mesh>
          ))}
          <group position={[-0.62, h, 0.5]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.13, 0.9, 10]} />
              <meshStandardMaterial color="#efe6d2" />
            </mesh>
            <mesh position={[0, 0.96, 0]} scale={[1, 1.3, 1]}>
              <sphereGeometry args={[0.14, 12, 10]} />
              <meshStandardMaterial map={bcn.mosaic} color="#ffe39a" />
            </mesh>
            <GaudiCross position={[0, 1.25, 0]} night={night} />
          </group>
        </>
      );
    },
  },

  algae: {
    screenY: (h) => h * 0.3,
    screenZ: 0.84,
    screenSize: [0.95, 0.56],
    // Waterfront tower: white wave balconies, a sea-glass trencadís crown and its own turbine.
    Body({ h, accent, facade, bcn }) {
      return (
        <>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.78, 0.82, h, 22]} />
            <meshStandardMaterial {...facade} color="#e2f6f4" metalness={0.1} roughness={0.5} />
          </mesh>
          {[0.45, 0.68, 0.9].map((f, i) => (
            <mesh key={f} position={[0, h * f, 0]} rotation={[0, i * 0.6, 0]} castShadow>
              <cylinderGeometry args={[1.02 - i * 0.04, 1.02 - i * 0.04, 0.07, 22, 1, false, 0, Math.PI * 1.4]} />
              <meshStandardMaterial color={tint(accent, '#ffffff', 0.35)} />
            </mesh>
          ))}
          <mesh position={[0, h, 0]} scale={[1.6, 0.9, 1.6]} castShadow>
            <sphereGeometry args={HEMISPHERE_ARGS} />
            <meshStandardMaterial map={bcn.mosaic} color="#bdf0ee" roughness={0.35} />
          </mesh>
          <Turbine position={[0, h + 0.3, 0]} scale={0.8} />
        </>
      );
    },
  },
};

export function Turbine({ position, scale = 1, speed = 2.2 }) {
  const rotor = useRef();
  useFrame((_, delta) => {
    if (rotor.current) rotor.current.rotation.z += delta * speed;
  });
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 1.8, 6]} />
        <meshStandardMaterial color="#f4f4f0" />
      </mesh>
      <group ref={rotor} position={[0, 1.8, 0.1]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]} position={[0, 0, 0]}>
            <boxGeometry args={[0.07, 1.4, 0.02]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.14, 8]} />
          <meshStandardMaterial color="#dcdcd4" />
        </mesh>
      </group>
    </group>
  );
}

export function chimneyOffset(kingdomKey, h) {
  return STYLES[kingdomKey]?.chimney?.(h) ?? null;
}

function useHoverCursor() {
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!hovered) return undefined;
    document.body.style.cursor = 'pointer';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);
  return [hovered, setHovered];
}

export function CitizenBuilding({ citizen, kingdom, position, height, active, onSelect, textures, night, happening = false }) {
  const group = useRef();
  const screen = useRef();
  const [hovered, setHovered] = useHoverCursor();
  const style = STYLES[kingdom.key] ?? STYLES.animals;
  const accent = kingdom.color;
  const facade = {
    map: textures.map,
    emissiveMap: textures.emissiveMap,
    emissive: '#ffffff',
    emissiveIntensity: night ? WINDOW_GLOW.night : WINDOW_GLOW.day,
    roughness: 0.8,
  };
  const screenColors = useMemo(() => [new THREE.Color(accent), new THREE.Color('#ffe500'), new THREE.Color('#ffffff')], [accent]);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const lift = hovered || active ? 0.35 : 0;
    group.current.position.y += (lift - group.current.position.y) * Math.min(1, delta * 8);
    if (screen.current) {
      const t = clock.elapsedTime * 0.35 + Math.abs(position[0]);
      const i = Math.floor(t) % screenColors.length;
      screen.current.emissive.copy(screenColors[i]).lerp(screenColors[(i + 1) % screenColors.length], Math.min(1, (t % 1) * 4));
      screen.current.emissiveIntensity = (night ? 2.4 : 1.1) * (happening ? 1.45 : 1);
    }
  });

  const [sw, sh] = style.screenSize;
  return (
    <group position={[position[0], GROUND_Y, position[1]]}>
      <group
        ref={group}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <style.Body h={height} accent={accent} facade={facade} night={night} bcn={textures.bcn} />
        <mesh position={[0, style.screenY(height), style.screenZ]}>
          <planeGeometry args={[sw, sh]} />
          <meshStandardMaterial ref={screen} color="#0b0b0b" emissive={accent} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>
      {/* Ground ring: thin when something is on here this week, bold while the building is selected. */}
      {happening || active ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={active ? [1.3, 1.75, 40] : [1.15, 1.35, 32]} />
          <meshBasicMaterial color="#ffe500" toneMapped={false} />
        </mesh>
      ) : null}
      {hovered ? (
        <Html position={[0, height + 1.8, 0]} center zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
          <div className="city-3d__tip">
            <strong>{citizen.name}</strong>
            <span>{happening ? 'Event this week' : kingdom.name}</span>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export function VacantPlot({ kingdom, position, active, onSelect, night }) {
  const beacon = useRef();
  const [hovered, setHovered] = useHoverCursor();
  useFrame(({ clock }) => {
    if (!beacon.current) return;
    beacon.current.rotation.y = clock.elapsedTime * 0.9;
    beacon.current.position.y = 1.1 + Math.sin(clock.elapsedTime * 1.6 + position[0]) * 0.15;
  });
  return (
    <group
      position={[position[0], GROUND_Y, position[1]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.7, 0.08, 1.7]} />
        <meshStandardMaterial color={kingdom.color} transparent opacity={hovered || active ? 0.8 : 0.4} />
      </mesh>
      {/* Scaffold outline: a plot waiting for its building */}
      {[
        [0.8, 0.8],
        [-0.8, 0.8],
        [0.8, -0.8],
        [-0.8, -0.8],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.55, z]}>
          <boxGeometry args={[0.05, 1.1, 0.05]} />
          <meshStandardMaterial color={kingdom.color} emissive={kingdom.color} emissiveIntensity={night ? 1.4 : 0.2} />
        </mesh>
      ))}
      <mesh ref={beacon}>
        <octahedronGeometry args={[0.28]} />
        <meshStandardMaterial
          color={kingdom.color}
          emissive={kingdom.color}
          emissiveIntensity={hovered || active ? 2.4 : night ? 2 : 0.9}
          toneMapped={false}
        />
      </mesh>
      {hovered ? (
        <Html position={[0, 2, 0]} center zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
          <div className="city-3d__tip">
            <strong>Open plot</strong>
            <span>{kingdom.name}</span>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

// ─── instanced background districts ──────────────────────────────

const FILLER_STYLE = {
  earth: { body: 'chamfer', cap: 'octslab', bodyColor: '#efd2a8', capColor: '#d49270' },
  plants: { body: 'box', cap: 'slab', bodyColor: '#f4f0dc', capColor: '#62ad5c' },
  fungi: { body: 'cylinder', cap: 'dome', bodyColor: '#efe6f6', capColor: '#c9a6f0', glow: true, mosaic: true },
  animals: { body: 'box', facade: 'batllo', cap: 'ridge', bodyColor: '#ffffff', capColor: '#9fdcc0', mosaic: true },
  algae: { body: 'round', cap: 'disc', bodyColor: '#e2f6f4', capColor: '#5cc7cf', solar: true },
};

function capTransform(style, b, m) {
  const top = GROUND_Y + b.h;
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), b.rot);
  switch (style.cap) {
    case 'octslab':
      return m.compose(new THREE.Vector3(b.x, top + 0.06, b.z), q, new THREE.Vector3(b.w * 1.04, 0.12, b.d * 1.04));
    case 'ridge':
      return m.compose(new THREE.Vector3(b.x, top, b.z), q, new THREE.Vector3(b.w, 0.8 + b.tint * 0.4, b.d));
    case 'slab':
      return m.compose(new THREE.Vector3(b.x, top + 0.07, b.z), q, new THREE.Vector3(b.w + 0.08, 0.14, b.d + 0.08));
    case 'dome':
      return m.compose(new THREE.Vector3(b.x, top, b.z), q, new THREE.Vector3(b.w * 1.9, 0.9 + b.tint * 0.5, b.d * 1.9));
    case 'twist': {
      const tq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), b.rot + 0.5);
      return m.compose(new THREE.Vector3(b.x, top + 0.2, b.z), tq, new THREE.Vector3(b.w * 0.72, 0.4, b.d * 0.72));
    }
    default:
      return m.compose(new THREE.Vector3(b.x, top + 0.03, b.z), q, new THREE.Vector3(b.w * 1.25, 0.06, b.d * 1.25));
  }
}

function FillerDistrict({ kingdomKey, blocks, textures, night }) {
  const style = FILLER_STYLE[kingdomKey];
  const bodies = useRef();
  const caps = useRef();
  const panels = useRef();
  const ridge = useMemo(makeRidgeGeometry, []);
  const solarBlocks = useMemo(() => (style.solar ? blocks.filter((b) => b.solar) : []), [blocks, style.solar]);

  useEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    const light = new THREE.Color('#ffffff');
    blocks.forEach((b, i) => {
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), b.rot);
      m.compose(new THREE.Vector3(b.x, GROUND_Y + b.h / 2, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
      bodies.current.setMatrixAt(i, m);
      bodies.current.setColorAt(i, c.set(style.bodyColor).lerp(light, b.tint * 0.4));
      caps.current.setMatrixAt(i, capTransform(style, b, m));
      caps.current.setColorAt(i, c.set(style.capColor).lerp(light, style.mosaic ? 0.4 + b.tint * 0.4 : b.tint * 0.35));
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    caps.current.instanceMatrix.needsUpdate = true;
    if (bodies.current.instanceColor) bodies.current.instanceColor.needsUpdate = true;
    if (caps.current.instanceColor) caps.current.instanceColor.needsUpdate = true;

    if (panels.current) {
      solarBlocks.forEach((b, i) => {
        const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.45, b.rot, 0, 'YXZ'));
        const y = GROUND_Y + b.h + 0.14;
        const offset = new THREE.Vector3(-b.w * 0.18, 0, 0).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          b.rot,
        );
        m.compose(new THREE.Vector3(b.x + offset.x, y, b.z + offset.z), tilt, new THREE.Vector3(b.w * 0.42, 0.03, b.d * 0.7));
        panels.current.setMatrixAt(i, m);
      });
      panels.current.instanceMatrix.needsUpdate = true;
    }
  }, [blocks, solarBlocks, style]);

  let bodyGeometry;
  if (style.body === 'cylinder') bodyGeometry = <cylinderGeometry args={[0.42, 0.5, 1, 10]} />;
  else if (style.body === 'round') bodyGeometry = <cylinderGeometry args={[0.5, 0.5, 1, 14]} />;
  else if (style.body !== 'chamfer') bodyGeometry = <boxGeometry />;
  const facade = style.facade === 'batllo' ? textures.bcn.batllo : textures;

  let capGeometry = null;
  if (style.cap === 'dome') capGeometry = <sphereGeometry args={HEMISPHERE_ARGS} />;
  else if (style.cap === 'twist') capGeometry = <boxGeometry />;
  else if (style.cap === 'disc') capGeometry = <cylinderGeometry args={[0.5, 0.5, 1, 16]} />;
  else if (style.cap === 'slab') capGeometry = <boxGeometry />;

  return (
    <>
      <instancedMesh
        ref={bodies}
        args={[style.body === 'chamfer' ? CHAMFER : undefined, undefined, blocks.length]}
        castShadow
        receiveShadow
      >
        {bodyGeometry}
        <meshStandardMaterial
          map={facade.map}
          emissiveMap={facade.emissiveMap}
          emissive="#ffffff"
          emissiveIntensity={night ? WINDOW_GLOW.night : WINDOW_GLOW.day}
          roughness={style.facade ? 0.4 : 0.85}
        />
      </instancedMesh>
      <instancedMesh
        ref={caps}
        args={[style.cap === 'ridge' ? ridge : style.cap === 'octslab' ? CHAMFER : undefined, undefined, blocks.length]}
        castShadow
      >
        {capGeometry}
        <meshStandardMaterial
          map={style.mosaic ? textures.bcn.mosaic : null}
          roughness={style.mosaic ? 0.4 : 0.7}
          emissive={style.glow ? style.capColor : '#000000'}
          emissiveIntensity={style.glow && night ? 0.55 : 0}
        />
      </instancedMesh>
      {solarBlocks.length ? (
        <instancedMesh ref={panels} args={[undefined, undefined, solarBlocks.length]}>
          <boxGeometry />
          <meshStandardMaterial color="#2a4585" metalness={0.65} roughness={0.28} />
        </instancedMesh>
      ) : null}
    </>
  );
}

export function FillerCity({ blocks, textures, night }) {
  const byKingdom = useMemo(() => {
    const groups = {};
    for (const b of blocks) (groups[b.kingdom] ??= []).push(b);
    return groups;
  }, [blocks]);
  return Object.entries(byKingdom).map(([key, list]) => (
    <FillerDistrict key={key} kingdomKey={key} blocks={list} textures={textures} night={night} />
  ));
}

export function Trees({ trees, night }) {
  const ref = useRef();
  useEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    trees.forEach((t, i) => {
      m.compose(new THREE.Vector3(t.x, t.y + 0.55 * t.s, t.z), new THREE.Quaternion(), new THREE.Vector3(t.s, t.s, t.s));
      ref.current.setMatrixAt(i, m);
      ref.current.setColorAt(i, c.set(t.shade > 0.66 ? '#3f8f4c' : t.shade > 0.33 ? '#5fae5f' : '#86c46e'));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [trees]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, trees.length]} castShadow>
      <coneGeometry args={[0.45, 1.1, 7]} />
      <meshStandardMaterial roughness={0.9} flatShading color={night ? '#b7c7c0' : '#ffffff'} />
    </instancedMesh>
  );
}
/* eslint-enable react/no-unknown-property */
