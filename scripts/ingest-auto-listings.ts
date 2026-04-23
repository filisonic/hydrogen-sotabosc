/**
 * Fully automated path: URL → scrape → alignment gate → append to auto-import.places.json.
 *
 * Requires FIRECRAWL_API_KEY in `.env` for reliable results (SPAs / ticket sites).
 *
 * Usage:
 *   npx tsx scripts/ingest-auto-listings.ts --file=urls-to-ingest.txt
 *   npx tsx scripts/ingest-auto-listings.ts --url=https://example.com/venue
 *
 * Gates (see scripts/lib/place-alignment.ts):
 *   --min-score=70       Minimum score for `recommend_seed` rows
 *   --allow-review       Also accept `review` verdict at minReviewScore (defaults to minScore)
 *   --dry-run            Print decisions without writing JSON
 *   --no-firecrawl       HTTP-only fetch
 *
 * After ingest: `npm run build` — data merges via `seed.server.ts`.
 *
 * Limits: address/neighborhood/city stay empty until you enrich (or add a geocoder later).
 * Events: use `draft:listing` + manual placeId, or extend this script once venue URLs are extractable.
 */

import { createHash } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { Place } from '../app/lib/directory/types';
import { SEED_PLACES } from '../app/lib/directory/seed.server';
import { fetchPageText } from './lib/fetch-page-text';
import { loadDotEnvFromRoot, firecrawlApiKeyFromEnv, PROJECT_ROOT } from './lib/project-env';
import { passesIngestGate } from './lib/place-alignment';
import { scoreAlignment, slugifyHint } from './lib/sotabosc-alignment';

const AUTO_PLACES_FILE = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'auto-import.places.json');

function safeHostname(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return 'invalid-url';
  }
}

function parseArgs(argv: string[]) {
  const urls: string[] = [];
  let file: string | undefined;
  let minScore = 70;
  let allowReview = false;
  let dryRun = false;
  let noFirecrawl = false;

  for (const a of argv) {
    if (a.startsWith('--url=')) urls.push(a.slice(6).trim());
    else if (a.startsWith('--file=')) file = a.slice(7).trim();
    else if (a.startsWith('--min-score=')) minScore = Number(a.slice(12)) || 0;
    else if (a === '--allow-review') allowReview = true;
    else if (a === '--dry-run') dryRun = true;
    else if (a === '--no-firecrawl') noFirecrawl = true;
  }
  return { urls, file, minScore, allowReview, dryRun, noFirecrawl };
}

function stablePlaceId(slug: string): string {
  const h = createHash('sha256').update(slug).digest('hex').slice(0, 12);
  return `p_ai_${h}`;
}

function buildPlace(url: string, title: string, excerpt: string, slug: string, a: ReturnType<typeof scoreAlignment>): Place {
  const summary =
    excerpt.slice(0, 280).replace(/\s+/g, ' ').trim() + (excerpt.length > 280 ? '…' : '');
  return {
    id: stablePlaceId(slug),
    slug,
    name: title.slice(0, 120),
    summary,
    address: '',
    neighborhood: '',
    city: '',
    categories: a.suggestedCategories,
    primaryDomain: a.suggestedPrimaryDomain,
    tags: ['auto-ingested'],
    website: url,
  };
}

async function readAutoPlaces(): Promise<Place[]> {
  const raw = await readFile(AUTO_PLACES_FILE, 'utf8');
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed as Place[];
}

async function writeAutoPlaces(places: Place[]) {
  const tmp = `${AUTO_PLACES_FILE}.${process.pid}.tmp`;
  const body = `${JSON.stringify(places, null, 2)}\n`;
  await writeFile(tmp, body, 'utf8');
  await rename(tmp, AUTO_PLACES_FILE);
}

async function main() {
  await loadDotEnvFromRoot();
  const argv = process.argv.slice(2);
  const { urls: argUrls, file, minScore, allowReview, dryRun, noFirecrawl } = parseArgs(argv);

  let urls = [...argUrls];
  if (file) {
    const text = await readFile(path.resolve(PROJECT_ROOT, file), 'utf8');
    urls.push(
      ...text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .filter((l) => !l.startsWith('#')),
    );
  }
  urls = [...new Set(urls)];

  if (urls.length === 0) {
    console.error('No URLs. Use --url= or --file=. See script header.');
    process.exit(1);
  }

  const apiKey = noFirecrawl ? undefined : firecrawlApiKeyFromEnv();
  if (!apiKey && !noFirecrawl) {
    console.warn('[ingest] No FIRECRAWL_API_KEY — HTTP fallback often yields empty SPA content.');
  }

  const autoPlaces = await readAutoPlaces();
  const existingSlugs = new Set([
    ...SEED_PLACES.map((p) => p.slug),
    ...autoPlaces.map((p) => p.slug),
  ]);

  const added: Place[] = [];
  const log: string[] = [];

  for (const url of urls) {
    const fetched = await fetchPageText(url, { apiKey, noFirecrawl });
    if (fetched.error || !fetched.text.trim()) {
      log.push(`SKIP ${url}  fetch=${fetched.error ?? 'empty body'}`);
      continue;
    }
    const alignment = scoreAlignment(fetched.text);
    const excerpt = fetched.text.slice(0, 1200);
    const slug = slugifyHint(fetched.title) || slugifyHint(safeHostname(url));
    if (!slug) {
      log.push(`SKIP ${url}  no slug`);
      continue;
    }
    if (existingSlugs.has(slug)) {
      log.push(`SKIP ${url}  duplicate slug=${slug}`);
      continue;
    }

    const ok = passesIngestGate(alignment, { minScore, allowReview });
    if (!ok) {
      log.push(
        `REJECT ${url}  score=${alignment.score} verdict=${alignment.verdict} cautions=${alignment.cautionFlags.join(',') || 'none'}`,
      );
      continue;
    }

    const place = buildPlace(url, fetched.title, excerpt, slug, alignment);
    log.push(`ADD ${slug}  score=${alignment.score} verdict=${alignment.verdict}`);
    added.push(place);
    existingSlugs.add(slug);
  }

  for (const line of log) console.log(line);

  if (dryRun) {
    console.log(`[dry-run] Would add ${added.length} place(s).`);
    return;
  }

  if (added.length === 0) {
    console.log('No new rows written.');
    return;
  }

  await writeAutoPlaces([...autoPlaces, ...added]);
  console.log(`Wrote ${added.length} place(s) to app/lib/directory/auto-import.places.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
