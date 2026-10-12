// The package's `exports` map hides its wasm folder, so these go by file path instead.
import wasmLoaderUrl from '../../../../node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_internal.js?url';
import wasmBinaryUrl from '../../../../node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_internal.wasm?url';
import { eyeFromFace, oneEuroFilter } from './offAxis';

/** BlazeFace short range: about 230 KB, built for a face within arm's reach of a webcam. */
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

/**
 * Follow the viewer's head with the webcam, entirely in the browser.
 *
 * Frames go from the camera into a hidden video element and through the detector on
 * this device; nothing is recorded or sent anywhere. Call the returned function to stop
 * and release the camera.
 *
 * @param {(eye: {x: number, y: number, z: number}) => void} onEye Eye position in centimetres, relative to the screen centre.
 * @param {() => number} getScreenHeightCm
 * @returns {Promise<() => void>}
 */
export async function startHeadTracking(onEye, getScreenHeightCm) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });

  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;

  let detector;
  let frame = 0;
  let stopped = false;
  const stop = () => {
    stopped = true;
    cancelAnimationFrame(frame);
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
    detector?.close();
  };

  try {
    const { FaceDetector } = await import('@mediapipe/tasks-vision');
    [detector] = await Promise.all([
      FaceDetector.createFromOptions(
        { wasmLoaderPath: wasmLoaderUrl, wasmBinaryPath: wasmBinaryUrl },
        // On the CPU: the model is tiny, and the GPU is busy drawing the splat.
        { baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' }, runningMode: 'VIDEO' },
      ),
      video.play(),
    ]);
  } catch (error) {
    stop();
    throw error;
  }

  // Distance comes from a few pixels of eye spacing, so it is the noisiest axis and is held hardest.
  const steady = {
    x: oneEuroFilter({ minCutoff: 0.5, beta: 0.015 }),
    y: oneEuroFilter({ minCutoff: 0.5, beta: 0.015 }),
    z: oneEuroFilter({ minCutoff: 0.2, beta: 0.004 }),
  };

  let lastTime = -1;
  const tick = () => {
    if (stopped) return;
    frame = requestAnimationFrame(tick);
    if (video.currentTime === lastTime || !video.videoWidth) return;
    lastTime = video.currentTime;

    const face = detector.detectForVideo(video, performance.now()).detections[0];
    // BlazeFace keypoints start with the right eye, then the left.
    const [rightEye, leftEye] = face?.keypoints ?? [];
    if (!rightEye || !leftEye) return;
    const eye = eyeFromFace(rightEye, leftEye, {
      aspect: video.videoWidth / video.videoHeight,
      screenHeightCm: getScreenHeightCm(),
    });
    const seconds = performance.now() / 1000;
    // Sideways and vertical position are worked out from distance, so they inherit its
    // wobble. Steady the distance first and rescale them to it before filtering.
    const z = steady.z(eye.z, seconds);
    const cameraY = getScreenHeightCm() / 2;
    onEye({
      x: steady.x((eye.x * z) / eye.z, seconds),
      y: steady.y(((eye.y - cameraY) * z) / eye.z + cameraY, seconds),
      z,
    });
  };
  tick();

  return stop;
}
