import { useLoaderData, Link } from 'react-router';
import { WorldShell } from '~/components/world/WorldShell';
import { ScrollWorld } from '~/components/world/ScrollWorld';
import { DomainSelector } from '~/components/organism/DomainSelector';
import { ArtifactDock } from '~/components/artifact/ArtifactDock';
import { HomeExploreFeed } from '~/components/home/HomeExploreFeed';
import {filterStoreCollections} from '~/lib/store/filterStoreCollections';
/**
 * City World — the immersive scroll ecosystem experience.
 * Served at city.sotabosc.world (via subdomain rewrite → /city-world)
 * and also accessible directly at sotabosc.world/city-world.
 *
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    { title: "Sotabosc City — Enter the Living Ecosystem" },
    {
      name: 'description',
      content:
        "Descend through Barcelona's living ecosystem — scroll through sky, canopy, understory, water, and soil to discover places, events, and creators mapped to the natural world.",
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
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
    console.error('City-world loader error:', error);
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

export default function CityWorld() {
  const data = useLoaderData();
  const directory = data?.directory || { places: [], events: [], creators: [] };

  return (
    <WorldShell>
      <header
        className="relative z-[120] border-b mag pt-4 md:pt-5"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg)',
          color: 'var(--ink)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 pb-4 md:pb-5 text-center sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] opacity-50 mb-2" style={{fontFamily: 'var(--mono)'}}>Sotabosc · Barcelona</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2" style={{fontFamily: 'var(--sans)'}}>
            Nature is the map.{' '}
            <span className="opacity-70">Community is the city.</span>
          </h1>
          <p className="text-sm max-w-2xl opacity-70" style={{fontFamily: 'var(--sans)'}}>
            Scroll through the forest, then explore places, events, and creators matched to your domain — or browse
            everything before you choose.
          </p>
        </div>
        <DomainSelector variant="strip" />
      </header>

      <ScrollWorld directory={directory} />

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

      <section
        className="relative z-[100]"
        style={{ backgroundColor: 'var(--sotabosc-bg)' }}
      >
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

/** @typedef {import('./+types/city-world._index').Route} Route */
