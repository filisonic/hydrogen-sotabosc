import type { ListingCategory, DomainCategory } from './types';

export const CITY_ROOT = '/city';

export const directoryRoutes = {
  city: () => CITY_ROOT,
  category: (cat: ListingCategory) => `${CITY_ROOT}/categories/${cat}`,
  place: (slug: string) => `${CITY_ROOT}/places/${slug}`,
  events: () => `${CITY_ROOT}/events`,
  event: (slug: string) => `${CITY_ROOT}/events/${slug}`,
  creators: () => `${CITY_ROOT}/creators`,
  creator: (slug: string) => `${CITY_ROOT}/creators/${slug}`,
  hikes: () => `${CITY_ROOT}/hikes`,
  hike: (slug: string) => `${CITY_ROOT}/hikes/${slug}`,
  neighborhood: (slug: string) => `${CITY_ROOT}/neighbourhoods/${slug}`,
  guides: () => `${CITY_ROOT}/guides`,
  guide: (slug: string) => `${CITY_ROOT}/guides/${slug}`,
  domain: (d: DomainCategory) => `${CITY_ROOT}?domain=${d}`,
  feedback: () => '/feedback',
} as const;
