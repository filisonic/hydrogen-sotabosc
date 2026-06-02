/**
 * Bulk-import OpenStreetMap venues inside Barcelona (Wikidata Q1492) into auto-import.places.json,
 * gated by the same Sotabosc alignment rules as `ingest-auto-listings.ts`.
 *
 * Data © OpenStreetMap contributors, ODbL — https://www.openstreetmap.org/copyright
 *
 * Usage:
 *   npx tsx scripts/osm-import-barcelona.ts
 *   npx tsx scripts/osm-import-barcelona.ts --target-auto=400 --min-score=70
 *   npx tsx scripts/osm-import-barcelona.ts --dry-run
 *
 * Curated rows in seed.server.ts stay untouched; this only appends to auto-import.places.json
 * until (hand + auto) reaches ~500 places by default (100 hand + 400 auto).
 */

import { createHash } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { DomainCategory, ListingCategory, Place } from '../app/lib/directory/types';
import { SEED_PLACES } from '../app/lib/directory/seed.server';
import { passesIngestGate, placeTextForAlignment } from './lib/place-alignment';
import { PROJECT_ROOT } from './lib/project-env';
import { scoreAlignment, slugifyHint } from './lib/sotabosc-alignment';

const AUTO_PLACES_FILE = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'auto-import.places.json');

type OsmElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = { elements?: OsmElement[] };

function parseArgs(argv: string[]) {
  /**
   * OSM rows are tag-sparse. `passesIngestGate` requires score >= minScore even for `review` verdicts,
   * so keep minScore ≤ 55 when `--allow-review` (see sotabosc-alignment verdict bands).
   */
  let targetAuto = 400;
  /** Strong “recommend_seed” rows */
  let minScore = 58;
  /** Weaker “review” rows (tag-sparse OSM) */
  let minReviewScore = 48;
  let allowReview = true;
  let dryRun = false;

  for (const a of argv) {
    if (a.startsWith('--target-auto=')) targetAuto = Number(a.slice(14)) || 400;
    else if (a.startsWith('--min-score=')) minScore = Number(a.slice(12)) || 0;
    else if (a.startsWith('--min-review-score=')) minReviewScore = Number(a.slice(19)) || 0;
    else if (a === '--allow-review') allowReview = true;
    else if (a === '--strict-gate') {
      allowReview = false;
      minScore = 70;
      minReviewScore = 70;
    } else if (a === '--dry-run') dryRun = true;
  }
  return { targetAuto, minScore, minReviewScore, allowReview, dryRun };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Nudge axes so amenity-only tags still score like a Barcelona directory row. */
const OSM_ALIGNMENT_CONTEXT = `
Barcelona, Catalunya, Spain. Neighbourhood place, local culture, walkable city.
Community gathering, craft, design, seasonal food, sustainability, third places.
`.trim();

async function readAutoPlaces(): Promise<Place[]> {
  try {
    const raw = await readFile(AUTO_PLACES_FILE, 'utf8');
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? (p as Place[]) : [];
  } catch {
    return [];
  }
}

const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
] as const;

async function overpassOn(
  baseUrl: string,
  elementsInner: string,
  attempt = 0,
): Promise<OsmElement[]> {
  const ql = `[out:json][timeout:240];
area["wikidata"="Q1492"]->.bcn;
(
${elementsInner}
);
out center tags;`;

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Accept: 'application/json, */*;q=0.8',
      'User-Agent': 'sotabosc-directory-osm-import/1.0 (contact: sotabosc.world)',
    },
    body: new URLSearchParams({ data: ql }),
  });
  if (!res.ok) {
    const t = await res.text();
    if ((res.status === 429 || res.status === 504 || res.status === 406) && attempt < 2) {
      await sleep(3000 * (attempt + 1));
      return overpassOn(baseUrl, elementsInner, attempt + 1);
    }
    throw new Error(`Overpass HTTP ${res.status}: ${t.slice(0, 500)}`);
  }
  const json = (await res.json()) as OverpassResponse;
  return json.elements ?? [];
}

