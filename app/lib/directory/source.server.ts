import { CacheCustom, createWithCache } from '@shopify/hydrogen';

import type { CityEvent, Creator, DomainCategory, ListingCategory, Place } from './types';
import { normalizeDomain } from './domains';
import { createDirectoryQueries, type DirectoryQueries, type DirectorySnapshot } from './queries';
import { SEED_PLACES, SEED_REVIEWS, SEED_SNAPSHOT } from './seed.server';

/**
 * The persistent city: places, events and creators from Supabase (anon key, public-read tables),
 * cached at the edge. Falls back to the repo seed when Supabase is not configured or fails, so a
 * Supabase outage never takes city pages down. Reviews stay seed-only for now.
 */

const CITY_TIME_ZONE = 'Europe/Madrid';
const PAGE_SIZE = 1000;
const CACHE_KEY = ['sotabosc', 'city-directory', 'v3-oct-import'];
// Edits in Supabase show within ~5 minutes; stale copies keep serving for a day if Supabase is down.
const CACHE_STRATEGY = CacheCustom({ mode: 'public', maxAge: 300, staleWhileRevalidate: 86400 });

type Row = Record<string, unknown>;

type DirectoryContext = {
  env: { PUBLIC_SUPABASE_URL?: string; PUBLIC_SUPABASE_ANON_KEY?: string };
  withCache?: ReturnType<typeof createWithCache>;
};

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() !== '' ? v : undefined;

const num = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

const strArray = (v: unknown): string[] | undefined =>
  Array.isArray(v) && v.length ? v.filter((x): x is string => typeof x === 'string') : undefined;

function domain(v: unknown, fallback: DomainCategory): DomainCategory {
  return (normalizeDomain(str(v) ?? '') as DomainCategory) || fallback;
}

function domains(v: unknown): DomainCategory[] | undefined {
  const list = strArray(v)
    ?.map((d) => normalizeDomain(d) as DomainCategory)
    .filter(Boolean);
  return list?.length ? list : undefined;
}

