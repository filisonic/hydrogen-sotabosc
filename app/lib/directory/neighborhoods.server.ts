import type { Place } from './types';
import { SEED_PLACES } from './seed.server';

/** Minimum listings so a neighbourhood hub is not a thin doorway page. */
export const NEIGHBORHOOD_MIN_PLACES = 3;

const ACCENT_REGEX = /\p{M}/gu;

export function neighborhoodSlug(label: string): string {
  return label
    .normalize('NFD')
    .replace(ACCENT_REGEX, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export type NeighborhoodIndexEntry = {
  slug: string;
  label: string;
  placeCount: number;
};

export function getNeighborhoodIndex(): NeighborhoodIndexEntry[] {
  const byLabel = new Map<string, Place[]>();
  for (const p of SEED_PLACES) {
    const key = p.neighborhood.trim();
    if (!key) continue;
    const list = byLabel.get(key) ?? [];
    list.push(p);
    byLabel.set(key, list);
  }

  const out: NeighborhoodIndexEntry[] = [];
  for (const [label, places] of byLabel) {
    if (places.length < NEIGHBORHOOD_MIN_PLACES) continue;
    out.push({
      slug: neighborhoodSlug(label),
      label,
      placeCount: places.length,
    });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

export function getNeighborhoodSitemapSlugs(): string[] {
  return getNeighborhoodIndex().map((n) => n.slug);
}

export function getPlacesByNeighborhoodSlug(slug: string): { label: string; places: Place[] } | null {
  const byLabel = new Map<string, Place[]>();
  for (const p of SEED_PLACES) {
    const key = p.neighborhood.trim();
    if (!key) continue;
    const list = byLabel.get(key) ?? [];
    list.push(p);
    byLabel.set(key, list);
  }

  for (const [label, places] of byLabel) {
    if (places.length < NEIGHBORHOOD_MIN_PLACES) continue;
    if (neighborhoodSlug(label) === slug) {
      return { label, places: [...places].sort((a, b) => a.name.localeCompare(b.name)) };
    }
  }
  return null;
}
