/**
 * Auto-sync events from URL list into `auto-import.events.json`.
 * Eventbrite and other SPAs rarely ship JSON-LD, so Firecrawl also returns
 * JSON extract + markdown. Dated Barcelona listings can pass with --allow-review.
 *
 * Usage:
 *   npx tsx scripts/sync-auto-events.ts --file=reports/bulk-urls.txt
 *   npx tsx scripts/sync-auto-events.ts --url=https://event-page
 *
 * Flags:
 *   --min-score=68    Minimum alignment score
 *   --allow-review    Include verdict=review entries
 *   --max=40          Cap how many queue URLs to scrape
 *   --dry-run         Log decisions without writing file
 */

import { createHash } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { CityEvent, Place } from '../app/lib/directory/types';
import { SEED_PLACES } from '../app/lib/directory/seed.server';
import { canonicalizeEventUrl, urlsFromQueueText } from './lib/event-queue';
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
  let maxUrls = 40;

  for (const a of argv) {
    if (a.startsWith('--url=')) urls.push(a.slice(6).trim());
    else if (a.startsWith('--file=')) file = a.slice(7).trim();
    else if (a.startsWith('--min-score=')) minScore = Number(a.slice(12)) || 0;
    else if (a.startsWith('--max=')) maxUrls = Number(a.slice(6)) || 40;
    else if (a === '--allow-review') allowReview = true;
    else if (a === '--dry-run') dryRun = true;
  }
  return { urls, file, minScore, allowReview, dryRun, maxUrls };
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

function eventFromExtract(raw: Record<string, unknown> | null | undefined, sourceUrl: string): MaybeEvent | null {
  if (!raw) return null;
  const node =
    raw.event && typeof raw.event === 'object'
      ? (raw.event as Record<string, unknown>)
      : raw;
  const title = asString(node.title) ?? asString(node.name);
  const startsAt = asString(node.startsAt) ?? asString(node.startDate) ?? asString(node.start);
  if (!title || !startsAt) return null;
  const loc = node.location;
  const locName =
    typeof loc === 'string'
      ? loc
      : loc && typeof loc === 'object'
        ? asString((loc as Record<string, unknown>).name)
        : undefined;
  return {
    title,
    summary: (asString(node.summary) ?? asString(node.description) ?? '').slice(0, 500),
    startsAt,
    endsAt: asString(node.endsAt) ?? asString(node.endDate),
    placeName: asString(node.placeName) ?? asString(node.venue) ?? locName,
    sourceUrl,
  };
}

function eventFromMarkdown(md: string | undefined, sourceUrl: string): MaybeEvent | null {
  if (!md) return null;
  const title = md.match(/^#{1,2}\s+(.+)$/m)?.[1]?.replace(/\s+/g, ' ').trim();
  if (!title || title.length < 4) return null;
  const iso = md.match(
    /\b(20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?)\b/,
  );
  if (iso) {
    return { title: title.slice(0, 120), summary: '', startsAt: iso[1], sourceUrl };
  }
  const longDate = md.match(
    /\b((?:January|February|March|April|May|June|July|August|September|October|November|December|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{1,2},?\s+(?:de\s+)?20\d{2})\b/i,
  );
  const time = md.match(/\b(\d{1,2}:\d{2}\s*(?:AM|PM|h)?)\b/i);
  if (longDate) {
    const startsAt = `${longDate[1]} ${time?.[1] ?? '12:00 PM'}`;
    const d = new Date(startsAt);
    if (Number.isFinite(d.getTime())) {
      return { title: title.slice(0, 120), summary: '', startsAt: d.toISOString(), sourceUrl };
    }
  }
  return null;
}

async function scrapeEventPage(
  url: string,
  apiKey: string,
): Promise<{ html: string | null; markdown: string | null; extracted: MaybeEvent | null }> {
  const res = await fetch(FIRECRAWL_SCRAPE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ['html', 'markdown', 'json'],
      onlyMainContent: false,
      waitFor: 2500,
      jsonOptions: {
        prompt:
          'Extract one public event: title, start datetime (ISO 8601), optional end datetime, venue name, and a short summary.',
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            startsAt: { type: 'string' },
            endsAt: { type: 'string' },
            placeName: { type: 'string' },
            summary: { type: 'string' },
          },
          required: ['title', 'startsAt'],
        },
      },
    }),
  });
  const text = await res.text();
  if (res.status === 429) throw new Error(`Firecrawl HTTP 429: ${text.slice(0, 200)}`);
  if (!res.ok) throw new Error(`Firecrawl HTTP ${res.status}: ${text.slice(0, 300)}`);
  const json = parseJsonMaybe(text) as {
    data?: {
      html?: string;
      markdown?: string;
      json?: Record<string, unknown>;
      extract?: Record<string, unknown>;
    };
  } | null;
  const extracted =
    eventFromExtract(json?.data?.json, url) ??
    eventFromExtract(json?.data?.extract, url) ??
    eventFromMarkdown(json?.data?.markdown, url);
  return { html: json?.data?.html ?? null, markdown: json?.data?.markdown ?? null, extracted };
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
  if (!q || q.length < 4) return null;
  const byName = places.find((p) => {
    const n = normalize(p.name);
    if (n === q) return true;
    if (n.length < 6 || q.length < 6) return false;
    return n.includes(q) || q.includes(n);
  });
  return byName ?? null;
}

