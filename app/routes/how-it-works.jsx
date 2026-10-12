import { useLoaderData, Link } from 'react-router';
import { WorldShell } from '~/components/world/WorldShell';
import { ScrollWorld } from '~/components/world/ScrollWorld';
import { ArtifactDock } from '~/components/artifact/ArtifactDock';
import { CityClaimBand } from '~/components/city/CityPitch';
import {
  CityArena,
  CityChronicles,
  CityIntro,
  CityKingdoms,
  CityPillars,
} from '~/components/city/CitySections';
import { canonicalLinkMeta } from '~/lib/seo/metaHelpers';

/**
 * Everything the homepage map does not say: what Sotabosc is, how the kingdoms
 * feed each other, the passport, the Arena, and the directory beneath the city.
 */
export const meta = ({ data }) => [
  { title: 'How Sotabosc works — five kingdoms, one city' },
  {
    name: 'description',
    content:
      'Sotabosc is a persistent city built from real Barcelona businesses. Five kingdoms pass people along to each other, every citizen has a screen, and walking the city earns collectibles.',
  },
  ...canonicalLinkMeta(data?.origin, '/how-it-works'),
];

/**
 * @param {import('react-router').LoaderFunctionArgs} args
 */
export async function loader(args) {
  const { loadCityPage } = await import('~/lib/city/page.server');
  const data = await loadCityPage(args, { full: true });
  return { ...data, origin: new URL(args.request.url).origin };
}

export default function HowItWorksPage() {
  const { city, cityContext, directory, collections } = useLoaderData();

  return (
    <div className="city-world-page">
      <div className="city-home city-info">
        <CityIntro
          citizenCount={city.citizens.length}
          totalPlots={city.totalPlots}
          eventCount={city.events.length}
          context={cityContext}
        />
        <CityPillars />
        <CityKingdoms />
      </div>

      <CityArena />

      <div className="city-home city-info">
        <CityChronicles />
        <section className="city-section city-info__next">
          <article className="city-block">
            <span className="city-block__tag">The screens</span>
            <h3>One screen per citizen, fed by the whole city</h3>
            <p>See what a citizen&apos;s screen would be playing right now, and what joining means for a business, an artist or an event.</p>
            <Link to="/screens" className="city-block__more">
              The screens →
            </Link>
          </article>
        </section>
      </div>

      <WorldShell>
        <section className="city-section city-section--layers">
          <div className="city-section__head">
            <span className="city-section__tag">Beneath the city</span>
            <h2 className="city-section__title">Scroll down through the layers</h2>
          </div>
        </section>
        <div id="living-map-scroll">
          <ScrollWorld directory={directory} />
        </div>

        {collections?.length > 0 && (
          <section className="relative z-[100]" style={{ backgroundColor: 'var(--sotabosc-bg)' }}>
            <div className="mag-sec">
              <div className="mag-sec-head">
                <h2 className="mag-sec-label">The city store — art from the screens</h2>
              </div>
            </div>
            <div className="mag-places">
              {collections.map((collection) => {
                const featured = collection.products?.nodes?.[0]?.featuredImage;
                return (
                  <Link key={collection.id} to={`/collections/${collection.handle}`} className="mag-place">
                    {featured ? (
                      <img
                        src={featured.url}
                        alt={featured.altText || collection.title}
                        className="mag-place-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="mag-place-placeholder">
                        <span>🧺</span>
                      </div>
                    )}
                    <div className="mag-place-body">
                      <span className="mag-place-cat">Sotabosc store</span>
                      <h4>{collection.title}</h4>
                      <p>Prints, objects and editions from the city&apos;s artists.</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <CityClaimBand archiveCount={city.archiveCount} />
        <ArtifactDock />
      </WorldShell>
    </div>
  );
}
