import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { RESTING_EYE_CM } from '~/lib/city/window/offAxis';

const CityWindowScene = lazy(() => import('./CityWindowScene'));

const CM_PER_CSS_PX = 2.54 / 96;
/** How far the pointer or a tilted phone can push the eye off centre, in screen widths. */
const POINTER_REACH = 0.45;
const TILT_REACH_DEG = 25;

const STATUS = {
  pointer: 'Move the pointer, or tilt your phone, to look around.',
  starting: 'Starting the camera…',
  head: 'Tracking your head. Lean left, right, closer.',
  denied: 'No camera access, so the pointer drives the view instead.',
  failed: 'Head tracking could not start here, so the pointer drives the view instead.',
};

/**
 * A screen that behaves like a window: a gaussian splat scene whose perspective follows
 * the viewer's head. Head tracking is opt-in; until then (and without a camera) the
 * pointer or the phone's tilt moves the eye.
 *
 * @param {{scene: {src: string, title: string, headline: string, blurb: string, credit: string, rotation: number[], anchor: number[], frame: {width: number, height: number}, textDepth: number}}} props
 */
export function CityWindow({ scene }) {
  const stageRef = useRef(null);
  const eyeRef = useRef({ ...RESTING_EYE_CM });
  const screenRef = useRef({ width: 0, height: 0 });
  const stopTrackingRef = useRef(null);
  const depthRef = useRef(null);
  const trackCountRef = useRef(0);
  // `/city/window?stats` shows frames and head positions per second.
  const stats = useSearchParams()[0].has('stats');
  const [mode, setMode] = useState('pointer');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const stage = stageRef.current;
    const measure = () => {
      screenRef.current = {
        width: stage.clientWidth * CM_PER_CSS_PX,
        height: stage.clientHeight * CM_PER_CSS_PX,
      };
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Pointer and tilt stand in for the head whenever the camera is not tracking.
  useEffect(() => {
    if (mode === 'head') return undefined;
    const stage = stageRef.current;
    const lookFrom = (x, y) => {
      const { width } = screenRef.current;
      eyeRef.current = {
        x: x * POINTER_REACH * width,
        y: y * POINTER_REACH * width,
        z: RESTING_EYE_CM.z,
      };
    };
    const onPointer = (event) => {
      const box = stage.getBoundingClientRect();
      lookFrom(
        ((event.clientX - box.left) / box.width) * 2 - 1,
        1 - ((event.clientY - box.top) / box.height) * 2,
      );
    };
    const onTilt = (event) => {
      if (event.gamma == null || event.beta == null) return;
      const clamp = (value) => Math.max(-1, Math.min(1, value / TILT_REACH_DEG));
      // A phone is usually held tipped back about 45°, so that is the level position.
      lookFrom(clamp(event.gamma), clamp(event.beta - 45));
    };
    stage.addEventListener('pointermove', onPointer);
    window.addEventListener('deviceorientation', onTilt);
    return () => {
      stage.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [mode]);

  useEffect(() => () => stopTrackingRef.current?.(), []);

  const stopTracking = () => {
    stopTrackingRef.current?.();
    stopTrackingRef.current = null;
    eyeRef.current = { ...RESTING_EYE_CM };
    setMode('pointer');
  };

  const startTracking = async () => {
    setMode('starting');
    try {
      const { startHeadTracking } = await import('~/lib/city/window/headTracker');
      stopTrackingRef.current = await startHeadTracking(
        (eye) => {
          eyeRef.current = eye;
          trackCountRef.current += 1;
        },
        () => screenRef.current.height,
      );
      setMode('head');
    } catch (error) {
      console.error('Head tracking failed to start', error);
      setMode(error?.name === 'NotAllowedError' ? 'denied' : 'failed');
    }
  };

  return (
    <section className="city-window" ref={stageRef} aria-label={`${scene.title}, seen through the screen`}>
      {mounted ? (
        <Suspense fallback={<p className="city-stage__loading">Opening the window…</p>}>
          <CityWindowScene
            scene={scene}
            eyeRef={eyeRef}
            screenRef={screenRef}
            depthRef={depthRef}
            trackCountRef={trackCountRef}
            stats={stats}
          />
        </Suspense>
      ) : (
        <p className="city-stage__loading">Opening the window…</p>
      )}

      {/* Lettering on a pane of glass just inside the room: it drifts slightly against the screen's edge. */}
      <div className="city-window__depth" ref={depthRef}>
        <p className="city-window__blurb">{scene.blurb}</p>
        <h1 className="city-window__title">{scene.headline}</h1>
      </div>

      <div className="city-window__panel">
        <p className="city-window__status" role="status">
          {STATUS[mode]}
        </p>
        {mode === 'head' ? (
          <button type="button" className="mag-btn-o" onClick={stopTracking}>
            Turn the camera off
          </button>
        ) : (
          <button type="button" className="mag-btn" onClick={startTracking} disabled={mode === 'starting'}>
            Follow my head
          </button>
        )}
        <p className="city-window__note">
          Uses your camera to find your eyes. The video is read on this device and never leaves it.
        </p>
      </div>

      {stats ? <output id="window-stats" className="city-stage__stats" style={{ top: '4.5rem' }} /> : null}

      <p className="city-window__credit">{scene.credit}</p>
    </section>
  );
}