/** timestamptz → Barcelona wall-clock `YYYY-MM-DDTHH:mm`, the format every component expects. */
export function toCityWallClock(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return undefined;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: CITY_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function mapPlaceRow(row: Row, seedBySlug: Map<string, Place>): Place | null {
  const slug = str(row.slug);
  const name = str(row.name);
  if (!slug || !name) return null;
  const seed = seedBySlug.get(slug);
  return {
    ...seed,
    id: str(row.legacy_id) ?? seed?.id ?? slug,
    slug,
    name,
    summary: str(row.summary) ?? seed?.summary ?? '',
    address: str(row.address) ?? seed?.address ?? '',
    neighborhood: str(row.neighborhood) ?? seed?.neighborhood ?? '',
    city: str(row.city) ?? 'Barcelona',
    categories: (strArray(row.categories) as ListingCategory[] | undefined) ?? seed?.categories ?? [],
    primaryDomain: domain(row.primary_domain, seed?.primaryDomain ?? 'earth'),
    secondaryDomains: domains(row.secondary_domains) ?? seed?.secondaryDomains,
    tags: strArray(row.tags) ?? seed?.tags,
    website: str(row.website) ?? seed?.website,
    imageUrl: str(row.image_url) ?? seed?.imageUrl,
    isClaimed: row.is_claimed === true || seed?.isClaimed === true || undefined,
    telephone: str(row.telephone) ?? seed?.telephone,
    latitude: num(row.latitude) ?? seed?.latitude,
    longitude: num(row.longitude) ?? seed?.longitude,
    openingHours: (Array.isArray(row.opening_hours) && row.opening_hours.length
      ? row.opening_hours
      : seed?.openingHours) as Place['openingHours'],
  };
}

export function mapEventRow(row: Row, placeIdBySlug: Map<string, string>): CityEvent | null {
  const id = str(row.id);
  const slug = str(row.slug);
  const title = str(row.title);
  const startsAt = toCityWallClock(row.starts_at);
  if (!id || !slug || !title || !startsAt) return null;
  const placeSlug = str(row.place_slug);
  return {
    id,
    slug,
    title,
    summary: str(row.summary) ?? '',
    startsAt,
    endsAt: toCityWallClock(row.ends_at),
    placeId: str(row.place_id) ?? (placeSlug ? placeIdBySlug.get(placeSlug) : undefined) ?? '',
    placeName: str(row.place_name),
    primaryDomain: domain(row.primary_domain, 'animals'),
    secondaryDomains: domains(row.secondary_domains),
    tags: strArray(row.tags),
    imageUrl: str(row.image_url),
    sourceUrl: str(row.booking_url),
  };
}

export function mapCreatorRow(row: Row): Creator | null {
  const id = str(row.id);
  const slug = str(row.slug);
  const displayName = str(row.display_name);
  if (!id || !slug || !displayName) return null;
  return {
    id,
    slug,
    displayName,
    bio: str(row.bio) ?? '',
    city: str(row.city) ?? 'Barcelona',
    primaryDomain: domain(row.primary_domain, 'plants'),
    secondaryDomains: domains(row.secondary_domains),
    productCollectionHandle: str(row.product_collection_handle),
    websiteUrl: str(row.website_url),
    imageUrl: str(row.image_url),
  };
}

async function fetchTable(url: string, key: string, table: string, select: string): Promise<Row[]> {
  const all: Row[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const res = await fetch(`${url}/rest/v1/${table}?select=${select}&order=${table === 'directory_places' ? 'slug' : 'id'}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
        Range: `${from}-${from + PAGE_SIZE - 1}`,
      },
    });
    if (!res.ok) throw new Error(`Supabase ${table} HTTP ${res.status}`);
    const rows = (await res.json()) as Row[];
    all.push(...rows);
    if (rows.length < PAGE_SIZE) return all;
  }
}

// Only the columns the site renders; consent and booking fields stay out of the page payload.
const PLACE_COLUMNS =
  'slug,legacy_id,name,summary,address,neighborhood,city,categories,primary_domain,secondary_domains,tags,website,image_url,is_claimed,telephone,latitude,longitude,opening_hours';
const EVENT_COLUMNS =
  'id,slug,title,summary,starts_at,ends_at,place_id,place_slug,place_name,primary_domain,secondary_domains,tags,image_url,booking_url';
const CREATOR_COLUMNS =
  'id,slug,display_name,bio,city,primary_domain,secondary_domains,product_collection_handle,website_url,image_url';

export async function fetchSupabaseSnapshot(url: string, key: string): Promise<DirectorySnapshot> {
  const [placeRows, eventRows, creatorRows] = await Promise.all([
    fetchTable(url, key, 'directory_places', PLACE_COLUMNS),
    fetchTable(url, key, 'directory_events', EVENT_COLUMNS),
    fetchTable(url, key, 'directory_creators', CREATOR_COLUMNS),
  ]);

  const seedBySlug = new Map(SEED_PLACES.map((p) => [p.slug, p]));
  const places = placeRows
    .map((r) => mapPlaceRow(r, seedBySlug))
    .filter((p): p is Place => p != null);
  const placeIdBySlug = new Map(places.map((p) => [p.slug, p.id]));

  return {
    places,
    events: eventRows.map((r) => mapEventRow(r, placeIdBySlug)).filter((e): e is CityEvent => e != null),
    creators: creatorRows.map(mapCreatorRow).filter((c): c is Creator => c != null),
    reviews: SEED_REVIEWS,
    source: 'supabase',
  };
}

async function loadSnapshot(context: DirectoryContext): Promise<DirectorySnapshot> {
  const url = context.env.PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = context.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return SEED_SNAPSHOT;

  try {
    const load = () => fetchSupabaseSnapshot(url, key);
    const snapshot = context.withCache
      ? await context.withCache.run(
          {
            cacheKey: CACHE_KEY,
            cacheStrategy: CACHE_STRATEGY,
            shouldCacheResult: (s) => s.places.length > 0,
          },
          load,
        )
      : await load();
    if (!snapshot.places.length) throw new Error('Supabase returned no places');
    return snapshot;
  } catch (error) {
    console.error('City directory: Supabase unavailable, serving seed.', error);
    return SEED_SNAPSHOT;
  }
}

const perRequest = new WeakMap<object, Promise<DirectoryQueries>>();

/** City directory for this request; loaders share one fetch per request. */
export function getCityDirectory(context: DirectoryContext): Promise<DirectoryQueries> {
  let pending = perRequest.get(context);
  if (!pending) {
    pending = loadSnapshot(context).then(createDirectoryQueries);
    perRequest.set(context, pending);
  }
  return pending;
}
