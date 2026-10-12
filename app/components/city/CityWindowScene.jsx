import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor, Splat } from '@react-three/drei';
import { Vector3 } from 'three';
import { windowFrustum } from '~/lib/city/window/offAxis';

/** World units are screen widths, so the glass is always 1 wide and sits at z = 0. */
const FAR = 200;
/** The near plane sits this far in front of the glass, so nothing floats between it and the viewer. */
const GLASS_MARGIN = 0.02;
/** How quickly the camera catches up with the tracked head; lower is smoother but laggier. */
const FOLLOW_PER_SECOND = 7;

/** How much the scan is shrunk so its cross-section covers a screen of this shape (see `FittedRoom`). */
function roomScale(scene, { width, height }) {
  return Math.max(1 / scene.frame.width, height / width / scene.frame.height);
}

/**
 * Keeps the camera at the viewer's eye and skews its frustum through the screen edges.
 * `eyeRef.current` is the eye in centimetres; `screenRef.current` the stage size in centimetres.
 *
 * It also places the page's lettering (`depthRef`) `textDepth` screen widths behind the
 * glass: 0 is a decal on the glass itself, which never moves; anything deeper drifts with
 * the room. A flat layer parallel to the screen needs no 3D: seen from the eye it is the
 * same layer, shrunk towards the point of the glass straight in front of the eye.
 */
function WindowCamera({ scene, eyeRef, screenRef, depthRef }) {
  const camera = useThree((state) => state.camera);

  useFrame((_, delta) => {
    const { width, height } = screenRef.current;
    if (!width || !height) return;
    const target = eyeRef.current;
    const ease = 1 - Math.exp(-FOLLOW_PER_SECOND * delta);
    camera.position.x += (target.x / width - camera.position.x) * ease;
    camera.position.y += (target.y / width - camera.position.y) * ease;
    camera.position.z += (target.z / width - camera.position.z) * ease;

    const near = Math.max(camera.position.z - GLASS_MARGIN, 0.01);
    const f = windowFrustum(camera.position, 1, height / width, near);
    camera.projectionMatrix.makePerspective(f.left, f.right, f.top, f.bottom, near, FAR);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

    const layer = depthRef.current;
    if (layer) {
      const shrink = camera.position.z / (camera.position.z + scene.textDepth);
      const slide = (1 - shrink) * layer.offsetWidth;
      layer.style.transform = `translate(${camera.position.x * slide}px, ${-camera.position.y * slide}px) scale(${shrink})`;
    }
  });

  return null;
}

/**
 * Fits the scanned room to the screen the way `background-size: cover` fits a picture:
 * the room's cross-section is scaled until it fills the glass, so its walls, floor and
 * ceiling start at the screen's own edges (or just outside them on the tighter axis).
 */
function FittedRoom({ scene, screenRef, children }) {
  const group = useRef(null);
  const anchor = useMemo(() => new Vector3(), []);

  useFrame(() => {
    if (!screenRef.current.width || !screenRef.current.height) return;
    const scale = roomScale(scene, screenRef.current);
    anchor.fromArray(scene.anchor).applyEuler(group.current.rotation).multiplyScalar(-scale);
    group.current.position.copy(anchor);
    group.current.scale.setScalar(scale);
  });

  return (
    // eslint-disable-next-line react/no-unknown-property -- three.js JSX prop
    <group ref={group} rotation={scene.rotation}>
      {children}
    </group>
  );
}

/**
 * `?stats` readout: frames drawn and head positions received per second, written straight
 * to the DOM. The two numbers tell a slow renderer apart from a slow tracker.
 */
function StatsReadout({ trackCountRef }) {
  const gl = useThree((state) => state.gl);
  const acc = useRef({ frames: 0, time: 0, tracked: 0 });
  useFrame((_, delta) => {
    const a = acc.current;
    a.frames += 1;
    a.time += delta;
    if (a.time < 1) return;
    const el = document.getElementById('window-stats');
    if (el) {
      const tracked = trackCountRef.current - a.tracked;
      const megapixels = (gl.domElement.width * gl.domElement.height) / 1e6;
      el.textContent = `${Math.round(a.frames / a.time)} fps · ${Math.round(tracked / a.time)} head positions/s · ${megapixels.toFixed(1)} MP`;
    }
    acc.current = { frames: 0, time: 0, tracked: trackCountRef.current };
  });
  return null;
}

