import type { CityEvent, Creator, Place } from './types';
import { resolveEventImageUrl, resolvePlaceImageUrl } from './sceneVisuals';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Hand-picked place slugs for Local Edit / lead fallback (category landing overlap). */
export const EDITION_FEATURED_PLACE_SLUGS = [
  'tres-punts-gallery',
  'house-of-chappaz',
  'load-gallery',
  'angels-barcelona',
  'nogueras-blanchard',
  'blueproject-foundation',
  'roast-club-cafe',
  'la-papa-coffee',
  'disseny-hub',
  'nothrow-design',
] as const;

/** Prefer these creators when present in the directory pack. */
export const EDITION_FEATURED_CREATOR_SLUGS = [
  'irmi-salleras',
  'joan-pallis',
  'naia-torres',
  'clara-bolet',
  'nora-fecht',
  'eli-canudas',
] as const;

export type EditionPlaceCard = Place & { imageUrl: string | null };
export type EditionEventCard = CityEvent & {
  imageUrl: string | null;
  place?: Place | null;
};

export type EditionWindow = {
  editionLabel: string;
  editionCity: string;
  windowDays: number;
  issueNumeral: string;
  happening: EditionEventCard[];
  exhibitions: EditionEventCard[];
  artists: Creator[];
  localEdit: EditionPlaceCard[];
  featured: EditionEventCard | EditionPlaceCard | null;
  totals: { places: number; events: number; creators: number };
};

function parseInstant(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : NaN;
}

/** Events active or starting within the last `days` / next horizon. */
export function eventsInCulturalWindow(
  events: CityEvent[],
  opts: { now?: Date; lookbackDays?: number; lookaheadDays?: number } = {},
): CityEvent[] {
  const now = opts.now ?? new Date();
  const lookback = (opts.lookbackDays ?? 30) * DAY_MS;
  const lookahead = (opts.lookaheadDays ?? 45) * DAY_MS;
  const nowMs = now.getTime();
  const from = nowMs - lookback;
  const to = nowMs + lookahead;

  return events
    .filter((ev) => {
      const start = parseInstant(ev.startsAt);
      if (!Number.isFinite(start)) return false;
      const end = ev.endsAt ? parseInstant(ev.endsAt) : start;
      const endMs = Number.isFinite(end) ? end : start;
      // Overlaps [from, to]
      return endMs >= from && start <= to;
    })
    .sort((a, b) => parseInstant(a.startsAt) - parseInstant(b.startsAt));
}

function isExhibitionish(ev: CityEvent): boolean {
  const tags = (ev.tags ?? []).join(' ').toLowerCase();
  const blob = `${ev.title} ${ev.summary} ${tags}`.toLowerCase();
  return (
    blob.includes('exhibition') ||
    blob.includes('gallery') ||
    blob.includes('opening') ||
    blob.includes('solo') ||
    blob.includes('instal') ||
    tags.includes('painting') ||
    tags.includes('sculpture') ||
    tags.includes('digital-art')
  );
}

function withPlaceImage(
  place: Place,
  eventImageByPlaceSlug: Map<string, string>,
): EditionPlaceCard {
  return {
    ...place,
    imageUrl:
      place.imageUrl ||
      eventImageByPlaceSlug.get(place.slug) ||
      resolvePlaceImageUrl(place) ||
      null,
  };
}

function rankBySlugThenImage<T extends { slug: string; imageUrl?: string | null }>(
  items: T[],
  preferred: readonly string[],
): T[] {
  const rank = new Map(preferred.map((slug, i) => [slug, i]));
  return [...items].sort((a, b) => {
    const ra = rank.has(a.slug) ? (rank.get(a.slug) as number) : preferred.length + 1;
    const rb = rank.has(b.slug) ? (rank.get(b.slug) as number) : preferred.length + 1;
    if (ra !== rb) return ra - rb;
    const ai = a.imageUrl ? 0 : 1;
    const bi = b.imageUrl ? 0 : 1;
    return ai - bi;
  });
}

function preferWithImage<T extends { imageUrl?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ai = a.imageUrl ? 0 : 1;
    const bi = b.imageUrl ? 0 : 1;
    return ai - bi;
  });
}

