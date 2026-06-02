/**
 * Import verified Barcelona venues via Google Places API (New) text search.
 * Uses the same alignment gate as OSM / Firecrawl ingest — no synthetic filler.
 *
 * Prereqs: GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_API_KEY) + Places API (New) enabled.
 *
 * Recommended order:
 *   npm run directory:prune-templates
 *   npm run directory:google-places -- --dry-run
 *   npm run directory:google-places
 *   npm run directory:osm-import
 *   npm run ingest:listing -- --file=reports/bulk-urls.txt --allow-review
 *   npm run directory:assess -- --source=all
 *
 * Flags:
 *   --target=400        Max new rows to append (default 400)
 *   --prune-templates   Drop p_tpl_* rows before import
 *   --dry-run
 *   --min-score=62      recommend_seed threshold
 *   --allow-review      Also accept review verdict at --min-review-score=52
 */

import { createHash } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { DomainCategory, ListingCategory, Place } from '../app/lib/directory/types';
import { SEED_PLACES } from '../app/lib/directory/seed.server';
import { passesIngestGate, placeTextForAlignment } from './lib/place-alignment';
import { loadDotEnvFromRoot, PROJECT_ROOT } from './lib/project-env';
import { scoreAlignment, slugifyHint } from './lib/sotabosc-alignment';

const AUTO_PLACES_FILE = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'auto-import.places.json');
const REPORT_FILE = path.join(PROJECT_ROOT, 'reports', 'google-places-import-last-run.json');
const TEXT_SEARCH = 'https://places.googleapis.com/v1/places:searchText';

const BARCELONA = { latitude: 41.3874, longitude: 2.1686 };
const SEARCH_RADIUS_M = 14_000;
const PAGE_SIZE = 20;
const DELAY_MS = 450;

/** Curated text queries — each returns real businesses with names + addresses. */
const SEARCH_QUERIES = [
  'contemporary art gallery Barcelona',
  'independent art gallery Barcelona',
  'artist studio gallery Barcelona',
  'photography gallery Barcelona',
  'coworking space Barcelona',
  'makerspace Barcelona',
  'specialty coffee roastery Barcelona',
  'third wave coffee Barcelona',
  'live music venue Barcelona',
  'jazz club Barcelona',
  'independent theatre Barcelona',
  'dance studio Barcelona',
  'yoga studio Barcelona',
  'meditation center Barcelona',
  'ceramics workshop Barcelona',
  'language school Barcelona',
  'design museum Barcelona',
  'cultural center Barcelona',
  'independent bookstore Barcelona',
  'vinyl record shop Barcelona',
  'organic vegetarian restaurant Barcelona',
  'natural wine bar Barcelona',
  'weekend market Barcelona',
  'community garden Barcelona',
] as const;

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.location',
  'places.websiteUri',
  'places.nationalPhoneNumber',
  'places.types',
  'places.primaryType',
  'places.businessStatus',
  'places.rating',
  'places.userRatingCount',
  'nextPageToken',
].join(',');

const ALIGNMENT_CONTEXT = `
Barcelona, Catalunya, Spain. Local culture, craft, design, galleries, workshops, third places.
Community, sustainability, independent venues, creative scene.
`.trim();

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: Array<{ longText?: string; types?: string[] }>;
  location?: { latitude?: number; longitude?: number };
  websiteUri?: string;
  nationalPhoneNumber?: string;
  types?: string[];
  primaryType?: string;
  businessStatus?: string;
  rating?: number;
  userRatingCount?: number;
};

function googleApiKey(): string | undefined {
  return (
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.MAPS_API_KEY?.trim() ||
    undefined
  );
}

function parseArgs(argv: string[]) {
  let target = 400;
  let minScore = 62;
  let minReviewScore = 52;
  let allowReview = true;
  let pruneTemplates = false;
  let dryRun = false;

  for (const a of argv) {
    if (a.startsWith('--target=')) target = Number(a.slice(9)) || 400;
    else if (a.startsWith('--min-score=')) minScore = Number(a.slice(12)) || 0;
    else if (a.startsWith('--min-review-score=')) minReviewScore = Number(a.slice(19)) || 0;
    else if (a === '--allow-review') allowReview = true;
    else if (a === '--strict-gate') {
      allowReview = false;
      minScore = 70;
      minReviewScore = 70;
    } else if (a === '--prune-templates') pruneTemplates = true;
    else if (a === '--dry-run') dryRun = true;
  }
  return { target, minScore, minReviewScore, allowReview, pruneTemplates, dryRun };
}

