import type { DomainCategory, ListingCategory } from './types';

export const DOMAINS: Record<
  DomainCategory,
  { label: string; emoji: string; color: string; description: string }
> = {
  plants: {
    label: 'Plants',
    emoji: '🌳',
    color: '#22c55e',
    description: 'Rooted growth, gardens, green spaces',
  },
  algae: {
    label: 'Algae',
    emoji: '🌊',
    color: '#06b6d4',
    description: 'Flow, water, coastal rhythms',
  },
  fungi: {
    label: 'Fungi',
    emoji: '🍄',
    color: '#a855f7',
    description: 'Hidden networks, fermentation, underground culture',
  },
  microbes: {
    label: 'Microbes',
    emoji: '🦠',
    color: '#eab308',
    description: 'Invisible forces, biotech, fermentation science',
  },
  animals: {
    label: 'Animals',
    emoji: '🐾',
    color: '#f97316',
    description: 'Movement, instinct, community herds',
  },
  earth: {
    label: 'Earth',
    emoji: '🪨',
    color: '#78716c',
    description: 'Foundation, minerals, grounding practices',
  },
};

export const DOMAIN_KEYS = Object.keys(DOMAINS) as DomainCategory[];

export const LISTING_CATEGORIES: Record<
  ListingCategory,
  { label: string; defaultDomain: DomainCategory }
> = {
  coworking: { label: 'Coworking Spaces', defaultDomain: 'fungi' },
  'art-gallery': { label: 'Art Galleries', defaultDomain: 'plants' },
  'music-venue': { label: 'Music & Events', defaultDomain: 'animals' },
  conference: { label: 'Conferences', defaultDomain: 'microbes' },
  workshop: { label: 'Workshops', defaultDomain: 'fungi' },
  'specialty-coffee': { label: 'Specialty Coffee', defaultDomain: 'earth' },
  'spirituality-retreat': { label: 'Spirituality & Retreats', defaultDomain: 'algae' },
  'yoga-centre': { label: 'Yoga & Wellness', defaultDomain: 'algae' },
  restaurant: { label: 'Restaurants & Food', defaultDomain: 'earth' },
  shop: { label: 'Shops & Markets', defaultDomain: 'plants' },
  other: { label: 'Other', defaultDomain: 'earth' },
};

export const LISTING_CATEGORY_KEYS = Object.keys(LISTING_CATEGORIES) as ListingCategory[];

export function getDomain(key: DomainCategory) {
  return DOMAINS[key];
}

export function getListingCategory(key: ListingCategory) {
  return LISTING_CATEGORIES[key];
}