function inBarcelonaCity(text: string): boolean {
  return /barcelona|barceloneta|poblenou|gr[aà]cia|eixample|raval|sants|el born|montju|poble[- ]?sec|sarri[aà]|horta|poble nou/i.test(
    text,
  );
}

function outsideBarcelona(text: string, url = ''): boolean {
  if (/costa[- ]brava|besal[uú]|writing-in-sitges/i.test(url)) return true;
  return /costa brava|besal[uú]|sitges/i.test(text) && !inBarcelonaCity(text);
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
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const g = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  const hour = g('hour') === '24' ? '00' : g('hour');
  return `${g('year')}-${g('month')}-${g('day')}T${hour}:${g('minute')}`;
}

async function main() {
  await loadDotEnvFromRoot();
  const { urls: argUrls, file, minScore, allowReview, dryRun, maxUrls } = parseArgs(process.argv.slice(2));

  let urls = argUrls.map((u) => canonicalizeEventUrl(u)).filter((u): u is string => Boolean(u));
  if (file) {
    const text = await readFile(path.resolve(PROJECT_ROOT, file), 'utf8');
    urls.push(...urlsFromQueueText(text));
  }
  urls = [...new Set(urls)].slice(0, maxUrls);

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

  const pauseMs = 7500;

  for (const url of urls) {
    let html: string | null = null;
    let markdown: string | null = null;
    let extracted: MaybeEvent | null = null;
    let scrapeError: string | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const page = await scrapeEventPage(url, apiKey);
        html = page.html;
        markdown = page.markdown;
        extracted = page.extracted;
        scrapeError = null;
        break;
      } catch (e) {
        scrapeError = e instanceof Error ? e.message : String(e);
        if (scrapeError.includes('429') && attempt < 2) {
          console.log(`WAIT ${url} rate_limited retry=${attempt + 1}`);
          await new Promise((r) => setTimeout(r, 20_000));
          continue;
        }
        break;
      }
    }
    if (scrapeError) {
      console.log(`SKIP ${url} scrape_error=${scrapeError}`);
      await new Promise((r) => setTimeout(r, pauseMs));
      continue;
    }

    const jsonLd = html ? extractJsonLdObjects(html) : [];
    const parsed = parseEventFromJsonLd(jsonLd, url) ?? extracted;
    if (!parsed) {
      console.log(`SKIP ${url} no_event_data`);
      await new Promise((r) => setTimeout(r, pauseMs));
      continue;
    }

    const scoreText = `${parsed.title}\n${parsed.summary}\n${parsed.placeName ?? ''}\n${markdown ?? ''}\n${url}`;
    if (outsideBarcelona(scoreText, url)) {
      console.log(`SKIP ${url} outside_barcelona`);
      await new Promise((r) => setTimeout(r, pauseMs));
      continue;
    }

    const alignment = scoreAlignment(scoreText);
    const barcelonaEvent = inBarcelonaCity(scoreText) && Boolean(parsed.startsAt);
    const allowedVerdict =
      alignment.verdict === 'recommend_seed' ||
      (allowReview && alignment.verdict === 'review') ||
      (allowReview && barcelonaEvent && alignment.cautionFlags.length === 0);
    if (!allowedVerdict || alignment.cautionFlags.length || (!barcelonaEvent && alignment.score < minScore)) {
      console.log(
        `REJECT ${url} score=${alignment.score} verdict=${alignment.verdict} cautions=${alignment.cautionFlags.join(',') || 'none'}`,
      );
      await new Promise((r) => setTimeout(r, pauseMs));
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
      sourceUrl: url,
    };

    if (isExpired(event)) {
      console.log(`SKIP ${url} already_expired startsAt=${event.startsAt}`);
      await new Promise((r) => setTimeout(r, pauseMs));
      continue;
    }

    byId.set(id, event);
    console.log(`UPSERT ${event.slug} score=${alignment.score} place=${event.placeName}`);
    await new Promise((r) => setTimeout(r, pauseMs));
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

