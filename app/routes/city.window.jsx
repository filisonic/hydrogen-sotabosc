import { CityWindow } from '~/components/city/CityWindow';
// Imported rather than kept in `public/`: on Oxygen these are served from the asset CDN,
// not from the site's own address, and the import resolves to wherever that is.
import splatPart0 from '~/assets/splats/coffee-shop.0.splat?url';
import splatPart1 from '~/assets/splats/coffee-shop.1.splat?url';

/**
 * Prototype: the screen as a window into a scanned place (gaussian splat + head tracking).
 *
 * The scene is a public sample, cut down from 6.2M to 1.2M splats and with the half of
 * the room behind the viewer removed. A real venue scan replaces `SCENE`; `rotation`,
 * `anchor` and `frame` then need measuring again so the room's walls meet the edges of
 * the screen.
 */
const SCENE = {
  title: 'Coffee shop',
  headline: 'We’re open',
  blurb: 'This is not a photo. The room starts where your screen ends: lean left, lean right, come closer.',
  // In two halves because Oxygen refuses any single file over 20 MB; the page joins them.
  parts: [splatPart0, splatPart1],
  credit: '“Coffee shop” by ethan3111 on SuperSplat, CC BY 4.0, thinned for the web.',
  // Looking down the length of the room, with the glass 4 units in from the back wall.
  rotation: [0, Math.PI / 2, 0],
  anchor: [-4, -0.25, -0.4],
  // Wall to wall and floor to ceiling, measured on the inner faces.
  frame: { width: 8.2, height: 4.9 },
  // The lettering is on a pane of glass standing just inside the room, this many screen
  // widths behind the screen: 0 pins it to the screen, larger values make it drift more.
  textDepth: 0.12,
};

export const meta = () => [
  { title: 'Window — Sotabosc prototype' },
  { name: 'robots', content: 'noindex, nofollow' },
];

export default function CityWindowPage() {
  return <CityWindow scene={SCENE} />;
}
