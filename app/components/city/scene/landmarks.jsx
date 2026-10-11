/* eslint-disable react/no-unknown-property -- three.js JSX props (args, castShadow, …) */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GROUND_Y, PLAZA_WORLD, landmarkWorld, makeGlowTexture } from './geometry';

const SPIRE_PROFILE = [
  [0.5, 0],
  [0.48, 0.35],
  [0.42, 0.6],
  [0.33, 0.78],
  [0.22, 0.9],
  [0.1, 0.97],
  [0.02, 1],
].map(([r, y]) => new THREE.Vector2(r, y));

// [x, z, height, radius] — Nativity and Passion facades, the four Evangelists, Mary and Jesus.
const SAGRADA_TOWERS = [
  [-1.05, 0.95, 5.2, 0.46],
  [-0.38, 0.95, 6.0, 0.5],
  [0.38, 0.95, 6.0, 0.5],
  [1.05, 0.95, 5.2, 0.46],
  [-1.05, -0.95, 5.0, 0.46],
  [-0.38, -0.95, 5.8, 0.5],
  [0.38, -0.95, 5.8, 0.5],
  [1.05, -0.95, 5.0, 0.46],
  [-0.62, 0.3, 7.2, 0.52],
  [0.62, 0.3, 7.2, 0.52],
  [-0.62, -0.35, 7.2, 0.52],
  [0.62, -0.35, 7.2, 0.52],
  [0, -0.55, 7.8, 0.56],
  [0, 0.05, 9.4, 0.74],
];
const FINIAL_COLORS = ['#e4572e', '#f2c14e', '#2f6fb5', '#6bbf59', '#f7a8c4', '#ffffff'];

function TowerCrane({ position, height, lit }) {
  const jib = useRef();
  const beacon = useRef();
  useFrame(({ clock }) => {
    if (jib.current) jib.current.rotation.y = Math.sin(clock.elapsedTime * 0.12) * 1.3 + 0.6;
    if (beacon.current) beacon.current.emissiveIntensity = lit ? (Math.sin(clock.elapsedTime * 3) > 0 ? 4 : 0.3) : 0;
  });
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[0.14, height, 0.14]} />
        <meshStandardMaterial color="#f2c230" roughness={0.6} />
      </mesh>
      <group ref={jib} position={[0, height, 0]}>
        <mesh position={[1.9, 0, 0]}>
          <boxGeometry args={[4.6, 0.1, 0.1]} />
          <meshStandardMaterial color="#f2c230" />
        </mesh>
        <mesh position={[-0.9, -0.1, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.3]} />
          <meshStandardMaterial color="#6b6b6b" />
        </mesh>
        <mesh position={[3.1, -1.4, 0]}>
          <boxGeometry args={[0.015, 2.8, 0.015]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[3.1, -2.85, 0]}>
          <boxGeometry args={[0.3, 0.14, 0.3]} />
          <meshStandardMaterial color="#d4bd93" />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <meshStandardMaterial ref={beacon} color="#ff3b30" emissive="#ff3b30" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Gaudí's basilica — still under construction, like the city. */
