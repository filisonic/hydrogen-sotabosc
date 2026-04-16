import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {DirectorySurface} from '~/components/directory/DirectorySurface';
import {canonicalLinkMeta} from '~/lib/seo/metaHelpers';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const origin = data?.origin;
  return [
    {title: 'All products — Sotabosc Shop'},
    {
      name: 'description',
      content: 'Full catalog of Sotabosc shop products: art, goods, and nature-inspired listings.',
    },
    ...canonicalLinkMeta(origin, '/collections/all'),
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
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {products, origin: new URL(request.url).origin};
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

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {products} = useLoaderData();

  return (
    <DirectorySurface>
      <div className="min-h-screen pt-20 md:pt-24">
        <section
          className="px-4 pb-8 pt-8 md:pt-10"
          style={{backgroundColor: 'var(--sotabosc-surface-muted)'}}
        >
          <div className="max-w-6xl mx-auto">
            <nav className="text-sm mb-4" style={{color: 'var(--sotabosc-muted)'}}>
              <Link to="/collections" className="underline-offset-4 hover:underline">
                Shop
              </Link>
              <span className="mx-2 opacity-60">/</span>
              <span style={{color: 'var(--sotabosc-text)'}}>All products</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 font-[family-name:var(--font-display)]">
              All products
            </h1>
            <p className="text-lg max-w-2xl" style={{color: 'var(--sotabosc-muted)'}}>
              Everything in the storefront, newest pages first. Use search for quick lookup.
            </p>
          </div>
        </section>

        <section className="px-4 py-10 md:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-10 [&_a]:inline-flex [&_a]:items-center [&_a]:justify-center [&_a]:rounded-full [&_a]:border [&_a]:border-[color:var(--sotabosc-border)] [&_a]:px-4 [&_a]:py-2 [&_a]:text-sm [&_a]:font-semibold [&_a]:text-[color:var(--sotabosc-text)] [&_a]:transition-colors [&_a:hover]:bg-[color:var(--sotabosc-surface-muted)]">
              <PaginatedResourceSection
                connection={products}
                resourcesClassName="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              >
                {({node: product, index}) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border p-3 md:p-4 transition-shadow hover:shadow-md"
                    style={{
                      backgroundColor: 'var(--sotabosc-surface)',
                      borderColor: 'var(--sotabosc-border)',
                    }}
                  >
                    <ProductItem
                      product={product}
                      loading={index < 8 ? 'eager' : undefined}
                    />
                  </div>
                )}
              </PaginatedResourceSection>
            </div>
          </div>
        </section>
      </div>
    </DirectorySurface>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
    collections(first: 1) {
      nodes {
        id
        title
        handle
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

/** @typedef {import('./+types/collections.all').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