/**
 * How many pixels the scene may draw, sharpest first. A splat costs what it covers, so a
 * big or high-density screen is far more work than a laptop panel showing the same page;
 * a budget in pixels keeps the cost level and the browser stretches the picture to fit.
 */
const PIXEL_BUDGETS = [1.6e6, 1e6, 0.6e6];
const DPR_SHARPEST = 1.5;

/**
 * Downloads the scan's parts and joins them into one local file for the splat loader.
 * Joining here also guarantees the loader the exact byte count it needs, which a
 * compressing CDN does not always report.
 *
 * `onProgress` hears how much has arrived, as a fraction from 0 to 1 in whole percents;
 * `null` when the server gives no sizes, and -1 if the download fails.
 */
function useJoinedSplat(parts, onProgress) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let joined;
    let cancelled = false;
    let received = 0;
    let lastReported;
    const sizes = parts.map(() => 0);
    const report = () => {
      if (cancelled) return;
      const total = sizes.reduce((sum, size) => sum + size, 0);
      // Until every part has said how big it is, the total would be an underestimate.
      const fraction = sizes.every(Boolean) ? Math.min(Math.floor((received / total) * 100) / 100, 0.99) : null;
      if (fraction !== lastReported) onProgress((lastReported = fraction));
    };

    Promise.all(
      parts.map(async (part, index) => {
        const response = await fetch(part);
        if (!response.ok || !response.body) throw new Error(`${part} answered ${response.status}`);
        sizes[index] = Number(response.headers.get('Content-Length')) || 0;
        const reader = response.body.getReader();
        const chunks = [];
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.length;
          report();
        }
        return new Blob(chunks);
      }),
    )
      .then((blobs) => {
        if (cancelled) return;
        joined = URL.createObjectURL(new Blob(blobs));
        setUrl(joined);
        onProgress(1);
      })
      .catch((error) => {
        console.error('The scan failed to load', error);
        if (!cancelled) onProgress(-1);
      });
    return () => {
      cancelled = true;
      if (joined) URL.revokeObjectURL(joined);
    };
  }, [parts, onProgress]);
  return url;
}

/** Sets the drawing resolution so the canvas stays within `budget` pixels at any size. */
function PixelBudget({ budget }) {
  const size = useThree((state) => state.size);
  const setDpr = useThree((state) => state.setDpr);
  useEffect(() => {
    const fits = Math.sqrt(budget / (size.width * size.height));
    setDpr(Math.min(fits, DPR_SHARPEST, window.devicePixelRatio));
  }, [budget, size, setDpr]);
  return null;
}

/**
 * The scene behind the glass: one gaussian splat and a head-coupled camera.
 *
 * `scene.rotation` turns the scan to face the viewer, `scene.anchor` is the point of the
 * scan that sits at the centre of the glass, and `scene.frame` is the size of the room's
 * cross-section there, all in the scan's own units.
 */
export default function CityWindowScene({ scene, eyeRef, screenRef, depthRef, trackCountRef, stats, onProgress }) {
  // Step down the pixel budget when frames drop, and back up when there is room.
  const [step, setStep] = useState(0);
  const lower = () => setStep((now) => Math.min(now + 1, PIXEL_BUDGETS.length - 1));
  const src = useJoinedSplat(scene.parts, onProgress);

  return (
    <Canvas
      dpr={1}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      // `manual` stops the renderer resetting the projection we set every frame.
      camera={{ manual: true, position: [0, 0, 1.5], far: FAR }}
    >
      <PixelBudget budget={PIXEL_BUDGETS[step]} />
      <PerformanceMonitor
        flipflops={3}
        onDecline={lower}
        onIncline={() => setStep((now) => Math.max(now - 1, 0))}
        onFallback={lower}
      />
      {stats ? <StatsReadout trackCountRef={trackCountRef} /> : null}
      <WindowCamera scene={scene} eyeRef={eyeRef} screenRef={screenRef} depthRef={depthRef} />
      {src ? (
        <FittedRoom scene={scene} screenRef={screenRef}>
          <Splat src={src} alphaTest={0.1} />
        </FittedRoom>
      ) : null}
    </Canvas>
  );
}
