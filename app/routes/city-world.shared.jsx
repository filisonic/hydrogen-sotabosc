import { useLoaderData, Link } from 'react-router';
import { LivingMapHero } from '~/components/home/LivingMapHero';
import { LivingMapDomainBand } from '~/components/home/LivingMapDomainBand';
import { WorldShell } from '~/components/world/WorldShell';
import { ScrollWorld } from '~/components/world/ScrollWorld';
import { ArtifactDock } from '~/components/artifact/ArtifactDock';
import { HomeExploreFeed } from '~/components/home/HomeExploreFeed';
import { filterStoreCollections } from '~/lib/store/filterStoreCollections';

/**
 * Living map — homepage at `/`, legacy alias `/city-world` redirects here.
 * Subdomain `city.sotabosc.world` rewrites to `/` in server.js.
 */
export const meta = () => {
  return [
    { title: "Sotabosc — Barcelona's Living Creative Ecosystem" },
    {
      name: 'description',
      content:
        "Descend through Barcelona's living ecosystem — scroll through sky, canopy, understory, water, and soil to discover places, events, and creators mapped to the natural world.",
    },
    {
      property: 'og:title',
      content: "Sotabosc — Barcelona's Living Creative Ecosystem",
    },
    {
      property: 'og:description',
      content:
        "Barcelona's creative network mapped as a living ecosystem. Scroll the layers, choose your domain, explore places and events.",
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
  try {
    const criticalData = await loadCriticalData(args);

    const { SEED_PLACES, SEED_EVENTS, SEED_CREATORS, getUpcomingEvents } =
      await import('~/lib/directory/seed.server');

    const upcoming = getUpcomingEvents();

    return {
      ...criticalData,
      directory: {
        places: SEED_PLACES,
        events: upcoming.slice(0, 14),
        creators: SEED_CREATORS,
      },
    };
  } catch (error) {
    console.error('Living map loader error:', error);
    return {
      collections: [],
      directory: {
        places: [],
        events: [],
        creators: [],
      },
    };
  }
}

async function loadCriticalData({ context }) {
  const [{ collections }] = await Promise.all([
    context.storefront.query(COLLECTIONS_WITH_PRODUCTS_QUERY),
  ]);

  const filteredCollections = filterStoreCollections(collections.nodes || []);

  return {
    collections: filteredCollections,
  };
}

export default function LivingMapPage() {
  const data = useLoaderData();
  const directory = data?.directory || { places: [], events: [], creators: [] };
  const placeCount = directory.places?.length ?? 0;

  return (
    <WorldShell>
      <LivingMapHero placeCount={placeCount} />

      <LivingMapDomainBand />

      <div id="living-map-scroll">
        <ScrollWorld directory={directory} />
      </div>

      <HomeExploreFeed directory={directory} />

      {data.collections?.length > 0 && (
        <section className="relative z-[100]" style={{ backgroundColor: 'var(--sotabosc-bg)' }}>
          <div className="mag-sec">
            <div className="mag-sec-head">
              <h2 className="mag-sec-label">Shop</h2>
            </div>
          </div>
          <div className="mag-places">
            {data.collections.map((collection) => {
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
                    <span className="mag-place-cat">Ecosystem archives</span>
                    <h4>{collection.title}</h4>
                    <p>Artefacts and goods from the living catalog.</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="relative z-[100]" style={{ backgroundColor: 'var(--sotabosc-bg)' }}>
        <div className="mag-sec">
          <div className="mag-sec-head">
            <h2 className="mag-sec-label">Keep The Directory Alive</h2>
          </div>
        </div>
        <div className="mag-feat" style={{ paddingBottom: '2.25rem' }}>
          <div
            className="mag-feat-main"
            style={{ minHeight: 'unset', background: 'var(--sotabosc-accent)', color: 'var(--sotabosc-surface)' }}
          >
            <span className="mag-feat-main-tag" style={{ color: 'rgba(255,255,255,0.78)' }}>
              Community signal
            </span>
            <h3 style={{ color: 'var(--sotabosc-surface)' }}>Spotted a missing place or outdated event?</h3>
            <p style={{ color: 'rgba(255,255,255,0.86)' }}>
              This ecosystem map updates with community intelligence. Share edits and we will verify and integrate.
            </p>
          </div>
          <div className="mag-feat-side">
            <Link to="/feedback" className="mag-feat-card">
              <span className="mag-feat-card-tag">Contribute</span>
              <h4>Submit feedback and listings updates</h4>
              <p>Open feedback form →</p>
            </Link>
            <Link to="/city" className="mag-feat-card">
              <span className="mag-feat-card-tag">Browse all</span>
              <h4>Go to full directory index</h4>
              <p>Open directory →</p>
            </Link>
            <Link to="/discover" className="mag-feat-card">
              <span className="mag-feat-card-tag">Magazine</span>
              <h4>Editorial browse by category</h4>
              <p>Discover page →</p>
            </Link>
          </div>
        </div>
      </section>

      <ArtifactDock />
    </WorldShell>
  );
}

const COLLECTIONS_WITH_PRODUCTS_QUERY = `#graphql
  fragment CollectionProduct on Product {
    id
    title
    handle
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }

  fragment CollectionWithProduct on Collection {
    id
    title
    handle
    products(first: 1) {
      nodes {
        ...CollectionProduct
      }
    }
  }

  query CollectionsWithProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 10, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...CollectionWithProduct
      }
    }
  }
`;
