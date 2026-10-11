import { filterStoreCollections } from '~/lib/store/filterStoreCollections';
import { getCityDirectory } from '~/lib/directory/source.server';
import { buildCity } from './citizens.server';
import { getCityContext } from './context.server';

/**
 * Data for the city pages. The homepage map only needs the city itself; the
 * explanatory pages (`full`) also take the directory feed and the store collections.
 *
 * @param {import('react-router').LoaderFunctionArgs} args
 * @param {{ full?: boolean }} [options]
 */
export async function loadCityPage({ context }, { full = false } = {}) {
  const [cityContext, { places, creators, getUpcomingEvents }, collections] = await Promise.all([
    getCityContext(),
    getCityDirectory(context),
    full
      ? context.storefront
          .query(COLLECTIONS_WITH_PRODUCTS_QUERY)
          .then((data) => filterStoreCollections(data.collections.nodes || []))
          .catch((error) => {
            console.error('City page collections error:', error);
            return [];
          })
      : [],
  ]);

  const upcoming = getUpcomingEvents();
  const city = buildCity({ places, events: upcoming, creators });
  if (!full) return { city, cityContext };

  const citizenSlugs = new Set(city.citizens.map((c) => c.slug));
  return {
    city,
    cityContext,
    collections,
    directory: {
      places: places.filter((p) => citizenSlugs.has(p.slug)),
      events: upcoming.slice(0, 14),
      creators,
    },
  };
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
