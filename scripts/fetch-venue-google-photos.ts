/**
 * Pull venue preview images via Google Places API (New) — the supported alternative to scraping Maps.
 *
 * Prereqs (Google Cloud Console):
 *   - Billing enabled
 *   - Enable "Places API (New)"
 *   - Create an API key; restrict it to Places API for production
 *
 * Env (in project root `.env`):
 *   GOOGLE_MAPS_API_KEY=...   (or GOOGLE_PLACES_API_KEY)
 *
 * Policy:
 *   - If a photo has `authorAttributions`, you must show them wherever that image appears.
 *   - Do not cache photo *resource names* long-term; this script downloads bytes to /public once.
 *   - Confirm storage/redisplay against current Google Maps Platform Terms.
 *
 * Run: npm run fetch:venue-google-photos
 * Typical order: run fetch:venue-images (Firecrawl) first, then:
 *   npm run fetch:venue-google-photos -- --fill-missing
 *   so Places only runs where there is no file in public/images/venues/{slug}.* yet.
 *
 * Flags: --dry, --force, --slug=, --fill-missing, --no-report
 * Report: reports/venue-google-photos-last-run.json
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/place-photos
 */

import type { Dirent } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Place } from '../app/lib/directory/types';
import { SEED_PLACES } from '../app/lib/directory/seed.server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VENUES_DIR = path.join(ROOT, 'public', 'images', 'venues');
const OUT_DIR = path.join(VENUES_DIR, 'google');
const REPORT_FILE = path.join(ROOT, 'reports', 'venue-google-photos-last-run.json');
const GEN_IMAGES = path.join(ROOT, 'app', 'lib', 'directory', 'venueGoogleImages.generated.ts');
const GEN_ATTRS = path.join(ROOT, 'app', 'lib', 'directory', 'venueGoogleAttributions.generated.ts');
const TEXT_SEARCH = 'https://places.googleapis.com/v1/places:searchText';
const MAX_BYTES = 2_800_000;
const DELAY_MS = 400;

type GoogleAttribution = { displayName: string; uri?: string };

function parseArgs(argv: string[]) {
  return {
    dry: argv.includes('--dry'),
    force: argv.includes('--force'),
    fillMissing: argv.includes('--fill-missing'),
    noReport: argv.includes('--no-report'),
    slug: argv.find((a) => a.startsWith('--slug='))?.split('=')[1]?.trim(),
  };
}

/** True if a Firecrawl (or manual) file exists at public/images/venues/{slug}.ext */
async function hasNonGoogleVenueFile(slug: string): Promise<boolean> {
  try {
    const entries = await readdir(VENUES_DIR, { withFileTypes: true });
    return entries.some(
      (e) => e.isFile() && e.name.startsWith(`${slug}.`),
    );
  } catch {
    return false;
  }
}