export function SagradaFamilia({ bcn, lit }) {
  const [x, z] = landmarkWorld('sagrada');
  const spire = useMemo(() => new THREE.LatheGeometry(SPIRE_PROFILE, 16), []);
  const glow = lit ? 0.85 : 0;
  const stone = {
    map: bcn.spire.map,
    emissiveMap: bcn.spire.emissiveMap,
    emissive: '#ffffff',
    emissiveIntensity: glow,
    color: '#e7d2aa',
    roughness: 0.9,
  };
  return (
    <group position={[x, GROUND_Y, z]} rotation={[0, 0.25, 0]}>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 2.2, 1.5]} />
        <meshStandardMaterial {...stone} />
      </mesh>
      <mesh position={[0, 2.2, 0]} scale={[3.0, 0.8, 1.5]} castShadow>
        <coneGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color="#cdb68d" roughness={0.9} />
      </mesh>
      {SAGRADA_TOWERS.map(([tx, tz, h, r], i) => (
        <group key={`${tx}${tz}`} position={[tx, 0, tz]}>
          <mesh geometry={spire} scale={[r * 2, h, r * 2]} castShadow>
            <meshStandardMaterial {...stone} />
          </mesh>
          <mesh position={[0, h + 0.1, 0]} castShadow>
            <icosahedronGeometry args={[0.13 + r * 0.1, 0]} />
            <meshStandardMaterial
              map={bcn.mosaic}
              color={FINIAL_COLORS[i % FINIAL_COLORS.length]}
              emissive={FINIAL_COLORS[i % FINIAL_COLORS.length]}
              emissiveIntensity={lit ? 0.6 : 0}
              flatShading
            />
          </mesh>
        </group>
      ))}
      {/* Mary's star and the cross of Jesus light up at night, as they do on the real towers. */}
      <mesh position={[0, 8.05, -0.55]}>
        <octahedronGeometry args={[0.22]} />
        <meshStandardMaterial color="#ffffff" emissive="#dff1ff" emissiveIntensity={lit ? 5 : 0.4} toneMapped={false} />
      </mesh>
      <group position={[0, 9.75, 0.05]}>
        {[
          [0.08, 0.6, 0.08],
          [0.44, 0.08, 0.08],
          [0.08, 0.08, 0.44],
        ].map((args) => (
          <mesh key={args.join()}>
            <boxGeometry args={args} />
            <meshStandardMaterial color="#ffffff" emissive="#fff4d6" emissiveIntensity={lit ? 4 : 0.3} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <TowerCrane position={[1.95, 0, -1.25]} height={10.6} lit={lit} />
    </group>
  );
}

const GLORIES_PROFILE = [
  [1, 0],
  [1, 4.2],
  [0.95, 5.2],
  [0.8, 6.0],
  [0.55, 6.6],
  [0.25, 6.95],
  [0, 7.05],
].map(([r, y]) => new THREE.Vector2(r, y));

/** Torre Glòries: the bullet tower whose LED skin washes through colour every night. */
export function TorreGlories({ bcn, lit }) {
  const [x, z] = landmarkWorld('glories');
  const geometry = useMemo(() => new THREE.LatheGeometry(GLORIES_PROFILE, 32), []);
  const texture = useMemo(() => {
    const t = bcn.led.clone();
    t.needsUpdate = true;
    return t;
  }, [bcn.led]);
  useFrame((_, delta) => {
    texture.offset.y = (texture.offset.y + delta * (lit ? 0.08 : 0.01)) % 1;
  });
  return (
    <group position={[x, GROUND_Y, z]}>
      <mesh geometry={geometry} scale={[0.9, 1, 0.9]} castShadow receiveShadow>
        <meshStandardMaterial
          map={texture}
          color={lit ? '#555' : '#d9d2d6'}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={lit ? 1.5 : 0.04}
          roughness={0.35}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

function makeMeltingClock() {
  const g = new THREE.CircleGeometry(0.5, 28);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const vz = p.getZ(i);
    if (vz > 0.05) {
      const over = vz - 0.05;
      p.setY(i, -over * over * 3.2 - over * 0.4);
      p.setZ(i, 0.05 + over * 0.55);
    }
  }
  g.computeVertexNormals();
  return g;
}

/** Dalí's Theatre-Museum: red walls studded with bread loaves, giant eggs on the parapet, a glass dome. */
export function DaliMuseum({ lit }) {
  const [x, z] = landmarkWorld('dali');
  const clock = useMemo(makeMeltingClock, []);
  const loaves = useRef();
  const W = 2.3;
  const H = 2.3;
  const D = 1.9;
  const loafSpots = useMemo(() => {
    const out = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 6; col++) {
        const u = -W / 2 + 0.2 + col * ((W - 0.4) / 5);
        const y = 0.4 + row * 0.5;
        out.push([u, y, D / 2 + 0.03, 0], [u, y, -D / 2 - 0.03, Math.PI]);
      }
      for (let col = 0; col < 5; col++) {
        const v = -D / 2 + 0.2 + col * ((D - 0.4) / 4);
        const y = 0.4 + row * 0.5;
        out.push([W / 2 + 0.03, y, v, Math.PI / 2], [-W / 2 - 0.03, y, v, -Math.PI / 2]);
      }
    }
    return out;
  }, []);
  const eggs = [
    [-W / 2, -D / 2],
    [W / 2, -D / 2],
    [-W / 2, D / 2],
    [W / 2, D / 2],
    [0, D / 2],
    [0, -D / 2],
  ];
  useEffect(() => {
    const mesh = loaves.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    loafSpots.forEach(([lx, ly, lz, ry], i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry);
      m.compose(new THREE.Vector3(lx, ly, lz), q, new THREE.Vector3(0.12, 0.08, 0.05));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [loafSpots]);
  return (
    <group position={[x, GROUND_Y, z]} rotation={[0, -0.2, 0]}>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#b3322a" roughness={0.8} emissive="#b3322a" emissiveIntensity={lit ? 0.25 : 0} />
      </mesh>
      <instancedMesh ref={loaves} args={[undefined, undefined, loafSpots.length]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#f0c86a" roughness={0.7} />
      </instancedMesh>
      {eggs.map(([ex, ez]) => (
        <mesh key={`${ex}${ez}`} position={[ex, H + 0.36, ez]} scale={[1, 1.35, 1]} castShadow>
          <sphereGeometry args={[0.27, 16, 12]} />
          <meshStandardMaterial color="#fbf4e4" roughness={0.35} emissive="#ffe2a0" emissiveIntensity={lit ? 0.5 : 0} />
        </mesh>
      ))}
      <group position={[-0.25, H, -0.15]}>
        <mesh>
          <icosahedronGeometry args={[0.72, 1]} />
          <meshBasicMaterial color={lit ? '#9fe8ff' : '#6e7f86'} wireframe />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.7, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#bfe4f2"
            transparent
            opacity={0.45}
            metalness={0.6}
            roughness={0.1}
            emissive="#6fd0ff"
            emissiveIntensity={lit ? 0.9 : 0}
          />
        </mesh>
      </group>
      <group position={[0.55, H + 0.02, D / 2 - 0.05]}>
        <mesh geometry={clock} castShadow>
          <meshStandardMaterial color="#e6be55" metalness={0.4} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.02, -0.08]} rotation={[0, 0.6, 0]}>
          <boxGeometry args={[0.03, 0.01, 0.3]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0.08, 0.02, -0.02]} rotation={[0, -0.9, 0]}>
          <boxGeometry args={[0.025, 0.01, 0.2]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>
    </group>
  );
}

const JETS = [[0, 0], ...Array.from({ length: 6 }, (_, i) => [Math.cos((i / 6) * Math.PI * 2) * 0.62, Math.sin((i / 6) * Math.PI * 2) * 0.62])];
const DROPS_PER_JET = 60;

/** Font Màgica: choreographed jets that turn into a colour show after dark. */
export function MagicFountain({ lit }) {
  const [x, z] = landmarkWorld('fountain');
  const points = useRef();
  const sprite = useMemo(makeGlowTexture, []);
  const count = JETS.length * DROPS_PER_JET;
  const { positions, colors, phases } = useMemo(
    () => ({
      positions: new Float32Array(count * 3),
      colors: new Float32Array(count * 3),
      phases: Float32Array.from({ length: count }, (_, i) => (i % DROPS_PER_JET) / DROPS_PER_JET),
    }),
    [count],
  );
  const color = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }) => {
    const geo = points.current?.geometry;
    if (!geo) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const j = Math.floor(i / DROPS_PER_JET);
      const [jx, jz] = JETS[j];
      const height = j === 0 ? 2.4 + Math.sin(t * 0.7) * 0.8 : 1.1 + Math.sin(t * 1.3 + j) * 0.45;
      const f = (t * 0.8 + phases[i]) % 1;
      const spread = j === 0 ? 0.25 : 0.4;
      positions[i * 3] = jx * (1 + f * spread);
      positions[i * 3 + 1] = 0.3 + 4 * height * f * (1 - f);
      positions[i * 3 + 2] = jz * (1 + f * spread);
      if (lit) color.setHSL((t * 0.08 + j * 0.13) % 1, 0.9, 0.6);
      else color.set('#e8f8ff');
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  });
  return (
    <group position={[x, GROUND_Y, z]}>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.15, 1.2, 0.2, 32]} />
        <meshStandardMaterial color="#d8ccb0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.02, 32]} />
        <meshStandardMaterial color={lit ? '#1b4d7a' : '#7cc6cf'} emissive="#3aa0ff" emissiveIntensity={lit ? 0.6 : 0} roughness={0.15} />
      </mesh>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={sprite}
          size={lit ? 0.22 : 0.14}
          vertexColors
          transparent
          opacity={lit ? 0.95 : 0.7}
          depthWrite={false}
          blending={lit ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>
    </group>
  );
}

