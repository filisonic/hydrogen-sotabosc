/**
 * Auto-sync events from URL list into `auto-import.events.json`.
 * - Fetches structured data (JSON-LD Event) via Firecrawl HTML scrape
 * - Scores alignment with Sotabosc checklist
 * - Upserts events by stable ID
 * - Prunes expired events on every run
 *
 * Usage:
 *   npx tsx scripts/sync-auto-events.ts --file=reports/bulk-urls.txt
 *   npx tsx scripts/sync-auto-events.ts --url=https://event-page
 *
 * Flags:
 *   --min-score=68    Minimum alignment score
 *   --allow-review    Include verdict=review entries
 *   --dry-run         Log decisions without writing file
 */

import { createHash } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { CityEvent, Place } from '../app/lib/directory/types';
import { SEED_PLACES } from '../app/lib/directory/seed.server';
import { firecrawlApiKeyFromEnv, loadDotEnvFromRoot, PROJECT_ROOT } from './lib/project-env';
import { scoreAlignment, slugifyHint } from './lib/sotabosc-alignment';

const AUTO_EVENTS_FILE = path.join(PROJECT_ROOT, 'app', 'lib', 'directory', 'auto-import.events.json');
const FIRECRAWL_SCRAPE = 'https://api.firecrawl.dev/v1/scrape';
const UNKNOWN_PLACE_ID = 'p_auto_unknown';

type MaybeEvent = {
  title: string;
  summary: string;
  startsAt: string;
  endsAt?: string;
  placeName?: string;
  sourceUrl: string;
};

