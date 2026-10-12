import type { CityEvent, Creator, Place, Review } from './types';
import { normalizeDomain } from './domains';

/** One consistent snapshot of the city, from Supabase or the repo seed. */
export type DirectorySnapshot = {
  places: Place[];
  events: CityEvent[];
  creators: Creator[];
  reviews: Review[];
  source: 'supabase' | 'seed';
};

function matchesDomain(
  primary: string,
  secondary: string[] | undefined,
  domain: string,
): boolean {
  const needle = normalizeDomain(domain);
  if (!needle) return false;
  if (normalizeDomain(primary) === needle) return true;
  return secondary?.some((s) => normalizeDomain(s) === needle) ?? false;
}

export function isEventExpired(event: CityEvent, fromISO?: string): boolean {
  const now = fromISO ? new Date(fromISO).getTime() : Date.now();
  const endMs = new Date(event.endsAt ?? event.startsAt).getTime();
  return endMs < now;
}

/** Lookup helpers over a snapshot; mirrors the old seed.server API. */
export function createDirectoryQueries(snapshot: DirectorySnapshot) {
  const { places, events, creators, reviews } = snapshot;
  const placeBySlug = new Map(places.map((p) => [p.slug, p]));
  const placeById = new Map(places.map((p) => [p.id, p]));

  const getActiveEvents = (fromISO?: string): CityEvent[] =>
    events
      .filter((e) => !isEventExpired(e, fromISO))
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return {
    ...snapshot,
    getPlaceBySlug: (slug: string) => placeBySlug.get(slug),
    getPlaceById: (id: string) => placeById.get(id),
    getEventBySlug: (slug: string) => events.find((e) => e.slug === slug),
    getCreatorBySlug: (slug: string) => creators.find((c) => c.slug === slug),
    getEventsForPlace: (placeId: string) => events.filter((e) => e.placeId === placeId),
    getReviewsForPlace: (placeId: string) => reviews.filter((r) => r.placeId === placeId),
    getPlacesByCategory: (cat: string) =>
      places.filter((p) => p.categories.includes(cat as Place['categories'][number])),
    getPlacesByDomain: (domain: string) =>
      places.filter((p) => matchesDomain(p.primaryDomain, p.secondaryDomains, domain)),
    getEventsByDomain: (domain: string) =>
      events.filter((e) => matchesDomain(e.primaryDomain, e.secondaryDomains, domain)),
    getCreatorsByDomain: (domain: string) =>
      creators.filter((c) => matchesDomain(c.primaryDomain, c.secondaryDomains, domain)),
    searchPlaces: (query: string) => {
      const q = query.toLowerCase();
      return places.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.neighborhood.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.includes(q)),
      );
    },
    searchEvents: (query: string) => {
      const q = query.toLowerCase();
      return events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.placeName?.toLowerCase().includes(q) ||
          e.tags?.some((t) => t.includes(q)),
      );
    },
    isEventExpired,
    getActiveEvents,
    getUpcomingEvents: getActiveEvents,
  };
}

export type DirectoryQueries = ReturnType<typeof createDirectoryQueries>;
