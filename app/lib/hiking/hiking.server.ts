import type { HikeRegion } from './types';
import { HIKE_REGIONS } from './types';
import { CATALUNYA_HIKES } from './catalunya.seed';

function isHikeRegion(s: string): s is HikeRegion {
  return Object.hasOwn(HIKE_REGIONS, s);
}

export function getCatalunyaHikes() {
  return CATALUNYA_HIKES;
}

export function getHikeBySlug(slug: string) {
  return CATALUNYA_HIKES.find((h) => h.slug === slug) ?? null;
}

export function getHikesByRegion(region: string) {
  if (!region || region === 'all' || !isHikeRegion(region)) {
    return CATALUNYA_HIKES;
  }
  return CATALUNYA_HIKES.filter((h) => h.region === region);
}

/** Normalizes `?region=` for UI + filtering. */
export function normalizeHikeRegionQuery(region: string | null): 'all' | HikeRegion {
  if (!region || region === 'all' || !isHikeRegion(region)) return 'all';
  return region;
}
