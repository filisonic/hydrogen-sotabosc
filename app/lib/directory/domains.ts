import type { DomainCategory, ListingCategory } from './types';

/** Five public ecosystem roles — microbes/Unseen retired from the picker. */
export type PublicDomainCategory = Exclude<DomainCategory, 'microbes'>;

export const PUBLIC_DOMAIN_KEYS: PublicDomainCategory[] = [
  'plants',
  'fungi',
  'animals',
  'algae',
  'earth',
];

/** One-word role verb per domain (messaging + league framing). */
export const DOMAIN_ROLES: Record<PublicDomainCategory, string> = {
  plants: 'Grow',
  fungi: 'Connect',
  animals: 'Activate',
  algae: 'Restore',
  earth: 'Ground',
};

export type ListingCategoryMeta = {
  label: string;
  defaultDomain: PublicDomainCategory;
  /** Short line under the category title on directory pages */
  blurb?: string;
};

export const DOMAINS: Record<
  DomainCategory,
  { label: string; emoji: string; color: string; description: string; role?: string }
> = {
  plants: {
    label: 'Plants',
    emoji: '🌳',
    color: '#22c55e',
    role: 'Grow',
    description: 'Root community — studios, gardens, and spaces people return to weekly',
  },
  algae: {
    label: 'Algae',
    emoji: '🌊',
    color: '#06b6d4',
    role: 'Restore',
    description: 'Flow and recovery — retreats, wellness, coastal rhythm',
  },
  fungi: {
    label: 'Fungi',
    emoji: '🍄',
    color: '#a855f7',
    role: 'Connect',
    description: 'Hidden networks — galleries, makers, fermentation, rooms that link people',
  },
  microbes: {
    label: 'Unseen',
    emoji: '✦',
    color: '#eab308',
    description: 'Legacy tag — maps to Fungi in the five-domain model',
  },
  animals: {
    label: 'Animals',
    emoji: '🐾',
    color: '#f97316',
    role: 'Activate',
    description: 'Motion and energy — venues, events, pop-ups, live culture',
  },
  earth: {
    label: 'Earth',
    emoji: '🪨',
    color: '#78716c',
    role: 'Ground',
    description: 'Daily ritual — coffee, food, craft, and material shops',
  },
};

/** Domain picker + public filters — five leagues only. */
export const DOMAIN_KEYS = PUBLIC_DOMAIN_KEYS;

/** Map retired or unknown domains to a public league. */
export function normalizeDomain(
  domain: string | null | undefined,
): PublicDomainCategory | null {
  if (!domain) return null;
  if (domain === 'microbes') return 'fungi';
  if (PUBLIC_DOMAIN_KEYS.includes(domain as PublicDomainCategory)) {
    return domain as PublicDomainCategory;
  }
  return null;
}

export function normalizeDomainList(
  domains: DomainCategory[] | undefined,
): PublicDomainCategory[] | undefined {
  if (!domains?.length) return undefined;
  const normalized = domains
    .map((d) => normalizeDomain(d))
    .filter((d): d is PublicDomainCategory => Boolean(d));
  const unique = [...new Set(normalized)];
  return unique.length ? unique : undefined;
}

export const LISTING_CATEGORIES: Record<ListingCategory, ListingCategoryMeta> = {
  coworking: { label: 'Coworking Spaces', defaultDomain: 'fungi' },
  'art-gallery': { label: 'Art Galleries', defaultDomain: 'fungi' },
  'music-venue': { label: 'Music & Events', defaultDomain: 'animals' },
  conference: { label: 'Conferences', defaultDomain: 'fungi' },
  workshop: {
    label: 'Workshops & classes',
    defaultDomain: 'fungi',
    blurb: 'Yoga, art, dance, music, cooking, languages — hands-on sessions and courses.',
  },
  retreat: {
    label: 'Retreats',
    defaultDomain: 'algae',
    blurb: 'Multi-day stays, meditation, and immersive wellness away from the everyday.',
  },
  'specialty-coffee': { label: 'Specialty Coffee', defaultDomain: 'earth' },
  restaurant: { label: 'Restaurants & Food', defaultDomain: 'earth' },
  shop: { label: 'Shops & Markets', defaultDomain: 'earth' },
  other: { label: 'Other', defaultDomain: 'earth' },
};

export const LISTING_CATEGORY_KEYS = Object.keys(LISTING_CATEGORIES) as ListingCategory[];

export function getDomain(key: DomainCategory | string) {
  const normalized = normalizeDomain(key) ?? (key in DOMAINS ? (key as DomainCategory) : null);
  if (normalized) return DOMAINS[normalized];
  return DOMAINS[key as DomainCategory];
}

export function getListingCategory(key: ListingCategory): ListingCategoryMeta {
  return LISTING_CATEGORIES[key];
}

/** Re-export for route modules that already import domain helpers (avoids duplicate `directoryRoutes` imports). */
export { directoryRoutes } from './routes';
