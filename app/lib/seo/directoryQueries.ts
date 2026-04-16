import type { ListingCategory } from '../directory/types';

/** First city skin; expand when you add more cities. */
export const DIRECTORY_CITY = {
  slug: 'barcelona',
  name: 'Barcelona',
} as const;

/**
 * How we map organic queries to routes. Guides use the same category URL — no separate /best URLs
 * until you have truly distinct long-form content.
 */
export type DirectoryUrlStrategy = 'category' | 'city_hub';

export type PrioritySearchQuery = {
  /** Representative query (lowercase, how people type). */
  query: string;
  strategy: DirectoryUrlStrategy;
  /** Target path without origin, e.g. `/city/categories/art-gallery` */
  path: string;
  /** Listing category when strategy is `category`. */
  category?: ListingCategory;
  notes?: string;
};

/**
 * Prioritized queries for content and meta alignment. One primary landing URL per category
 * (semi-programmatic SEO); long-tail phrases are satisfied by the same page plus on-page copy.
 */
export const PRIORITY_SEARCH_QUERIES: readonly PrioritySearchQuery[] = [
  {
    query: 'best art galleries barcelona',
    strategy: 'category',
    path: '/city/categories/art-gallery',
    category: 'art-gallery',
    notes: 'Head term; category landing + curated picks + ItemList schema',
  },
  {
    query: 'contemporary art galleries barcelona',
    strategy: 'category',
    path: '/city/categories/art-gallery',
    category: 'art-gallery',
  },
  {
    query: 'art galleries gracia barcelona',
    strategy: 'category',
    path: '/city/categories/art-gallery',
    category: 'art-gallery',
    notes: 'Neighborhood detail in listings and copy',
  },
  {
    query: 'best coworking spaces barcelona',
    strategy: 'category',
    path: '/city/categories/coworking',
    category: 'coworking',
  },
  {
    query: 'coworking poblenou barcelona',
    strategy: 'category',
    path: '/city/categories/coworking',
    category: 'coworking',
  },
  {
    query: 'specialty coffee barcelona',
    strategy: 'category',
    path: '/city/categories/specialty-coffee',
    category: 'specialty-coffee',
  },
  {
    query: 'best coffee shops barcelona eixample',
    strategy: 'category',
    path: '/city/categories/specialty-coffee',
    category: 'specialty-coffee',
  },
  {
    query: 'live music venues barcelona',
    strategy: 'category',
    path: '/city/categories/music-venue',
    category: 'music-venue',
  },
  {
    query: 'independent music venues barcelona',
    strategy: 'category',
    path: '/city/categories/music-venue',
    category: 'music-venue',
  },
  {
    query: 'yoga studios barcelona',
    strategy: 'category',
    path: '/city/categories/workshop',
    category: 'workshop',
    notes: 'Workshop category covers yoga / classes',
  },
  {
    query: 'meditation retreat barcelona',
    strategy: 'category',
    path: '/city/categories/retreat',
    category: 'retreat',
  },
  {
    query: 'design conferences barcelona',
    strategy: 'category',
    path: '/city/categories/conference',
    category: 'conference',
  },
  {
    query: 'maker space workshop barcelona',
    strategy: 'category',
    path: '/city/categories/workshop',
    category: 'workshop',
  },
  {
    query: 'sustainable restaurants barcelona',
    strategy: 'category',
    path: '/city/categories/restaurant',
    category: 'restaurant',
  },
  {
    query: 'vegetarian restaurant barcelona',
    strategy: 'category',
    path: '/city/categories/restaurant',
    category: 'restaurant',
  },
  {
    query: 'local markets barcelona raval',
    strategy: 'category',
    path: '/city/categories/shop',
    category: 'shop',
  },
  {
    query: 'eco design shops barcelona',
    strategy: 'category',
    path: '/city/categories/shop',
    category: 'shop',
  },
  {
    query: 'things to do barcelona creative',
    strategy: 'city_hub',
    path: '/city',
    notes: 'Brand/solarpunk angle on city hub',
  },
  {
    query: 'barcelona creative directory',
    strategy: 'city_hub',
    path: '/city',
  },
];

export function priorityQueriesForCategory(
  category: ListingCategory,
): readonly PrioritySearchQuery[] {
  return PRIORITY_SEARCH_QUERIES.filter((q) => q.category === category);
}