function isTemplateRow(p: Place): boolean {
  return p.id.startsWith('p_tpl_') || p.tags?.includes('template-batch');
}

function googlePlaceIdFromTags(tags?: string[]): string | undefined {
  return tags?.find((t) => t.startsWith('gplace:'))?.slice('gplace:'.length);
}

function neighborhoodFromComponents(components?: GooglePlace['addressComponents']): string {
  if (!components?.length) return '';
  const order = ['neighborhood', 'sublocality_level_1', 'sublocality', 'locality'];
  for (const want of order) {
    const hit = components.find((c) => c.types?.includes(want));
    if (hit?.longText && !/^barcelona$/i.test(hit.longText)) return hit.longText;
  }
  return '';
}

function mapGoogleTypes(types: string[] | undefined): ListingCategory[] {
  const t = new Set(types ?? []);
  const out: ListingCategory[] = [];
  const add = (c: ListingCategory) => {
    if (!out.includes(c)) out.push(c);
  };
  if (t.has('art_gallery') || t.has('museum')) add('art-gallery');
  if (t.has('coffee_shop') || t.has('cafe')) add('specialty-coffee');
  if (t.has('night_club') || t.has('bar') || t.has('live_music_venue')) add('music-venue');
  if (t.has('restaurant') || t.has('meal_delivery')) add('restaurant');
  if (t.has('gym') || t.has('yoga_studio') || t.has('school')) add('workshop');
  if (t.has('spa')) add('retreat');
  if (t.has('book_store') || t.has('clothing_store') || t.has('home_goods_store')) add('shop');
  if (t.has('convention_center') || t.has('event_venue')) add('conference');
  if (t.has('coworking_space')) add('coworking');
  if (!out.length) add('other');
  return out.slice(0, 3);
}

function summaryFor(name: string, types: string[] | undefined, address: string): string {
  const label = (types ?? []).slice(0, 4).join(', ') || 'cultural venue';
  const base = `${name} — ${label} in Barcelona.`;
  const rest = address ? ` ${address}` : '';
  return (base + rest).replace(/\s+/g, ' ').trim().slice(0, 500);
}

