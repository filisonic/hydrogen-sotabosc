import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {motion} from 'framer-motion';
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
    context.storefront.query(COLLECTIONS_WITH_PRODUCTS_QUERY),
  ]);

  // Filter out automatic/system collections that Shopify creates
  const filteredCollections = (collections.nodes || []).filter((collection) => {
    const handle = collection.handle?.toLowerCase();
    // Exclude automatic collections like "home-page", "frontpage", etc.
    const excludedHandles = ['home-page', 'frontpage', 'homepage'];
    return !excludedHandles.includes(handle);
  });

  return {
    collections: filteredCollections,
  };
}

function loadDeferredData({context}) {
  return {};
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
                placeholder={false}
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
                What if art
                <br />
                <span className="text-black/90">was speculative</span>
                <br />
                <span className="text-black/70">world-building?</span>
              </motion.h1>
              
              <motion.p
                className="text-xl md:text-2xl text-black/80 mb-10 max-w-2xl leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Sotabosc explores speculative world-building through drawings and experiments shaped by noise, error, and disruption.
                Each work acts as a point of entry — a trace from a world in formation.
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

      {/* Collections Section */}
      <section className="py-24 md:py-36 px-4 section-divider">
        <div className="max-w-7xl mx-auto">
          <AnimateOnScroll direction="fade" delay={0.1}>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight lowercase tracking-wide">Collections</h2>
            <p className="text-xl md:text-2xl text-black/70 max-w-3xl leading-relaxed font-light">
              Browse our collections of original drawings and 3D printed artifacts
            </p>
          </AnimateOnScroll>

          <div className="mt-16">
            {data.collections && data.collections.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.collections.map((collection, index) => {
                  const firstProduct = collection.products?.nodes?.[0];
                  return (
                    <AnimateOnScroll key={collection.id} direction="up" delay={index * 0.1}>
                      <Link
                        to={`/collections/${collection.handle}`}
                        className="group block"
                      >
                        <div className="bg-white/50 rounded-xl overflow-hidden border border-black/10 hover:border-black/20 transition-all hover:shadow-lg">
                          {firstProduct?.featuredImage && (
                            <div className="aspect-square overflow-hidden">
                              <Image
                                alt={firstProduct.featuredImage.altText || firstProduct.title}
                                aspectRatio="1/1"
                                data={firstProduct.featuredImage}
                                loading={index < 3 ? 'eager' : 'lazy'}
                                sizes="(min-width: 45em) 400px, 100vw"
                                className="group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <h3 className="text-2xl font-bold mb-2 lowercase tracking-wide group-hover:opacity-70 transition-opacity">
                              {collection.title}
                            </h3>
                            {firstProduct && (
                              <p className="text-black/60 text-sm mb-2">{firstProduct.title}</p>
                            )}
                            {collection.products?.nodes?.length > 0 && (
                              <p className="text-black/40 text-xs">
                                {collection.products.nodes.length} {collection.products.nodes.length === 1 ? 'item' : 'items'}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </AnimateOnScroll>
                  );
                })}
              </div>
            ) : (
              <AnimateOnScroll direction="fade" delay={0.2}>
                <div className="text-center py-12">
                  <p className="text-lg text-black/60">
                    No collections available yet. Check back soon!
                  </p>
                </div>
              </AnimateOnScroll>
            )}
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
                  src="/images/contact/collaborate-image.jpg"
                  alt="Collaboration and partnership"
                  className="h-64 w-full"
                  aspectRatio="16/9"
                  placeholder={false}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
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
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
