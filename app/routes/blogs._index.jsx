import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import { motion } from 'framer-motion';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: `Hydrogen | Blogs`}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

const COLORS = {
  yellow: '#f4ff00',
  pink: '#ff00ff',
  blue: '#00e5ff',
  orange: '#ff6b00',
  green: '#1b4332',
  surface: '#ffffff',
  text: '#000000'
};

export default function Blogs() {
  /** @type {LoaderReturnData} */
  const {blogs} = useLoaderData();

  return (
    <div className="mag" style={{ backgroundColor: COLORS.surface, color: COLORS.text }}>
      <section style={{ backgroundColor: COLORS.yellow, padding: '12rem 2rem 8rem', borderBottom: '4px solid #000' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em' }}>The Journal</span>
            <h1 style={{ fontSize: 'clamp(5rem, 15vw, 14rem)', fontWeight: 900, lineHeight: 0.8, margin: '2rem 0 0', letterSpacing: '-0.06em', textTransform: 'uppercase' }}>
              Sotabosc <br />Journal
            </h1>
            <p style={{ maxWidth: '600px', fontSize: '1.5rem', lineHeight: 1.2, fontWeight: 700, marginTop: '4rem' }}>
              Exploring the intersection of technology, nature, and the creative spirit of Barcelona.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-6 py-20">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '4rem' }}>
          <PaginatedResourceSection connection={blogs}>
            {({node: blog}) => (
              <Link
                key={blog.handle}
                prefetch="intent"
                to={`/blogs/${blog.handle}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
                className="group"
              >
                <div style={{ 
                  borderBottom: '2px solid #000', 
                  paddingBottom: '2.5rem',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.5 }}>ISSUE NO. {blog.handle.toUpperCase()}</span>
                    <span style={{ fontSize: '1.2rem', transition: 'transform 0.3s' }} className="group-hover:translate-x-2">→</span>
                  </div>
                  <h2 style={{ 
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                    fontWeight: 900, 
                    lineHeight: 1, 
                    letterSpacing: '-0.03em',
                    margin: 0
                  }}>
                    {blog.title}
                  </h2>
                  <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: '#000', color: '#fff', padding: '0.3rem 0.6rem' }}>Premium</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', border: '1px solid #000', padding: '0.3rem 0.6rem' }}>Member Exclusive</span>
                  </div>
                </div>
              </Link>
            )}
          </PaginatedResourceSection>
        </div>
      </main>
      
      {/* LUXURIOUS CTA SECTION */}
      <section style={{ background: COLORS.pink, color: '#fff', padding: '10rem 2rem', textAlign: 'center', borderTop: '4px solid #000' }}>
        <h2 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, lineHeight: 0.9, maxWidth: '900px', margin: '0 auto 4rem', textTransform: 'uppercase' }}>
          Get the physical edition and full digital access.
        </h2>
        <Link 
          to="/membership" 
          style={{ 
            display: 'inline-block',
            background: COLORS.yellow,
            color: '#000',
            padding: '2rem 5rem',
            border: '4px solid #000',
            fontSize: '1.2rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            textDecoration: 'none'
          }}
        >
          Join the Network
        </Link>
      </section>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
`;

/** @typedef {BlogsQuery['blogs']['nodes'][0]} BlogNode */

/** @typedef {import('./+types/blogs._index').Route} Route */
/** @typedef {import('storefrontapi.generated').BlogsQuery} BlogsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
