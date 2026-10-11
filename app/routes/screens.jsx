import { useLoaderData, Link } from 'react-router';
import { CityClaimBand } from '~/components/city/CityPitch';
import { CityScreen } from '~/components/city/CityScreen';
import { CitySides } from '~/components/city/CitySections';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';

/** The wall screens: what one plays, and what joining means for businesses, artists and events. */
export const meta = ({ data }) => [
  { title: 'The screens — one per citizen, fed by the whole city | Sotabosc' },
  {
    name: 'description',
    content:
      'Every Sotabosc citizen has a screen that reads the Barcelona clock, the weather, its kingdom and its neighbours, then decides what to show. Try one live.',
  },
  ...canonicalLinkMeta(data?.origin, '/screens'),
];

/**
 * @param {import('react-router').LoaderFunctionArgs} args
 */
export async function loader(args) {
  const { loadCityPage } = await import('~/lib/city/page.server');
  const data = await loadCityPage(args);
  return { ...data, origin: new URL(args.request.url).origin };
}

export default function ScreensPage() {
  const { city, cityContext } = useLoaderData();

  return (
    <div className="city-world-page">
      <div className="city-home city-info">
        <section className="city-section city-section--screen">
          <div className="city-section__head">
            <span className="city-section__tag">The screen</span>
            <h1 className="city-section__title">One screen per citizen, fed by the whole city</h1>
            <p className="city-section__lede">
              Each screen reads the Barcelona clock, the weather, its own kingdom and its neighbours, then
              decides what to show. This is live: pick any citizen and watch what its screen would play right
              now.
            </p>
            <div className="city-hero__cta">
              <Link to="/" className="mag-btn">
                ← Back to the city
              </Link>
              <Link to="/how-it-works" className="mag-btn-o">
                How the city works
              </Link>
            </div>
          </div>
          <CityScreen
            citizens={city.citizens}
            artists={city.artists}
            events={city.events}
            context={cityContext}
          />
        </section>
        <CitySides />
      </div>
      <CityClaimBand archiveCount={city.archiveCount} />
    </div>
  );
}
