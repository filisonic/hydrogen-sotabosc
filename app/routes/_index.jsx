import { useLoaderData, Link } from 'react-router';
import { WorldShell } from '~/components/world/WorldShell';
import { ScrollWorld } from '~/components/world/ScrollWorld';
import { DomainSelector } from '~/components/organism/DomainSelector';
import { ArtifactDock } from '~/components/artifact/ArtifactDock';
import { HomeExploreFeed } from '~/components/home/HomeExploreFeed';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    { title: "Sotabosc — Barcelona's Nature-Led City Directory" },
    {
      name: 'description',
      content:
        "Discover coworking spaces, art galleries, music venues, specialty coffee, yoga studios, and independent creators in Barcelona — all mapped to the natural world.",
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  try {
    console.log('Loading homepage data...');
    const criticalData = await loadCriticalData(args);
    console.log('Critical data loaded:', Object.keys(criticalData));
    
    const { SEED_PLACES, SEED_EVENTS, SEED_CREATORS, getUpcomingEvents } =
      await import('~/lib/directory/seed.server');
    console.log('Seed data imported successfully');
    
    const upcoming = getUpcomingEvents();
    console.log('Upcoming events:', upcoming?.length);
    
    const result = {
      ...criticalData,
      directory: {
        places: SEED_PLACES,
        events: upcoming.slice(0, 14),
        creators: SEED_CREATORS,
      },
    };
    
    console.log('Final result keys:', Object.keys(result));
    console.log('Directory keys:', Object.keys(result.directory));
    
    return result;
  } catch (error) {
    console.error('Homepage loader error:', error);
    // Return minimal data to prevent 500 error
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

  const filteredCollections = (collections.nodes || []).filter((collection) => {
    const handle = collection.handle?.toLowerCase();
    const excludedHandles = ['home-page', 'frontpage', 'homepage'];
    return !excludedHandles.includes(handle);
  });

  return {
    collections: filteredCollections,
  };
}

export default function Homepage() {
  const data = useLoaderData();
  
  console.log('Homepage component - data:', data);
  console.log('Homepage component - data.directory:', data?.directory);

  return (
    <WorldShell>
      {/* Immediate entry: domain strip + positioning (no welcome screen) */}
      <header
        className="relative z-[120] border-b"
        style={{
          borderColor: 'var(--sotabosc-border)',
          backgroundColor: 'var(--sotabosc-surface)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-2 text-center sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] opacity-50 mb-2">Sotabosc · Barcelona</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Nature is the map.{' '}
            <span className="opacity-70">Community is the city.</span>
          </h1>
          <p className="text-sm mt-3 max-w-2xl opacity-70">
            Scroll through the forest, then explore places, events, and creators matched to your domain — or browse
            everything before you choose.
          </p>
        </div>
        <DomainSelector variant="strip" />
      </header>

      <ScrollWorld directory={data?.directory || { places: [], events: [], creators: [] }} />

      <HomeExploreFeed directory={data?.directory || { places: [], events: [], creators: [] }} />

      {data.collections?.length > 0 && (
        <section className="py-14 px-4 relative z-[100]" style={{ backgroundColor: 'var(--sotabosc-bg)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-black mb-6" style={{ color: 'var(--sotabosc-text)' }}>
              Shop — ecosystem archives
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.collections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.handle}`}
                  className="block p-5 rounded-2xl border transition-shadow hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--sotabosc-surface)',
                    borderColor: 'var(--sotabosc-border)',
                    color: 'var(--sotabosc-text)',
                  }}
                >
                  <h3 className="font-bold">{collection.title}</h3>
                  <p className="text-xs mt-1 opacity-50">Artefacts & goods</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="py-10 px-4 relative z-[100]"
        style={{ backgroundColor: 'var(--sotabosc-accent)', color: 'var(--sotabosc-surface)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-center sm:text-left opacity-90">
            Missing a place or spotted something off? This directory is alive — tell us.
          </p>
          <Link
            to="/feedback"
            className="shrink-0 inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
          >
            Feedback
          </Link>
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

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