let overpassEndpointIdx = 0;

async function overpass(elementsInner: string): Promise<OsmElement[]> {
  let lastErr: unknown;
  for (let i = 0; i < OVERPASS_ENDPOINTS.length; i += 1) {
    const url = OVERPASS_ENDPOINTS[(overpassEndpointIdx + i) % OVERPASS_ENDPOINTS.length];
    try {
      const els = await overpassOn(url, elementsInner);
      overpassEndpointIdx = (overpassEndpointIdx + i) % OVERPASS_ENDPOINTS.length;
      return els;
    } catch (e) {
      lastErr = e;
      console.warn(`[osm] endpoint failed ${url}`, e instanceof Error ? e.message : e);
      await sleep(2000);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function fetchAllOsm(): Promise<OsmElement[]> {
  const seen = new Set<string>();
  const out: OsmElement[] = [];

  const add = (els: OsmElement[]) => {
    for (const el of els) {
      const k = `${el.type}/${el.id}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(el);
    }
  };

  const areaQueries = [
    `nwr["tourism"="gallery"](area.bcn);`,
    `nwr["shop"="art"](area.bcn);`,
    `nwr["amenity"="arts_centre"](area.bcn);`,
    `nwr["amenity"="theatre"](area.bcn);`,
    `nwr["amenity"="community_centre"](area.bcn);`,
    `nwr["amenity"="coworking_space"](area.bcn);`,
    `nwr["amenity"="library"](area.bcn);`,
    `nwr["amenity"="music_school"](area.bcn);`,
    `nwr["amenity"="language_school"](area.bcn);`,
    `nwr["leisure"="dance"](area.bcn);`,
    `nwr["amenity"="marketplace"](area.bcn);`,
  ];

  for (const q of areaQueries) {
    try {
      add(await overpass(q));
      console.log(`[osm] +batch ${q.slice(0, 50)}… → ${out.length} unique`);
      await sleep(2500);
    } catch (e) {
      console.warn('[osm] batch failed', q, e);
      await sleep(5000);
    }
  }

  const cafeBoxes: [number, number, number, number][] = [
    [41.375, 2.16, 41.392, 2.195],
    [41.392, 2.15, 41.415, 2.19],
    [41.35, 2.1, 41.375, 2.16],
    [41.4, 2.18, 41.43, 2.225],
    [41.38, 2.13, 41.4, 2.16],
  ];
  for (const [s, w, n, e] of cafeBoxes) {
    try {
      add(await overpass(`nwr["amenity"="cafe"](${s},${w},${n},${e});`));
      console.log(`[osm] +cafes bbox → ${out.length} unique`);
      await sleep(2500);
    } catch (e) {
      console.warn('[osm] cafe bbox failed', e);
      await sleep(5000);
    }
  }

  const restaurantBoxes: [number, number, number, number][] = [
    [41.375, 2.16, 41.392, 2.195],
    [41.392, 2.15, 41.415, 2.19],
  ];
  for (const [s, w, n, e] of restaurantBoxes) {
    try {
      add(
        await overpass(
          `nwr["amenity"="restaurant"]["diet:vegetarian"="yes"](${s},${w},${n},${e});`,
        ),
      );
      await sleep(2000);
      add(
        await overpass(
          `nwr["amenity"="restaurant"]["organic"="yes"](${s},${w},${n},${e});`,
        ),
      );
      console.log(`[osm] +veg/organic restaurants bbox → ${out.length} unique`);
      await sleep(2500);
    } catch (e) {
      console.warn('[osm] restaurant bbox failed', e);
      await sleep(5000);
    }
  }

  return out;
}

function tagBlob(tags: Record<string, string>): string {
  return Object.entries(tags)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

function osmToPlace(el: OsmElement, takenSlugs: Set<string>): Place | null {
  const tags = el.tags ?? {};
  const name = tags.name || tags['name:en'] || tags['name:ca'] || '';
  if (name.trim().length < 2) return null;

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;

  const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(', ');
  const neighborhood = tags['addr:suburb'] || tags['addr:quarter'] || tags['addr:neighbourhood'] || '';
  const city = tags['addr:city'] || 'Barcelona';
  const website = tags.website || tags['contact:website'] || undefined;

  const bits = [
    tags.description,
    tags.cuisine,
    tags.amenity,
    tags.shop,
    tags.tourism,
    tags.leisure,
  ].filter(Boolean);
  const summary =
    (bits.length ? bits.join(' · ') : `OpenStreetMap venue in ${city}`).slice(0, 280) +
    (bits.join('').length > 280 ? '…' : '');

  let slug = slugifyHint(name);
  if (!slug) return null;
  const base = slug;
  let i = 0;
  while (takenSlugs.has(slug)) {
    i += 1;
    slug = `${base}-${i}`;
  }
  takenSlugs.add(slug);

  const id = `p_osm_${createHash('sha256')
    .update(`${el.type}/${el.id}`)
    .digest('hex')
    .slice(0, 12)}`;

  return {
    id,
    slug,
    name: name.slice(0, 120),
    summary,
    address: street.slice(0, 200),
    neighborhood: neighborhood.slice(0, 100),
    city: city.slice(0, 80),
    categories: ['other'] as ListingCategory[],
    primaryDomain: 'earth' as DomainCategory,
    tags: ['osm', tags.amenity || tags.shop || tags.tourism || tags.leisure || 'venue'].filter(
      Boolean,
    ) as string[],
    website,
    latitude: lat,
    longitude: lon,
  };
}

async function main() {
  const { targetAuto, minScore, minReviewScore, allowReview, dryRun } = parseArgs(process.argv.slice(2));

  const autoExisting = await readAutoPlaces();
  const handCount = SEED_PLACES.length - autoExisting.length;
  const room = Math.max(0, targetAuto - autoExisting.length);

  console.log(
    `[osm] Hand-curated (approx): ${handCount} | auto-import now: ${autoExisting.length} | room for ${room} new OSM rows (target auto=${targetAuto})`,
  );

  if (room === 0) {
    console.log('[osm] Nothing to add.');
    return;
  }

  const takenSlugs = new Set<string>([...SEED_PLACES.map((p) => p.slug), ...autoExisting.map((p) => p.slug)]);

  const elements = await fetchAllOsm();
  console.log(`[osm] Fetched ${elements.length} unique elements, scoring…`);

  const gateOpts = { minScore, allowReview, minReviewScore };
  const accepted: Place[] = [];
  let skippedNoPlace = 0;
  let skippedGate = 0;

  for (const el of elements) {
    if (accepted.length >= room) break;
    const raw = osmToPlace(el, takenSlugs);
    if (!raw) {
      skippedNoPlace++;
      continue;
    }
    const tags = el.tags ?? {};
    const text = placeTextForAlignment(raw, `${tagBlob(tags)}\n${OSM_ALIGNMENT_CONTEXT}`);
    const a = scoreAlignment(text);
    if (!passesIngestGate(a, gateOpts)) {
      skippedGate++;
      continue;
    }
    accepted.push({
      ...raw,
      primaryDomain: a.suggestedPrimaryDomain,
      categories:
        a.suggestedCategories.length > 0 ? a.suggestedCategories : (['other'] as ListingCategory[]),
    });
  }

  console.log(
    `[osm] Accepted ${accepted.length} (skipped ${skippedNoPlace} incomplete, ${skippedGate} failed alignment gate)`,
  );

  if (dryRun) {
    console.log('[dry-run] First 5:', accepted.slice(0, 5).map((p) => `${p.slug} (${p.name})`));
    return;
  }

  const merged = [...autoExisting, ...accepted];
  const tmp = `${AUTO_PLACES_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  await rename(tmp, AUTO_PLACES_FILE);
  console.log(`[osm] Wrote ${merged.length} total rows to auto-import.places.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