/** Mirador de Colom: the column at the foot of the Rambla. */
export function ColomColumn({ lit }) {
  const [x, z] = landmarkWorld('colom');
  return (
    <group position={[x, GROUND_Y, z]}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.6, 8]} />
        <meshStandardMaterial color="#cdbf9f" />
      </mesh>
      <mesh position={[0, 2.7, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.13, 4.2, 12]} />
        <meshStandardMaterial color="#b9a887" emissive="#ffd9a0" emissiveIntensity={lit ? 0.35 : 0} />
      </mesh>
      <mesh position={[0, 4.85, 0]}>
        <sphereGeometry args={[0.18, 12, 10]} />
        <meshStandardMaterial color="#c9a54a" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 5.2, 0]} castShadow>
        <capsuleGeometry args={[0.06, 0.28, 4, 8]} />
        <meshStandardMaterial color="#5f4e33" metalness={0.5} />
      </mesh>
      <mesh position={[0.12, 5.34, 0.05]} rotation={[0, 0, -1.1]}>
        <boxGeometry args={[0.03, 0.22, 0.03]} />
        <meshStandardMaterial color="#5f4e33" />
      </mesh>
    </group>
  );
}

function makeSailGeometry() {
  const R = 2.4;
  const spread = 1.1;
  const g = new THREE.CylinderGeometry(R, R, 5.6, 24, 12, true, -spread / 2, spread);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const yn = (y + 2.8) / 5.6;
    const a = Math.atan2(p.getX(i), p.getZ(i)) * (1 - 0.7 * yn ** 1.4);
    p.setXYZ(i, Math.sin(a) * R, y + 2.8, Math.cos(a) * R);
  }
  g.computeVertexNormals();
  return g;
}

