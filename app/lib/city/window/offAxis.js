/**
 * Head-coupled perspective: the maths that turns the screen into a window.
 *
 * The screen is a fixed rectangle centred on the origin in the z = 0 plane and the
 * viewer's eye is a point in front of it (z > 0). Moving the camera alone would only
 * give parallax; skewing the frustum so its edges keep passing through the screen's
 * edges is what makes the scene sit still behind the glass.
 */

/** Average adult distance between pupils, in centimetres. */
export const EYE_SPACING_CM = 6.3;

/** Where the eye is assumed to be before any input arrives, in centimetres. */
export const RESTING_EYE_CM = Object.freeze({ x: 0, y: 0, z: 60 });

/**
 * Frustum bounds at the near plane for an eye looking through a screen.
 *
 * @param {{x: number, y: number, z: number}} eye Eye position relative to the screen centre.
 * @param {number} width Screen width, same unit as `eye`.
 * @param {number} height Screen height, same unit as `eye`.
 * @param {number} near Near plane distance, same unit as `eye`.
 */
export function windowFrustum(eye, width, height, near) {
  const scale = near / Math.max(eye.z, 1e-6);
  return {
    left: (-width / 2 - eye.x) * scale,
    right: (width / 2 - eye.x) * scale,
    bottom: (-height / 2 - eye.y) * scale,
    top: (height / 2 - eye.y) * scale,
  };
}

/**
 * Eye position in centimetres from the two eye points of a face detection.
 *
 * Distance comes from how far apart the eyes look: the closer the face, the wider they
 * sit in the frame. The camera is taken to be at the top edge of the screen, centred.
 *
 * @param {{x: number, y: number}} rightEye Normalised image coordinates (0..1).
 * @param {{x: number, y: number}} leftEye Normalised image coordinates (0..1).
 * @param {{aspect: number, screenHeightCm: number, horizontalFovDeg?: number}} camera
 */
export function eyeFromFace(rightEye, leftEye, { aspect, screenHeightCm, horizontalFovDeg = 60 }) {
  const halfWidthAtOne = Math.tan((horizontalFovDeg * Math.PI) / 360);
  // Image height is narrower than its width, so undo the aspect before measuring.
  const spacing = Math.hypot(rightEye.x - leftEye.x, (rightEye.y - leftEye.y) / aspect);
  const z = EYE_SPACING_CM / (2 * halfWidthAtOne * Math.max(spacing, 1e-4));
  const midX = (rightEye.x + leftEye.x) / 2;
  const midY = (rightEye.y + leftEye.y) / 2;
  return {
    // The camera image is not mirrored: a head moving to its right drifts left in frame.
    x: (0.5 - midX) * 2 * halfWidthAtOne * z,
    y: ((0.5 - midY) * 2 * halfWidthAtOne * z) / aspect + screenHeightCm / 2,
    z,
  };
}

/**
 * One Euro filter: steadies a jittery signal without making it feel laggy.
 *
 * A face detector's eye points wobble by a pixel or two every frame, which reads as a
 * shaking room. Smoothing hard enough to hide that would make the view trail behind a
 * moving head, so the filter smooths heavily while the value is nearly still and lets
 * go as it speeds up.
 *
 * @param {{minCutoff?: number, beta?: number}} [options] `minCutoff` (Hz) sets how firmly
 *   a still value is held; `beta` how quickly the filter opens up with speed.
 * @returns {(value: number, seconds: number) => number} Call with each sample and its timestamp.
 */
export function oneEuroFilter({ minCutoff = 1, beta = 0.01 } = {}) {
  const DERIVATIVE_CUTOFF = 1;
  const alpha = (cutoff, dt) => 1 / (1 + 1 / (2 * Math.PI * cutoff * dt));
  let last;
  let lastTime;
  let speed = 0;

  return (value, seconds) => {
    if (last === undefined || seconds <= lastTime) {
      last = value;
      lastTime = seconds;
      return value;
    }
    const dt = seconds - lastTime;
    const rawSpeed = (value - last) / dt;
    speed += alpha(DERIVATIVE_CUTOFF, dt) * (rawSpeed - speed);
    last += alpha(minCutoff + beta * Math.abs(speed), dt) * (value - last);
    lastTime = seconds;
    return last;
  };
}
