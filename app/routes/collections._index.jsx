import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {DirectorySurface} from '~/components/directory/DirectorySurface';
import {canonicalLinkMeta} from '~/lib/seo/metaHelpers';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const origin = data?.origin;
  return [
    {title: 'Store — Sotabosc'},
    {
      name: 'description',
      content:
        'Browse Sotabosc collections: prints, goods, and nature-inspired pieces from the Barcelona creative ecosystem.',
    },
    ...canonicalLinkMeta(origin, '/collections'),
  ];
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
    pageBy: 4,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections, origin: new URL(request.url).origin};
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

export default function Collections() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();

  return (
    <DirectorySurface>
      <div className="min-h-screen pt-20 md:pt-24">
        <section
          className="px-4 pb-10 pt-8 md:pt-10"
          style={{backgroundColor: 'var(--sotabosc-surface-muted)'}}
        >
          <div className="max-w-6xl mx-auto">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{color: 'var(--sotabosc-muted)'}}
            >
              Shopify storefront
            </p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 font-[family-name:var(--font-display)]">
              Store
            </h1>
            <p className="text-lg max-w-2xl mb-8" style={{color: 'var(--sotabosc-muted)'}}>
              Collections group our listings — pick a theme or jump straight to the full catalog.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/collections/all"
                className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--sotabosc-accent)',
                  color: 'var(--sotabosc-surface)',
                }}
              >
                View all products
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  borderColor: 'var(--sotabosc-border)',
                  color: 'var(--sotabosc-text)',
                }}
              >
                Search the store
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 md:py-14">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-lg font-bold mb-6 font-[family-name:var(--font-display)]">
              Collections
            </h2>
            <div className="space-y-8 [&_a]:inline-flex [&_a]:items-center [&_a]:justify-center [&_a]:rounded-full [&_a]:border [&_a]:border-[color:var(--sotabosc-border)] [&_a]:px-4 [&_a]:py-2 [&_a]:text-sm [&_a]:font-semibold [&_a]:text-[color:var(--sotabosc-text)] [&_a]:transition-colors [&_a:hover]:bg-[color:var(--sotabosc-surface-muted)]">
            <PaginatedResourceSection
              connection={collections}
              resourcesClassName="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {({node: collection, index}) => (
                <CollectionItem
                  key={collection.id}
                  collection={collection}
                  index={index}
                />
              )}
            </PaginatedResourceSection>
            </div>
          </div>
        </section>
      </div>
    </DirectorySurface>
  );
}

/**
 * @param {{
 *   collection: CollectionFragment;
 *   index: number;
 * }}
 */
function CollectionItem({collection, index}) {
  return (
    <Link
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className="group block overflow-hidden rounded-2xl border transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        backgroundColor: 'var(--sotabosc-surface)',
        borderColor: 'var(--sotabosc-border)',
      }}
    >
      <div
        className="aspect-square overflow-hidden bg-black/5"
        style={{backgroundColor: 'var(--sotabosc-surface-muted)'}}
      >
        {collection?.image ? (
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="1/1"
            data={collection.image}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading={index < 3 ? 'eager' : undefined}
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-sm font-medium px-4 text-center"
            style={{color: 'var(--sotabosc-muted)'}}
          >
            {collection.title}
          </div>
        )}
      </div>
      <div className="p-4 md:p-5">
        <h3 className="text-base md:text-lg font-bold leading-snug font-[family-name:var(--font-display)] group-hover:underline underline-offset-4">
          {collection.title}
        </h3>
        <p className="text-xs mt-1 font-medium" style={{color: 'var(--sotabosc-muted)'}}>
          Open collection →
        </p>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/** @typedef {import('./+types/collections._index').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