/** The W hotel's glass sail on the breakwater. */
export function HotelSail({ windows, lit }) {
  const [x, z] = landmarkWorld('sail');
  const geometry = useMemo(makeSailGeometry, []);
  const facing = Math.atan2(-x, -z);
  const R = 2.4;
  return (
    <group position={[x - Math.sin(facing) * R, 0, z - Math.cos(facing) * R]} rotation={[0, facing, 0]}>
      <mesh position={[0, 0.1, R]} receiveShadow>
        <cylinderGeometry args={[0.9, 1.1, 0.2, 16]} />
        <meshStandardMaterial color="#d9cfb4" />
      </mesh>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          color="#a9cfe0"
          metalness={0.7}
          roughness={0.12}
          emissiveMap={windows.emissiveMap}
          emissive="#ffffff"
          emissiveIntensity={lit ? 1.2 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** Park Güell's serpentine trencadís bench, wrapped around the plaza. */
export function ParkGuellBench({ bcn }) {
  const { x, z, r } = PLAZA_WORLD;
  const { geometry, map } = useMemo(() => {
    const pts = Array.from({ length: 160 }, (_, i) => {
      const a = (i / 160) * Math.PI * 2;
      const rr = r * 0.86 + Math.sin(a * 9) * 0.13;
      return new THREE.Vector3(Math.cos(a) * rr, 0, Math.sin(a) * rr);
    });
    const texture = bcn.mosaic.clone();
    texture.repeat.set(48, 1);
    texture.needsUpdate = true;
    return {
      geometry: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 320, 0.09, 6, true),
      map: texture,
    };
  }, [bcn.mosaic, r]);
  return (
    <mesh geometry={geometry} position={[x, 0.36, z]} scale={[1, 1.4, 1]} castShadow>
      <meshStandardMaterial map={map} roughness={0.35} />
    </mesh>
  );
}
/* eslint-enable react/no-unknown-property */
