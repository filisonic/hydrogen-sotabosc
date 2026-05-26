import {Link, redirect, useLoaderData} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {DirectorySurface} from '~/components/directory/DirectorySurface';
import {canonicalLinkMeta} from '~/lib/seo/metaHelpers';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.collection?.title;
  const origin = data?.origin;
  return [
    {title: title ? `${title} — Sotabosc Shop` : 'Collection — Sotabosc'},
    {
      name: 'description',
      content: data?.collection?.description || `Browse ${title || 'this'} collection at Sotabosc.`,
    },
    ...(origin && data?.collection?.handle
      ? canonicalLinkMeta(origin, `/collections/${data.collection.handle}`)
      : []),
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    origin: new URL(request.url).origin,
  };
}

function loadDeferredData() {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();
  const productCount = collection.products?.nodes?.length ?? 0;

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
              <span style={{color: 'var(--sotabosc-text)'}}>{collection.title}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 font-[family-name:var(--font-display)]">
              {collection.title}
            </h1>
            {collection.description ? (
              <p className="text-lg max-w-2xl" style={{color: 'var(--sotabosc-muted)'}}>
                {collection.description}
              </p>
            ) : null}
          </div>
        </section>

        <section className="px-4 py-10 md:py-12">
          <div className="max-w-7xl mx-auto">
            {productCount === 0 ? (
              <p className="text-base" style={{color: 'var(--sotabosc-muted)'}}>
                No listings in this collection yet.{' '}
                <Link to="/collections/all" className="underline underline-offset-4">
                  Browse all products
                </Link>
                .
              </p>
            ) : (
              <div className="space-y-10 [&_a]:inline-flex [&_a]:items-center [&_a]:justify-center [&_a]:rounded-full [&_a]:border [&_a]:border-[color:var(--sotabosc-border)] [&_a]:px-4 [&_a]:py-2 [&_a]:text-sm [&_a]:font-semibold [&_a]:text-[color:var(--sotabosc-text)] [&_a]:transition-colors [&_a:hover]:bg-[color:var(--sotabosc-surface-muted)]">
                <PaginatedResourceSection
                  connection={collection.products}
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
            )}
          </div>
        </section>
      </div>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </DirectorySurface>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
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
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
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

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
