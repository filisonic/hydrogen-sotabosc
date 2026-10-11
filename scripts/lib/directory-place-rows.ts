import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Place } from '../../app/lib/directory/types';
import { normalizeDomain } from '../../app/lib/directory/domains';
import {
  SEED_CREATORS,
  SEED_EVENTS,
  SEED_PLACES,
} from '../../app/lib/directory/seed.server';
import { PROJECT_ROOT } from './project-env';

const AUTO_FILE = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'auto-import.places.json');
const AUTO_EVENTS_FILE = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'auto-import.events.json');
const DIRECTORY_BASE = 'https://directory.sotabosc.world/places';
const CITY_BASE = 'https://sotabosc.world/city';
const CITY_TIME_ZONE = 'Europe/Madrid';

export type DirectoryPlaceRow = {
  slug: string;
  name: string;
  city: string;
  neighborhood: string | null;
  address: string | null;
  website: string | null;
  telephone: string | null;
  categories: string[];
  primary_domain: string | null;
  source: 'curated' | 'auto-import';
  directory_url: string;
  synced_at: string;
  legacy_id: string;
  summary: string;
  secondary_domains: string[] | null;
  tags: string[];
  image_url: string | null;
  /** Written on first insert only; after that the database owns claim status. */
  is_claimed: boolean;
  latitude: number | null;
  longitude: number | null;
  opening_hours: Place['openingHours'] | null;
};

