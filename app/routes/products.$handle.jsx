import {useLoaderData} from 'react-router';
import {useState} from 'react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
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
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  console.log('[Product Loader] Route matched! Params:', params);
  console.log('[Product Loader] Request URL:', request.url);
  console.log('[Product Loader] Fetching product with handle:', handle);

  if (!handle) {
    console.error('[Product Loader] No handle in params:', params);
    throw new Error('Expected product handle to be defined');
  }

  try {
    const [{product}] = await Promise.all([
      storefront.query(PRODUCT_QUERY, {
        variables: {handle, selectedOptions: getSelectedProductOptions(request)},
      }),
      // Add other queries here, so that they are loaded in parallel
    ]);

    console.log('[Product Loader] Query result:', {
      hasProduct: !!product,
      productId: product?.id,
      productTitle: product?.title,
    });

    if (!product?.id) {
      console.error('[Product Loader] Product not found for handle:', handle);
      throw new Response(null, {status: 404});
    }

    // The API handle might be localized, so redirect to the localized handle
    redirectIfHandleIsLocalized(request, {handle, data: product});

    console.log('[Product Loader] Returning product:', product.title);

    return {
      product,
    };
  } catch (error) {
    console.error('[Product Loader] Error fetching product:', error);
    throw error;
  }
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  console.log('[ProductDetail] Component rendering...');
  
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();

  console.log('[ProductDetail] Loader data:', {product: product?.title, productId: product?.id});

  if (!product) {
    console.error('[ProductDetail] No product in loader data');
    return (
      <div className="product">
        <h1>Product Not Found</h1>
        <p>The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, images} = product;
  
  // State for selected image
  const allImages = images?.edges || [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedImage = allImages[selectedImageIndex]?.node || selectedVariant?.image;
  
  console.log('[ProductDetail] Rendering product:', title);
  console.log('[ProductDetail] All images:', allImages.length);
  console.log('[ProductDetail] Selected image index:', selectedImageIndex);

  return (
    <div className="product">
      <div className="product-image-container">
        {/* Main Image */}
        {allImages.length > 0 ? (
          <>
            <div className="product-image-main">
              <img
                src={selectedImage?.url || selectedVariant?.image?.url}
                alt={selectedImage?.altText || selectedVariant?.image?.altText || title}
                className="w-full h-full object-cover"
                style={{aspectRatio: '1/1'}}
              />
              {allImages.length > 1 && (
                <div className="product-image-counter">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>
            
            {/* Thumbnail Grid */}
            {allImages.length > 1 && (
              <div className="product-image-thumbnails">
                {allImages.map(({node: image}, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`product-image-thumbnail ${
                      selectedImageIndex === index ? 'selected' : ''
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <ProductImage image={selectedVariant?.image} />
        )}
      </div>
      <div className="product-main">
        <h1>{title}</h1>
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <br />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        <br />
        <br />
        <p>
          <strong>Description</strong>
        </p>
        <br />
        <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
        <br />
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
    </div>
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