async function loadDotEnv() {
  const p = path.join(ROOT, '.env');
  try {
    const text = await readFile(p, 'utf8');
    for (const line of text.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* no .env */
  }
}

function googleApiKey(): string | undefined {
  const k =
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.MAPS_API_KEY?.trim();
  return k || undefined;
}

function textQueryForPlace(p: Place): string {
  return `${p.name}, ${p.address}, ${p.city}`;
}

function extFromContentType(ct: string | null): string {
  if (!ct) return 'jpg';
  const base = ct.split(';')[0]?.trim().toLowerCase() ?? '';
  if (base.includes('png')) return 'png';
  if (base.includes('webp')) return 'webp';
  if (base.includes('gif')) return 'gif';
  if (base.includes('jpeg') || base.includes('jpg')) return 'jpg';
  return 'jpg';
}

function normalizeUri(u: string | undefined): string | undefined {
  if (!u) return undefined;
  if (u.startsWith('//')) return `https:${u}`;
  return u;
}

async function textSearchFirstPhoto(
  apiKey: string,
  textQuery: string,
): Promise<{ photoName: string; attributions: GoogleAttribution[] } | null> {
  const res = await fetch(TEXT_SEARCH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.photos,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify({
      textQuery,
      regionCode: 'ES',
    }),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Places searchText ${res.status}: ${raw.slice(0, 500)}`);
  }
  let json: { places?: unknown[] };
  try {
    json = JSON.parse(raw) as { places?: unknown[] };
  } catch {
    return null;
  }
  const places = json.places;
  if (!Array.isArray(places) || !places.length) return null;
  const first = places[0] as {
    photos?: Array<{
      name?: string;
      authorAttributions?: Array<{ displayName?: string; uri?: string }>;
    }>;
  };
  const photos = first.photos;
  if (!Array.isArray(photos) || !photos.length || !photos[0]?.name) return null;
  const ph = photos[0];
  const attrs: GoogleAttribution[] = (ph.authorAttributions ?? [])
    .filter((a) => a.displayName)
    .map((a) => ({
      displayName: a.displayName as string,
      uri: normalizeUri(a.uri),
    }));
  return { photoName: ph.name as string, attributions: attrs };
}

async function fetchPhotoBytes(
  apiKey: string,
  photoName: string,
): Promise<{ buffer: Buffer; ext: string } | null> {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1600&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return null;
  const ct = res.headers.get('content-type');
  if (ct?.includes('svg')) return null;
  if (!ct?.startsWith('image/')) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES || buf.length < 400) return null;
  return { buffer: buf, ext: extFromContentType(ct) };
}

async function findExisting(slug: string): Promise<string | null> {
  try {
    const entries = await readdir(OUT_DIR, { withFileTypes: true });
    const hit = entries.find((e) => e.isFile() && e.name.startsWith(`${slug}.`));
    return hit ? path.join(OUT_DIR, hit.name) : null;
  } catch {
    return null;
  }
}

type GooglePhotoRowStatus =
  | 'ok'
  | 'skip_exists'
  | 'places_error'
  | 'no_photo'
  | 'download_failed'
  | 'dry_preview';

type GooglePhotoRow = {
  slug: string;
  name: string;
  textQuery: string;
  status: GooglePhotoRowStatus;
  detail?: string;
};

async function writeGoogleRunReport(rows: GooglePhotoRow[], meta: { fillMissing: boolean }) {
  const summary: Record<string, number> = {};
  for (const r of rows) {
    summary[r.status] = (summary[r.status] ?? 0) + 1;
  }
  const needsFollowUp = rows.filter((r) =>
    ['places_error', 'no_photo', 'download_failed'].includes(r.status),
  );
  const body = {
    generatedAt: new Date().toISOString(),
    pipeline: 'google_places_photos',
    fillMissing: meta.fillMissing,
    summary,
    needsFollowUpSlugs: needsFollowUp.map((r) => r.slug),
    rows,
  };
  await mkdir(path.dirname(REPORT_FILE), { recursive: true });
  await writeFile(REPORT_FILE, `${JSON.stringify(body, null, 2)}\n`, 'utf8');
}

async function writeImageGen(map: Record<string, string>) {
  const keys = Object.keys(map).sort();
  const lines = keys.map((k) => `  '${k}': '${map[k]}',`);
  const body = `/**
 * Google Places photos saved under /images/venues/google/*
 * Auto-generated by scripts/fetch-venue-google-photos.ts — do not edit by hand.
 * Re-run: npm run fetch:venue-google-photos
 */
export const VENUE_GOOGLE_IMAGE_BY_SLUG: Partial<Record<string, string>> = {
${lines.join('\n')}
};
`;
  await writeFile(GEN_IMAGES, body, 'utf8');
}

async function writeAttrGen(map: Record<string, GoogleAttribution[]>) {
  const keys = Object.keys(map).sort();
  const lines = keys.map((k) => `  '${k}': ${JSON.stringify(map[k])},`);
  const body = `/**
 * Required attributions when non-empty (Google Places photo policy).
 * Auto-generated by scripts/fetch-venue-google-photos.ts — do not edit by hand.
 */
export type GooglePhotoAttribution = { displayName: string; uri?: string };

export const VENUE_GOOGLE_ATTRIBUTIONS: Partial<
  Record<string, GooglePhotoAttribution[]>
> = {
${lines.join('\n')}
};
`;
  await writeFile(GEN_ATTRS, body, 'utf8');
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  await loadDotEnv();
  const { dry, force, fillMissing, noReport, slug } = parseArgs(process.argv.slice(2));
  const apiKey = googleApiKey();

  let places: Place[] = [...SEED_PLACES];
  if (slug) {
    places = places.filter((p) => p.slug === slug);
    if (!places.length) {
      console.error(`No place for slug "${slug}".`);
      process.exit(1);
    }
  }

  if (fillMissing) {
    const before = places.length;
    const next: Place[] = [];
    for (const p of places) {
      if (await hasNonGoogleVenueFile(p.slug)) continue;
      next.push(p);
    }
    places = next;
    console.log(
      `--fill-missing: skipped ${before - places.length} with existing public/images/venues/{slug}.*`,
    );
  }

  if (!apiKey && !dry) {
    console.error(
      'Missing Google key. Set GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY in .env',
    );
    process.exit(1);
  }
  if (dry && !apiKey) {
    for (const p of places) console.log(`${p.slug}\t${textQueryForPlace(p)}`);
    console.log(
      '\nEnable Places API (New) in Google Cloud, add GOOGLE_MAPS_API_KEY to .env, then re-run.',
    );
    process.exit(0);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const imageMap: Record<string, string> = {};
  const attrMap: Record<string, GoogleAttribution[]> = {};
  const rows: GooglePhotoRow[] = [];

  for (const existing of await readdir(OUT_DIR, { withFileTypes: true }).catch(
    () => [] as Dirent[],
  )) {
    if (!existing.isFile()) continue;
    const name = existing.name;
    if (!name.includes('.') || name.startsWith('.')) continue;
    const slugPart = name.replace(/\.[^.]+$/, '');
    imageMap[slugPart] = `/images/venues/google/${name}`;
  }

  console.log(`Places to process: ${places.length}${slug ? ` (filter: ${slug})` : ''}`);

  for (const p of places) {
    const q = textQueryForPlace(p);

    if (!force) {
      const onDisk = await findExisting(p.slug);
      if (onDisk) {
        const base = path.basename(onDisk);
        imageMap[p.slug] = `/images/venues/google/${base}`;
        console.log(`[skip exists] ${p.slug}`);
        rows.push({ slug: p.slug, name: p.name, textQuery: q, status: 'skip_exists' });
        continue;
      }
    } else {
      const onDisk = await findExisting(p.slug);
      if (onDisk) await rm(onDisk, { force: true });
    }

    let photoName: string | null = null;
    let attrs: GoogleAttribution[] = [];
    let placesDetail: string | undefined;

    try {
      if (apiKey) {
        const got = await textSearchFirstPhoto(apiKey, q);
        if (got) {
          photoName = got.photoName;
          attrs = got.attributions;
        }
        await sleep(DELAY_MS);
      }
    } catch (e) {
      placesDetail = e instanceof Error ? e.message : String(e);
      console.warn(`[places error] ${p.slug}:`, placesDetail);
    }

    if (dry) {
      console.log(`[dry] ${p.slug} ← "${q}"${photoName ? ' → photo resolved' : ' → no photo'}`);
      rows.push({
        slug: p.slug,
        name: p.name,
        textQuery: q,
        status: 'dry_preview',
        detail: placesDetail,
      });
      continue;
    }

    if (!photoName) {
      console.warn(`[no photo] ${p.slug}`);
      rows.push({
        slug: p.slug,
        name: p.name,
        textQuery: q,
        status: placesDetail ? 'places_error' : 'no_photo',
        detail: placesDetail,
      });
      continue;
    }

    const bytes = await fetchPhotoBytes(apiKey!, photoName);
    if (!bytes) {
      console.warn(`[download failed] ${p.slug}`);
      rows.push({ slug: p.slug, name: p.name, textQuery: q, status: 'download_failed' });
      continue;
    }

    const filename = `${p.slug}.${bytes.ext}`;
    await writeFile(path.join(OUT_DIR, filename), bytes.buffer);
    imageMap[p.slug] = `/images/venues/google/${filename}`;
    if (attrs.length) attrMap[p.slug] = attrs;
    console.log(`[ok] ${p.slug} → google/${filename}`);
    rows.push({ slug: p.slug, name: p.name, textQuery: q, status: 'ok' });
  }

  if (!dry) {
    const seedSlugs = new Set(SEED_PLACES.map((x) => x.slug));
    const imgFiltered: Record<string, string> = {};
    for (const [k, v] of Object.entries(imageMap)) {
      if (seedSlugs.has(k)) imgFiltered[k] = v;
    }
    const attrFiltered: Record<string, GoogleAttribution[]> = {};
    for (const [k, v] of Object.entries(attrMap)) {
      if (seedSlugs.has(k)) attrFiltered[k] = v;
    }
    await writeImageGen(imgFiltered);
    await writeAttrGen(attrFiltered);
    console.log(`\nWrote ${GEN_IMAGES}`);
    console.log(`Wrote ${GEN_ATTRS} (${Object.keys(attrFiltered).length} with attributions)`);
    if (!noReport) {
      await writeGoogleRunReport(rows, { fillMissing });
      const n = rows.filter((r) =>
        ['places_error', 'no_photo', 'download_failed'].includes(r.status),
      ).length;
      console.log(`Report: ${REPORT_FILE} (${n} slug(s) need follow-up)`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