/**
 * Build a Barcelona Edition pack from directory data for the magazine homepage.
 */
export function buildEditionWindow(
  places: Place[],
  events: CityEvent[],
  creators: Creator[],
  opts: { now?: Date; city?: string } = {},
): EditionWindow {
  const city = opts.city ?? 'Barcelona';
  const placeById = new Map(places.map((p) => [p.id, p]));
  const windowEvents = eventsInCulturalWindow(events, {
    now: opts.now,
    lookbackDays: 30,
    lookaheadDays: 45,
  });

  const eventImageByPlaceSlug = new Map<string, string>();
  for (const ev of events) {
    const place = ev.placeId ? placeById.get(ev.placeId) : null;
    if (!place || eventImageByPlaceSlug.has(place.slug)) continue;
    const img = resolveEventImageUrl(ev, place);
    if (img) eventImageByPlaceSlug.set(place.slug, img);
  }

  const enrichEvent = (ev: CityEvent): EditionEventCard => {
    const place = ev.placeId ? placeById.get(ev.placeId) ?? null : null;
    return {
      ...ev,
      place,
      imageUrl: resolveEventImageUrl(ev, place) || place?.imageUrl || null,
    };
  };

  const happening = preferWithImage(windowEvents.map(enrichEvent));
  const exhibitions = preferWithImage(
    happening.filter(isExhibitionish),
  ).slice(0, 6);

  const galleries = places
    .filter((p) => p.categories.includes('art-gallery'))
    .map((p) => withPlaceImage(p, eventImageByPlaceSlug));
  const designLed = places
    .filter(
      (p) =>
        p.categories.includes('specialty-coffee') ||
        p.categories.includes('shop') ||
        p.categories.includes('workshop') ||
        p.categories.includes('coworking'),
    )
    .map((p) => withPlaceImage(p, eventImageByPlaceSlug));

  const localPool = [...galleries, ...designLed].filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
  );
  const localEdit = rankBySlugThenImage(
    localPool,
    EDITION_FEATURED_PLACE_SLUGS,
  ).slice(0, 8);

  const featuredFromExhibitions = exhibitions.find((e) => e.imageUrl) || exhibitions[0];
  const featuredFromHappening = happening.find((e) => e.imageUrl);
  const featuredFromPlaces = localEdit.find((p) => p.imageUrl) || localEdit[0] || null;
  const featured =
    featuredFromExhibitions || featuredFromHappening || featuredFromPlaces || null;

  const creatorRank = new Map(
    EDITION_FEATURED_CREATOR_SLUGS.map((slug, i) => [slug, i]),
  );
  const artists = [...creators]
    .sort((a, b) => {
      const ra = creatorRank.has(a.slug)
        ? (creatorRank.get(a.slug) as number)
        : EDITION_FEATURED_CREATOR_SLUGS.length + 1;
      const rb = creatorRank.has(b.slug)
        ? (creatorRank.get(b.slug) as number)
        : EDITION_FEATURED_CREATOR_SLUGS.length + 1;
      if (ra !== rb) return ra - rb;
      const ai = a.imageUrl || (a.bio && a.bio.length > 40) ? 0 : 1;
      const bi = b.imageUrl || (b.bio && b.bio.length > 40) ? 0 : 1;
      return ai - bi;
    })
    .slice(0, 6);

  const now = opts.now ?? new Date();
  const month = now.toLocaleString('en-GB', { month: 'long', timeZone: 'Europe/Madrid' });
  const year = now.toLocaleString('en-GB', { year: 'numeric', timeZone: 'Europe/Madrid' });
  const issueNumeral = now.toLocaleString('en-GB', {
    month: 'numeric',
    timeZone: 'Europe/Madrid',
  });

  return {
    editionLabel: `${city} Edition · ${month} ${year}`,
    editionCity: city,
    windowDays: 30,
    issueNumeral,
    happening: happening.slice(0, 10),
    exhibitions,
    artists,
    localEdit,
    featured,
    totals: {
      places: places.length,
      events: events.length,
      creators: creators.length,
    },
  };
}
