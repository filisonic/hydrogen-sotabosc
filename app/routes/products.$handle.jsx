import {Link, useLoaderData} from 'react-router';
import {useState} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Image,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {DirectorySurface} from '~/components/directory/DirectorySurface';
import {canonicalLinkMeta} from '~/lib/seo/metaHelpers';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.product?.title;
  const origin = data?.origin;
  const handle = data?.product?.handle;
  return [
    {title: title ? `${title} — Sotabosc Shop` : 'Product — Sotabosc'},
    {
      name: 'description',
      content:
        data?.product?.seo?.description ||
        data?.product?.description ||
        (title ? `Shop ${title} at Sotabosc.` : 'Sotabosc shop listing.'),
    },
    ...(origin && handle ? canonicalLinkMeta(origin, `/products/${handle}`) : []),
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

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
    origin: new URL(request.url).origin,
  };
}

function loadDeferredData() {
  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();

  if (!product) {
    return <ProductNotFound />;
  }

  return <ProductDetail product={product} />;
}

/**
 * @param {{product: NonNullable<LoaderReturnData['product']>}} props
 */
function ProductDetail({product}) {
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, images} = product;
  const collection = product.collections?.nodes?.[0];
  const allImages = images?.edges || [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedImage =
    allImages[selectedImageIndex]?.node || selectedVariant?.image;
  const displayImage = selectedImage || selectedVariant?.image;

  return (
    <DirectorySurface>
      <div className="min-h-screen pt-20 md:pt-24">
        <section
          className="px-4 pb-6 pt-8 md:pt-10"
          style={{backgroundColor: 'var(--sotabosc-surface-muted)'}}
        >
          <div className="max-w-6xl mx-auto">
            <nav
              className="text-sm mb-4 flex flex-wrap items-center gap-x-2 gap-y-1"
              style={{color: 'var(--sotabosc-muted)'}}
            >
              <Link to="/collections" className="underline-offset-4 hover:underline">
                Shop
              </Link>
              {collection ? (
                <>
                  <span className="opacity-60">/</span>
                  <Link
                    to={`/collections/${collection.handle}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {collection.title}
                  </Link>
                </>
              ) : null}
              <span className="opacity-60">/</span>
              <span style={{color: 'var(--sotabosc-text)'}}>{title}</span>
            </nav>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{color: 'var(--sotabosc-muted)'}}
            >
              Listing
            </p>
          </div>
        </section>

        <section className="px-4 py-10 md:py-12">
          <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
            <div
              className="rounded-2xl border p-3 md:p-4"
              style={{
                backgroundColor: 'var(--sotabosc-surface)',
                borderColor: 'var(--sotabosc-border)',
              }}
            >
              {displayImage ? (
                <div className="space-y-4">
                  <div
                    className="relative aspect-square overflow-hidden rounded-xl"
                    style={{backgroundColor: 'var(--sotabosc-surface-muted)'}}
                  >
                    {allImages.length > 0 && displayImage.url ? (
                      <Image
                        alt={displayImage.altText || title}
                        aspectRatio="1/1"
                        data={displayImage}
                        className="h-full w-full object-cover"
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        loading="eager"
                      />
                    ) : (
                      <ProductImage image={selectedVariant?.image} />
                    )}
                    {allImages.length > 1 ? (
                      <span
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--sotabosc-text) 72%, transparent)',
                          color: 'var(--sotabosc-surface)',
                        }}
                      >
                        {selectedImageIndex + 1} / {allImages.length}
                      </span>
                    ) : null}
                  </div>

                  {allImages.length > 1 ? (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {allImages.map(({node: image}, index) => (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className="aspect-square overflow-hidden rounded-lg border-2 transition-transform hover:scale-[1.02]"
                          style={{
                            borderColor:
                              selectedImageIndex === index
                                ? 'var(--sotabosc-accent)'
                                : 'var(--sotabosc-border)',
                            backgroundColor: 'var(--sotabosc-surface-muted)',
                          }}
                          aria-label={`View image ${index + 1}`}
                          aria-current={selectedImageIndex === index}
                        >
                          <img
                            src={image.url}
                            alt={image.altText || title}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  className="flex aspect-square items-center justify-center rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--sotabosc-surface-muted)',
                    color: 'var(--sotabosc-muted)',
                  }}
                >
                  No image
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-28 space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight font-[family-name:var(--font-display)]">
                  {title}
                </h1>
                {product.vendor ? (
                  <p className="mt-2 text-sm" style={{color: 'var(--sotabosc-muted)'}}>
                    {product.vendor}
                  </p>
                ) : null}
              </div>

              <div
                className="text-2xl md:text-3xl font-bold tabular-nums"
                style={{color: 'var(--sotabosc-text)'}}
              >
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                />
              </div>

              <div
                className="product-detail-form rounded-2xl border p-5 md:p-6 [&_.product-form]:space-y-5 [&_.product-options_h5]:text-xs [&_.product-options_h5]:font-semibold [&_.product-options_h5]:uppercase [&_.product-options_h5]:tracking-widest [&_.product-options_h5]:mb-2 [&_.product-options-grid]:flex [&_.product-options-grid]:flex-wrap [&_.product-options-grid]:gap-2 [&_.product-options-item]:rounded-full [&_.product-options-item]:px-4 [&_.product-options-item]:py-2 [&_.product-options-item]:text-sm [&_.product-options-item]:font-medium [&_.product-options-item]:transition-colors [&_button[type=submit]]:inline-flex [&_button[type=submit]]:w-full [&_button[type=submit]]:items-center [&_button[type=submit]]:justify-center [&_button[type=submit]]:rounded-full [&_button[type=submit]]:px-6 [&_button[type=submit]]:py-3 [&_button[type=submit]]:text-sm [&_button[type=submit]]:font-semibold [&_button[type=submit]]:border-0 [&_button[type=submit]]:cursor-pointer [&_button[type=submit]]:transition-opacity [&_button[type=submit]]:hover:opacity-90 [&_button[type=submit]]:disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--sotabosc-surface-muted)',
                  borderColor: 'var(--sotabosc-border)',
                  '--product-option-border': 'var(--sotabosc-border)',
                  '--product-option-selected': 'var(--sotabosc-accent)',
                }}
              >
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                />
              </div>

              {/* Shipping summary */}
              <div className="space-y-3">
                <h2
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{color: 'var(--sotabosc-muted)'}}
                >
                  Shipping
                </h2>
                <div
                  className="text-base leading-relaxed"
                  style={{color: 'var(--sotabosc-text)'}}
                >
                  <p>
                    Ships unframed, paper only, flat in a rigid mailer from Barcelona.
                    {' '}Spain €6.99 (free over €55) · EU €8.99 · International €12.99.
                    {' '}See{' '}
                    <Link to="/policies/shipping-policy" className="underline underline-offset-4">
                      Shipping policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

              {descriptionHtml ? (
                <div className="space-y-3">
                  <h2
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{color: 'var(--sotabosc-muted)'}}
                  >
                    About this piece
                  </h2>
                  <div
                    className="product-detail-description text-base leading-relaxed max-w-prose [&_a]:underline [&_a]:underline-offset-4 [&_p+p]:mt-4"
                    style={{color: 'var(--sotabosc-text)'}}
                    dangerouslySetInnerHTML={{__html: descriptionHtml}}
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2">
                {collection ? (
                  <Link
                    to={`/collections/${collection.handle}`}
                    className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
                    style={{
                      borderColor: 'var(--sotabosc-border)',
                      color: 'var(--sotabosc-text)',
                    }}
                  >
                    More in {collection.title}
                  </Link>
                ) : null}
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
              </div>
            </div>
          </div>
        </section>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </DirectorySurface>
  );
}

function ProductNotFound() {
  return (
    <DirectorySurface>
      <div className="min-h-screen pt-20 md:pt-24 px-4 py-16 max-w-2xl mx-auto">
        <h1 className="text-3xl font-black font-[family-name:var(--font-display)]">
          Product not found
        </h1>
        <p className="mt-3" style={{color: 'var(--sotabosc-muted)'}}>
          This listing is no longer available.{' '}
          <Link to="/collections/all" className="underline underline-offset-4">
            Browse the shop
          </Link>
          .
        </p>
      </div>
    </DirectorySurface>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    collections(first: 1) {
      nodes {
        id
        title
        handle
      }
    }
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
          width
          height
        }
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
