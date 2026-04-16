import { HomeSotaboscJourney } from '~/components/home/HomeSotaboscJourney';

/**
 * Home forest experience: flowing scroll journey with listings embedded in each layer’s hero.
 *
 * @param {{
 *   directory: { places: unknown[]; events: unknown[]; creators: unknown[] };
 *   spineProducts?: Array<{ id: string; handle: string; title: string; featuredImage?: { url: string; altText?: string | null } | null }>;
 * }} props
 */
export function ScrollWorld({ directory, spineProducts = [] }) {
  return <HomeSotaboscJourney directory={directory} spineProducts={spineProducts} />;
}
