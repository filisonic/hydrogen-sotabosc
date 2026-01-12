import {Await, useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {motion} from 'framer-motion';
import {ProductItem} from '~/components/ProductItem';
import AnimateOnScroll from '~/components/AnimateOnScroll';
import CustomButton from '~/components/CustomButton';
import CustomImage from '~/components/CustomImage';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Sotabosc | Speculative Futures Lab'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-light via-dark-bg to-yellow-dark opacity-30" />
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 md:order-1"
            >
              <CustomImage
                src="/images/hero/hero-image.jpg"
                alt="Sotabosc speculative futures"
                className="w-full h-full"
                aspectRatio="4/3"
                placeholder={true}
              />
            </motion.div>

            {/* Hero Content */}
            <div className="order-1 md:order-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <span className="text-sm text-black/60 uppercase tracking-[0.2em] font-medium">Sotabosc</span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                What if artifacts
                <br />
                <span className="text-black/90">were speculative</span>
                <br />
                <span className="text-black/70">worlds?</span>
              </motion.h1>
              
              <motion.p
                className="text-xl md:text-2xl text-black/80 mb-10 max-w-2xl leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Sotabosc explores world building, speculative fiction, philosophy, and spirituality through artifacts that serve as conversation starters and portals to alternative realities.
                <span className="block mt-2 text-lg text-black/60">Based in Barcelona</span>
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <CustomButton href="/collections/all" variant="primary" className="px-8 py-4 text-lg">
                  Shop Now
                </CustomButton>
                <CustomButton href="/labs" variant="secondary" className="px-8 py-4 text-lg">
                  Learn More
                </CustomButton>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 md:py-36 px-4 section-divider">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll direction="fade" delay={0.1}>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Featured Products</h2>
            <p className="text-xl md:text-2xl text-black/70 max-w-3xl leading-relaxed font-light">
              Original drawings and 3D printed items from the lab
            </p>
          </AnimateOnScroll>

          <div className="mt-16">
            <Suspense fallback={<ProductsLoadingState />}>
              <Await resolve={data.recommendedProducts}>
                {(response) => (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {response?.products?.nodes?.map((product, index) => (
                      <AnimateOnScroll key={product.id} direction="up" delay={index * 0.1}>
                        <ProductItem product={product} />
                      </AnimateOnScroll>
                    ))}
                  </div>
                )}
              </Await>
            </Suspense>
          </div>

          <AnimateOnScroll direction="fade" delay={0.3}>
            <div className="text-center mt-12">
              <CustomButton href="/collections/all" variant="secondary" className="px-8 py-4 text-lg">
                View All Products
              </CustomButton>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-36 px-4 section-divider">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">Collaborate With Us</h2>
              <p className="text-xl md:text-2xl text-black/70 mb-10 leading-relaxed font-light">
                Interested in partnering, collaborating, or learning more about our work? Get in touch.
              </p>
              <CustomButton href="/pages/contact" variant="primary" className="px-8 py-4 text-lg">
                Get in Touch
              </CustomButton>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-black/10 via-black/5 to-transparent rounded-2xl blur-2xl" />
              <div className="relative">
                <CustomImage
                  alt="Collaboration and partnership"
                  className="h-64 w-full"
                  aspectRatio="16/9"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductsLoadingState() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-black/5 rounded-xl h-64 animate-pulse" />
      ))}
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
