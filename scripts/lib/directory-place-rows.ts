import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Place } from '../../app/lib/directory/types';
import { normalizeDomain } from '../../app/lib/directory/domains';
import { SEED_PLACES } from '../../app/lib/directory/seed.server';
import { PROJECT_ROOT } from './project-env';

const AUTO_FILE = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'auto-import.places.json');
const DIRECTORY_BASE = 'https://directory.sotabosc.world/places';

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

async function autoImportSlugs(): Promise<Set<string>> {
  try {
    const raw = await readFile(AUTO_FILE, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set((parsed as Place[]).map((p) => p.slug));
  } catch {
    return new Set();
  }
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
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

export function rowsToUpsertSql(rows: DirectoryPlaceRow[]): string {
  const lines = rows.map(
    (r) =>
      `  (${sqlText(r.slug)}, ${sqlText(r.name)}, ${sqlText(r.city)}, ${sqlText(r.neighborhood)}, ${sqlText(r.address)}, ${sqlText(r.website)}, ${sqlText(r.telephone)}, ${sqlArray(r.categories)}, ${sqlText(r.primary_domain)}, ${sqlText(r.source)}, ${sqlText(r.directory_url)}, ${sqlText(r.synced_at)}::timestamptz)`,
  );

  return `-- Auto-generated: npm run directory:sync-supabase
-- ${rows.length} places

insert into public.directory_places (
  slug, name, city, neighborhood, address, website, telephone,
  categories, primary_domain, source, directory_url, synced_at
)
values
${lines.join(',\n')}
on conflict (slug) do update set
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