async function readAutoPlaces(): Promise<Place[]> {
  try {
    const raw = await readFile(AUTO_PLACES_FILE, 'utf8');
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? (p as Place[]) : [];
  } catch {
    return [];
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function searchText(
  apiKey: string,
  textQuery: string,
  pageToken?: string,
): Promise<{ places: GooglePlace[]; nextPageToken?: string }> {
  const body: Record<string, unknown> = {
    textQuery,
    regionCode: 'ES',
    languageCode: 'en',
    pageSize: PAGE_SIZE,
    locationBias: {
      circle: { center: BARCELONA, radius: SEARCH_RADIUS_M },
    },
  };
  if (pageToken) body.pageToken = pageToken;

  const res = await fetch(TEXT_SEARCH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Places searchText ${res.status}: ${raw.slice(0, 600)}`);
  }
  const json = JSON.parse(raw) as { places?: GooglePlace[]; nextPageToken?: string };
  return { places: json.places ?? [], nextPageToken: json.nextPageToken };
}

function googleRowToPlace(
  gp: GooglePlace,
  takenSlugs: Set<string>,
  seenGoogleIds: Set<string>,
): Place | null {
  const placeResource = gp.id?.trim();
  const name = gp.displayName?.text?.trim() ?? '';
  if (!placeResource || name.length < 2) return null;
  if (seenGoogleIds.has(placeResource)) return null;
  if (gp.businessStatus === 'CLOSED_PERMANENTLY') return null;

  const lat = gp.location?.latitude;
  const lon = gp.location?.longitude;
  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const address = gp.formattedAddress?.trim() ?? '';
  if (!/barcelona/i.test(address) && !/catalonia|catalunya/i.test(address)) {
    const distOk =
      Math.abs(lat - BARCELONA.latitude) < 0.12 && Math.abs(lon - BARCELONA.longitude) < 0.15;
    if (!distOk) return null;
  }

  let slug = slugifyHint(name);
  if (!slug) return null;
  const base = slug;
  let n = 0;
  while (takenSlugs.has(slug)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  takenSlugs.add(slug);
  seenGoogleIds.add(placeResource);

  const hash = createHash('sha256').update(placeResource).digest('hex').slice(0, 12);
  const types = [...(gp.types ?? []), gp.primaryType].filter(Boolean) as string[];
  const neighborhood = neighborhoodFromComponents(gp.addressComponents);

  return {
    id: `p_gmap_${hash}`,
    slug,
    name: name.slice(0, 120),
    summary: summaryFor(name, types, address),
    address: address.slice(0, 200),
    neighborhood: neighborhood.slice(0, 100),
    city: 'Barcelona',
    categories: mapGoogleTypes(types),
    primaryDomain: 'earth' as DomainCategory,
    tags: [
      'google-places',
      'verified-import',
      `gplace:${placeResource}`,
      ...(gp.rating != null ? [`rating:${gp.rating}`] : []),
    ],
    website: gp.websiteUri?.trim() || undefined,
    telephone: gp.nationalPhoneNumber?.trim() || undefined,
    latitude: lat,
    longitude: lon,
  };
}

async function main() {
  await loadDotEnvFromRoot();
  const { target, minScore, minReviewScore, allowReview, pruneTemplates, dryRun } = parseArgs(
    process.argv.slice(2),
  );

  const apiKey = googleApiKey();
  if (!apiKey) {
    console.error('Missing GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY in .env');
    process.exit(1);
  }

  let autoExisting = await readAutoPlaces();
  if (pruneTemplates) {
    const before = autoExisting.length;
    autoExisting = autoExisting.filter((p) => !isTemplateRow(p));
    console.log(`[gplaces] Pruned templates: ${before} → ${autoExisting.length}`);
  }

  const takenSlugs = new Set<string>([
    ...SEED_PLACES.map((p) => p.slug),
    ...autoExisting.map((p) => p.slug),
  ]);
  const seenGoogleIds = new Set<string>(
    autoExisting.map((p) => googlePlaceIdFromTags(p.tags)).filter(Boolean) as string[],
  );

  const gateOpts = { minScore, allowReview, minReviewScore };
  const accepted: Place[] = [];
  const rejected: Array<{ name: string; reason: string }> = [];
  let apiCalls = 0;

  queryLoop: for (const textQuery of SEARCH_QUERIES) {
    if (accepted.length >= target) break;
    let pageToken: string | undefined;
    let pages = 0;

    do {
      if (accepted.length >= target) break queryLoop;
      pages += 1;
      if (pages > 3) break;

      await sleep(DELAY_MS);
      apiCalls += 1;
      const { places, nextPageToken } = await searchText(apiKey, textQuery, pageToken);
      pageToken = nextPageToken;

      for (const gp of places) {
        if (accepted.length >= target) break;
        const raw = googleRowToPlace(gp, takenSlugs, seenGoogleIds);
        if (!raw) continue;

        const meta = [
          gp.types?.join(' '),
          gp.primaryType,
          gp.rating != null ? `rating ${gp.rating}` : '',
          gp.userRatingCount != null ? `${gp.userRatingCount} reviews` : '',
        ]
          .filter(Boolean)
          .join(' · ');

        const text = placeTextForAlignment(raw, `${meta}\n${ALIGNMENT_CONTEXT}`);
        const alignment = scoreAlignment(text);
        if (!passesIngestGate(alignment, gateOpts)) {
          rejected.push({
            name: raw.name,
            reason: `score=${alignment.score} verdict=${alignment.verdict}`,
          });
          continue;
        }

        accepted.push({
          ...raw,
          primaryDomain: alignment.suggestedPrimaryDomain,
          categories:
            alignment.suggestedCategories.length > 0
              ? alignment.suggestedCategories
              : raw.categories,
        });
      }
    } while (pageToken && accepted.length < target);
  }

  console.log(
    `[gplaces] Queries: ${SEARCH_QUERIES.length} | API calls: ${apiCalls} | accepted: ${accepted.length} | rejected: ${rejected.length}`,
  );

  if (dryRun) {
    console.log('[dry-run] Sample accepted:', accepted.slice(0, 8).map((p) => `${p.slug} — ${p.name}`));
    return;
  }

  const merged = [...autoExisting, ...accepted];
  const tmp = `${AUTO_PLACES_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  await rename(tmp, AUTO_PLACES_FILE);

  const report = {
    at: new Date().toISOString(),
    accepted: accepted.length,
    rejectedSample: rejected.slice(0, 40),
    totalAutoImport: merged.length,
    handCuratedApprox: SEED_PLACES.length - autoExisting.length,
    totalPlacesApprox: SEED_PLACES.length - autoExisting.length + merged.length,
  };
  await writeFile(REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[gplaces] Wrote ${merged.length} auto-import rows (${accepted.length} new)`);
  console.log(`[gplaces] Report: ${REPORT_FILE}`);
  console.log(`[gplaces] Approx total SEED_PLACES after rebuild: ${report.totalPlacesApprox}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
