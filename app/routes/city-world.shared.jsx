import {useLoaderData} from 'react-router';
import {WorldShell} from '~/components/world/WorldShell';
import {ArtifactDock} from '~/components/artifact/ArtifactDock';
import {CityStage} from '~/components/city/CityStage';

/**
 * Sotabosc living map — served at `/map`.
 * Legacy `/city-world` redirects here. Magazine/channel edition owns `/`.
 */
export const meta = () => {
  return [
    {title: 'Living map — Sotabosc'},
    {
      name: 'description',
      content:
        'Explore Sotabosc’s living map of Barcelona places, creators and screens. The cultural channel lives on the magazine edition at sotabosc.world.',
    },
    {property: 'og:title', content: 'Sotabosc — Living map'},
    {
      property: 'og:description',
      content:
        'A spatial view of Barcelona’s creative network. For the channel and city edition, start at the homepage.',
    },
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: 'https://sotabosc.world/map'},
    {property: 'og:site_name', content: 'Sotabosc'},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
};

/**
 * @param {import('react-router').LoaderFunctionArgs} args
 */
export async function loader(args) {
  const {loadCityPage} = await import('~/lib/city/page.server');
  return loadCityPage(args);
}

export default function CityMapPage() {
  const {city, cityContext} = useLoaderData();

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