function parseArgs(argv: string[]) {
  const urls: string[] = [];
  let file: string | undefined;
  let minScore = 68;
  let allowReview = false;
  let dryRun = false;

  for (const a of argv) {
    if (a.startsWith('--url=')) urls.push(a.slice(6).trim());
    else if (a.startsWith('--file=')) file = a.slice(7).trim();
    else if (a.startsWith('--min-score=')) minScore = Number(a.slice(12)) || 0;
    else if (a === '--allow-review') allowReview = true;
    else if (a === '--dry-run') dryRun = true;
  }
  return { urls, file, minScore, allowReview, dryRun };
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function stableEventId(sourceUrl: string): string {
  const h = createHash('sha256').update(sourceUrl).digest('hex').slice(0, 12);
  return `e_ai_${h}`;
}

function parseJsonMaybe(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function flattenJsonLd(node: unknown): Record<string, unknown>[] {
  if (!node || typeof node !== 'object') return [];
  const asObj = node as Record<string, unknown>;
  const out: Record<string, unknown>[] = [];
  if (Array.isArray(node)) {
    for (const n of node) out.push(...flattenJsonLd(n));
    return out;
  }
  if (Array.isArray(asObj['@graph'])) {
    out.push(...flattenJsonLd(asObj['@graph']));
  }
  out.push(asObj);
  return out;
}

function extractJsonLdObjects(html: string): Record<string, unknown>[] {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const objs: Record<string, unknown>[] = [];
  for (const m of matches) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    const parsed = parseJsonMaybe(raw);
    if (!parsed) continue;
    objs.push(...flattenJsonLd(parsed));
  }
  return objs;
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function parseEventFromJsonLd(jsonLd: Record<string, unknown>[], sourceUrl: string): MaybeEvent | null {
  const eventObj = jsonLd.find((obj) => {
    const t = obj['@type'];
    if (Array.isArray(t)) return t.some((x) => String(x).toLowerCase() === 'event');
    return String(t ?? '').toLowerCase() === 'event';
  });
  if (!eventObj) return null;

  const title = asString(eventObj.name) ?? asString(eventObj.headline);
  const startsAt = asString(eventObj.startDate);
  const endsAt = asString(eventObj.endDate);
  const description = asString(eventObj.description) ?? '';

  let placeName: string | undefined;
  const loc = eventObj.location;
  if (typeof loc === 'string') {
    placeName = loc;
  } else if (loc && typeof loc === 'object') {
    const locObj = loc as Record<string, unknown>;
    placeName = asString(locObj.name) ?? asString(locObj.address);
  }

  if (!title || !startsAt) return null;
  return {
    title,
    summary: description.slice(0, 500),
    startsAt,
    endsAt,
    placeName,
    sourceUrl,
  };
}

async function scrapeHtmlWithFirecrawl(url: string, apiKey: string): Promise<string | null> {
  const res = await fetch(FIRECRAWL_SCRAPE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ['html', 'markdown'],
      onlyMainContent: false,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Firecrawl HTTP ${res.status}: ${text.slice(0, 300)}`);
  const json = parseJsonMaybe(text) as { data?: { html?: string; markdown?: string } } | null;
  if (!json?.data) return null;
  return json.data.html ?? null;
}

function placeHostIndex(places: Place[]): Map<string, Place> {
  const m = new Map<string, Place>();
  for (const p of places) {
    if (!p.website) continue;
    try {
      const host = new URL(p.website).hostname.replace(/^www\./, '');
      if (!m.has(host)) m.set(host, p);
    } catch {
      // ignore invalid websites
    }
  }
  return m;
}

function resolvePlace(placeName: string | undefined, sourceUrl: string, places: Place[]): Place | null {
  const hostMap = placeHostIndex(places);
  try {
    const host = new URL(sourceUrl).hostname.replace(/^www\./, '');
    const hostHit = hostMap.get(host);
    if (hostHit) return hostHit;
  } catch {
    // ignore
  }

  if (!placeName) return null;
  const q = normalize(placeName);
  if (!q) return null;
  const byName = places.find((p) => {
    const n = normalize(p.name);
    return n.includes(q) || q.includes(n);
  });
  return byName ?? null;
}

function isExpired(event: Pick<CityEvent, 'startsAt' | 'endsAt'>, nowMs = Date.now()): boolean {
  const endMs = new Date(event.endsAt ?? event.startsAt).getTime();
  return Number.isFinite(endMs) ? endMs < nowMs : false;
}

async function readAutoEvents(): Promise<CityEvent[]> {
  const raw = await readFile(AUTO_EVENTS_FILE, 'utf8');
  const parsed = parseJsonMaybe(raw);
  return Array.isArray(parsed) ? (parsed as CityEvent[]) : [];
}

async function writeAutoEvents(events: CityEvent[]) {
  const tmp = `${AUTO_EVENTS_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, `${JSON.stringify(events, null, 2)}\n`, 'utf8');
  await rename(tmp, AUTO_EVENTS_FILE);
}

function sortByStart(events: CityEvent[]): CityEvent[] {
  return [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

function toIsoLocalish(input: string): string {
  const d = new Date(input);
  if (!Number.isFinite(d.getTime())) return input;
  return d.toISOString().slice(0, 16);
}

async function main() {
  await loadDotEnvFromRoot();
  const { urls: argUrls, file, minScore, allowReview, dryRun } = parseArgs(process.argv.slice(2));

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

  const apiKey = firecrawlApiKeyFromEnv();
  if (!apiKey) {
    console.error('Missing FIRECRAWL_API_KEY in .env (required for auto event sync).');
    process.exit(1);
  }

  const current = await readAutoEvents();
  const prunedCurrent = current.filter((e) => !isExpired(e));
  const byId = new Map(prunedCurrent.map((e) => [e.id, e]));

  if (urls.length === 0) {
    const finalEvents = sortByStart([...byId.values()]).filter((e) => !isExpired(e));
    if (dryRun) {
      console.log(`[dry-run] prune-only: ${finalEvents.length} active auto events`);
      return;
    }
    await writeAutoEvents(finalEvents);
    console.log(`Prune-only: ${finalEvents.length} active events in auto-import.events.json`);
    return;
  }

  for (const url of urls) {
    let html: string | null = null;
    try {
      html = await scrapeHtmlWithFirecrawl(url, apiKey);
    } catch (e) {
      console.log(`SKIP ${url} scrape_error=${e instanceof Error ? e.message : String(e)}`);
      continue;
    }
    if (!html) {
      console.log(`SKIP ${url} no_html`);
      continue;
    }

    const jsonLd = extractJsonLdObjects(html);
    const parsed = parseEventFromJsonLd(jsonLd, url);
    if (!parsed) {
      console.log(`SKIP ${url} no_event_jsonld`);
      continue;
    }

    const alignment = scoreAlignment(
      `${parsed.title}\n${parsed.summary}\n${parsed.placeName ?? ''}\n${url}`,
    );
    const allowedVerdict =
      alignment.verdict === 'recommend_seed' || (allowReview && alignment.verdict === 'review');
    if (!allowedVerdict || alignment.score < minScore || alignment.cautionFlags.length) {
      console.log(
        `REJECT ${url} score=${alignment.score} verdict=${alignment.verdict} cautions=${alignment.cautionFlags.join(',') || 'none'}`,
      );
      continue;
    }

    const place = resolvePlace(parsed.placeName, url, SEED_PLACES);
    const id = stableEventId(url);
    const slugBase = slugifyHint(parsed.title) || slugifyHint(id);
    const slug = slugBase || id;

    const event: CityEvent = {
      id,
      slug,
      title: parsed.title.slice(0, 120),
      summary: (parsed.summary || 'Auto-imported event').slice(0, 320),
      startsAt: toIsoLocalish(parsed.startsAt),
      ...(parsed.endsAt ? { endsAt: toIsoLocalish(parsed.endsAt) } : {}),
      placeId: place?.id ?? UNKNOWN_PLACE_ID,
      placeName: place?.name ?? parsed.placeName ?? 'TBA',
      primaryDomain: alignment.suggestedPrimaryDomain,
      tags: ['auto-imported', ...alignment.suggestedCategories],
    };

    if (isExpired(event)) {
      console.log(`SKIP ${url} already_expired`);
      continue;
    }

    byId.set(id, event);
    console.log(`UPSERT ${event.slug} score=${alignment.score} place=${event.placeName}`);
  }

  const finalEvents = sortByStart([...byId.values()]).filter((e) => !isExpired(e));
  if (dryRun) {
    console.log(`[dry-run] final active auto events: ${finalEvents.length}`);
    return;
  }
  await writeAutoEvents(finalEvents);
  console.log(`Wrote ${finalEvents.length} active events to auto-import.events.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

