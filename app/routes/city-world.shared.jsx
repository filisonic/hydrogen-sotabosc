import { useLoaderData } from 'react-router';
import { WorldShell } from '~/components/world/WorldShell';
import { ArtifactDock } from '~/components/artifact/ArtifactDock';
import { CityStage } from '~/components/city/CityStage';

/**
 * Sotabosc city — homepage at `/`, legacy alias `/city-world` redirects here.
 * Subdomain `city.sotabosc.world` rewrites to `/` in server.js.
 *
 * The homepage is the city and nothing else: one screen, no scroll. What the
 * city is and how it works lives on `/how-it-works`; the screens on `/screens`.
 */
export const meta = () => {
  return [
    { title: 'Sotabosc — A small city of Barcelona businesses, artists and screens' },
    {
      name: 'description',
      content:
        'Sotabosc is a small solarpunk city inside Barcelona: real businesses grouped into five kingdoms that cross-promote each other, with context-aware screens showing local artists.',
    },
    {
      property: 'og:title',
      content: 'Sotabosc — All for one, one for all',
    },
    {
      property: 'og:description',
      content:
        'Five kingdoms, limited plots, one city. Walk the map, meet the citizens and claim a plot for your business.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://sotabosc.world/' },
    { property: 'og:site_name', content: 'Sotabosc' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ];
};

/**
 * @param {import('react-router').LoaderFunctionArgs} args
 */
export async function loader(args) {
  const { loadCityPage } = await import('~/lib/city/page.server');
  return loadCityPage(args);
}

export default function CityHomePage() {
  const { city, cityContext } = useLoaderData();

  return (
    <WorldShell atmosphere={false}>
      <div className="city-home">
        <CityStage
          citizens={city.citizens}
          events={city.events}
          totalPlots={city.totalPlots}
          context={cityContext}
        />
      </div>
      <ArtifactDock />
    </WorldShell>
  );
}