function sqlEscape(s: string): string {
  return s.replace(/'/g, "''");
}

function sqlText(v: string | null | undefined): string {
  if (v == null || v === '') return 'null';
  return `'${sqlEscape(v)}'`;
}

function sqlArray(arr: string[]): string {
  if (!arr.length) return 'ARRAY[]::text[]';
  return `ARRAY[${arr.map((c) => sqlText(c)).join(', ')}]::text[]`;
}

async function autoImportSlugs(file = AUTO_FILE): Promise<Set<string>> {
  try {
    const raw = await readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set((parsed as { slug: string }[]).map((p) => p.slug));
  } catch {
    return new Set();
  }
}

function sqlTextArray(arr: readonly string[] | null | undefined): string {
  return arr == null ? 'null' : sqlArray([...arr]);
}

function sqlNumber(v: number | null | undefined): string {
  return typeof v === 'number' && Number.isFinite(v) ? String(v) : 'null';
}

function sqlJson(v: unknown): string {
  return v == null ? 'null' : `'${sqlEscape(JSON.stringify(v))}'::jsonb`;
}

/** Seed times like `2026-04-16T09:00` are Barcelona wall-clock; give them an explicit offset. */
export function toCityTimestamp(value: string): string {
  if (/(?:Z|[+-]\d{2}:?\d{2})$/.test(value)) return value;
  const local = value.length === 16 ? `${value}:00` : value;
  const asUtc = new Date(`${local}Z`);
  if (Number.isNaN(asUtc.getTime())) throw new Error(`Invalid event time: ${value}`);
  const offsetName = new Intl.DateTimeFormat('en-US', {
    timeZone: CITY_TIME_ZONE,
    timeZoneName: 'longOffset',
  })
    .formatToParts(asUtc)
    .find((p) => p.type === 'timeZoneName')?.value;
  return `${local}${offsetName?.replace('GMT', '') || '+00:00'}`;
}

export async function buildDirectoryPlaceRows(): Promise<DirectoryPlaceRow[]> {
  const autoSlugs = await autoImportSlugs();
  const syncedAt = new Date().toISOString();
  return SEED_PLACES.map((place) => {
    const source: 'curated' | 'auto-import' = autoSlugs.has(place.slug)
      ? 'auto-import'
      : 'curated';
    return {
      slug: place.slug,
      name: place.name,
      city: place.city || 'Barcelona',
      neighborhood: place.neighborhood || null,
      address: place.address || null,
      website: place.website || null,
      telephone: place.telephone || null,
      categories: [...(place.categories ?? [])],
      primary_domain: normalizeDomain(place.primaryDomain) || null,
      source,
      directory_url: `${DIRECTORY_BASE}/${place.slug}`,
      synced_at: syncedAt,
      legacy_id: place.id,
      summary: place.summary || '',
      secondary_domains: place.secondaryDomains?.length ? [...place.secondaryDomains] : null,
      tags: [...(place.tags ?? [])],
      image_url: place.imageUrl || null,
      is_claimed: place.isClaimed === true,
      latitude: place.latitude ?? null,
      longitude: place.longitude ?? null,
      opening_hours: place.openingHours?.length ? place.openingHours : null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export function rowsToUpsertSql(rows: DirectoryPlaceRow[]): string {
  const lines = rows.map(
    (r) =>
      `  (${sqlText(r.slug)}, ${sqlText(r.name)}, ${sqlText(r.city)}, ${sqlText(r.neighborhood)}, ${sqlText(r.address)}, ${sqlText(r.website)}, ${sqlText(r.telephone)}, ${sqlArray(r.categories)}, ${sqlText(r.primary_domain)}, ${sqlText(r.source)}, ${sqlText(r.directory_url)}, ${sqlText(r.synced_at)}::timestamptz, ${sqlText(r.legacy_id)}, '${sqlEscape(r.summary)}', ${sqlTextArray(r.secondary_domains)}, ${sqlArray(r.tags)}, ${sqlText(r.image_url)}, ${r.is_claimed}, ${sqlNumber(r.latitude)}, ${sqlNumber(r.longitude)}, ${sqlJson(r.opening_hours)})`,
  );

  return `-- Auto-generated: npm run directory:sync-supabase
-- ${rows.length} places

insert into public.directory_places (
  slug, name, city, neighborhood, address, website, telephone,
  categories, primary_domain, source, directory_url, synced_at,
  legacy_id, summary, secondary_domains, tags, image_url, is_claimed,
  latitude, longitude, opening_hours
)
values
${lines.join(',\n')}
on conflict (slug) do update set
  legacy_id = excluded.legacy_id,
  summary = excluded.summary,
  secondary_domains = excluded.secondary_domains,
  tags = excluded.tags,
  image_url = excluded.image_url,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  opening_hours = excluded.opening_hours,
  name = excluded.name,
  city = excluded.city,
  neighborhood = excluded.neighborhood,
  address = excluded.address,
  website = excluded.website,
  telephone = excluded.telephone,
  categories = excluded.categories,
  primary_domain = excluded.primary_domain,
  source = excluded.source,
  directory_url = excluded.directory_url,
  synced_at = excluded.synced_at;
`;
}

// ─── Events and creators ────────────────────────────────────────────
// Rows never carry wall_opt_in*, works or other consent fields, so a sync cannot grant or revoke consent.

export type DirectoryEventRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  starts_at: string;
  ends_at: string | null;
  place_id: string | null;
  place_slug: string | null;
  place_name: string | null;
  primary_domain: string | null;
  secondary_domains: string[] | null;
  tags: string[];
  image_url: string | null;
  booking_url: string | null;
  directory_url: string;
  source: 'curated' | 'auto-import';
  synced_at: string;
};

export type DirectoryCreatorRow = {
  id: string;
  slug: string;
  display_name: string;
  bio: string;
  city: string;
  primary_domain: string | null;
  secondary_domains: string[] | null;
  product_collection_handle: string | null;
  website_url: string | null;
  image_url: string | null;
  directory_url: string;
  source: 'curated';
  synced_at: string;
};

export async function buildDirectoryEventRows(): Promise<DirectoryEventRow[]> {
  const autoSlugs = await autoImportSlugs(AUTO_EVENTS_FILE);
  const placeSlugById = new Map(SEED_PLACES.map((p) => [p.id, p.slug]));
  const syncedAt = new Date().toISOString();
  return SEED_EVENTS.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    summary: event.summary || '',
    starts_at: toCityTimestamp(event.startsAt),
    ends_at: event.endsAt ? toCityTimestamp(event.endsAt) : null,
    place_id: event.placeId || null,
    place_slug: placeSlugById.get(event.placeId) ?? null,
    place_name: event.placeName || null,
    primary_domain: normalizeDomain(event.primaryDomain) || null,
    secondary_domains: event.secondaryDomains?.length ? [...event.secondaryDomains] : null,
    tags: [...(event.tags ?? [])],
    image_url: event.imageUrl || null,
    booking_url: event.sourceUrl || null,
    directory_url: `${CITY_BASE}/events/${encodeURIComponent(event.slug)}`,
    source: autoSlugs.has(event.slug) ? ('auto-import' as const) : ('curated' as const),
    synced_at: syncedAt,
  })).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export function buildDirectoryCreatorRows(): DirectoryCreatorRow[] {
  const syncedAt = new Date().toISOString();
  return SEED_CREATORS.map((creator) => ({
    id: creator.id,
    slug: creator.slug,
    display_name: creator.displayName,
    bio: creator.bio || '',
    city: creator.city || 'Barcelona',
    primary_domain: normalizeDomain(creator.primaryDomain) || null,
    secondary_domains: creator.secondaryDomains?.length ? [...creator.secondaryDomains] : null,
    product_collection_handle: creator.productCollectionHandle || null,
    website_url: creator.websiteUrl || null,
    image_url: creator.imageUrl || null,
    directory_url: `${CITY_BASE}/creators/${encodeURIComponent(creator.slug)}`,
    source: 'curated' as const,
    synced_at: syncedAt,
  })).sort((a, b) => a.display_name.localeCompare(b.display_name, 'en'));
}

export function eventRowsToUpsertSql(rows: DirectoryEventRow[]): string {
  const lines = rows.map(
    (r) =>
      `  (${sqlText(r.id)}, ${sqlText(r.slug)}, ${sqlText(r.title)}, '${sqlEscape(r.summary)}', ${sqlText(r.starts_at)}::timestamptz, ${r.ends_at ? `${sqlText(r.ends_at)}::timestamptz` : 'null'}, ${sqlText(r.place_id)}, ${sqlText(r.place_slug)}, ${sqlText(r.place_name)}, ${sqlText(r.primary_domain)}, ${sqlTextArray(r.secondary_domains)}, ${sqlArray(r.tags)}, ${sqlText(r.image_url)}, ${sqlText(r.booking_url)}, ${sqlText(r.directory_url)}, ${sqlText(r.source)}, ${sqlText(r.synced_at)}::timestamptz)`,
  );

  return `-- Auto-generated: npm run directory:sync-supabase
-- ${rows.length} events

insert into public.directory_events (
  id, slug, title, summary, starts_at, ends_at, place_id, place_slug, place_name,
  primary_domain, secondary_domains, tags, image_url, booking_url, directory_url, source, synced_at
)
values
${lines.join(',\n')}
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  summary = excluded.summary,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  place_id = excluded.place_id,
  place_slug = excluded.place_slug,
  place_name = excluded.place_name,
  primary_domain = excluded.primary_domain,
  secondary_domains = excluded.secondary_domains,
  tags = excluded.tags,
  image_url = excluded.image_url,
  booking_url = excluded.booking_url,
  directory_url = excluded.directory_url,
  source = excluded.source,
  synced_at = excluded.synced_at;
`;
}

export function creatorRowsToUpsertSql(rows: DirectoryCreatorRow[]): string {
  const lines = rows.map(
    (r) =>
      `  (${sqlText(r.id)}, ${sqlText(r.slug)}, ${sqlText(r.display_name)}, '${sqlEscape(r.bio)}', ${sqlText(r.city)}, ${sqlText(r.primary_domain)}, ${sqlTextArray(r.secondary_domains)}, ${sqlText(r.product_collection_handle)}, ${sqlText(r.website_url)}, ${sqlText(r.image_url)}, ${sqlText(r.directory_url)}, ${sqlText(r.source)}, ${sqlText(r.synced_at)}::timestamptz)`,
  );

  return `-- Auto-generated: npm run directory:sync-supabase
-- ${rows.length} creators

insert into public.directory_creators (
  id, slug, display_name, bio, city, primary_domain, secondary_domains,
  product_collection_handle, website_url, image_url, directory_url, source, synced_at
)
values
${lines.join(',\n')}
on conflict (id) do update set
  slug = excluded.slug,
  display_name = excluded.display_name,
  bio = excluded.bio,
  city = excluded.city,
  primary_domain = excluded.primary_domain,
  secondary_domains = excluded.secondary_domains,
  product_collection_handle = excluded.product_collection_handle,
  website_url = excluded.website_url,
  image_url = excluded.image_url,
  directory_url = excluded.directory_url,
  source = excluded.source,
  synced_at = excluded.synced_at;
`;
}
